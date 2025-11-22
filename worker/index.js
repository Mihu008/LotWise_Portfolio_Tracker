const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'portfolio',
    password: 'root',
    port: 5432,
});

const kafka = new Kafka({ clientId: 'worker', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'trade-group' });

const processTrade = async (trade) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { symbol, qty, price } = trade;

        if (qty > 0) {
            // BUY: Create new Lot
            await client.query(
                'INSERT INTO lots (symbol, qty, remaining_qty, price) VALUES ($1, $2, $3, $4)',
                [symbol, qty, qty, price]
            );
            console.log(`[BUY] Created lot for ${symbol}`);
        } else {
            // SELL: FIFO Logic
            let qtyToSell = Math.abs(qty);
            const sellPrice = price;

            // Fetch open lots sorted by date (FIFO)
            const res = await client.query(
                'SELECT * FROM lots WHERE symbol = $1 AND remaining_qty > 0 ORDER BY created_at ASC FOR UPDATE',
                [symbol]
            );
            
            const openLots = res.rows;

            for (const lot of openLots) {
                if (qtyToSell <= 0) break;

                const available = parseFloat(lot.remaining_qty);
                const deduct = Math.min(available, qtyToSell);
                
                // Update Lot
                await client.query('UPDATE lots SET remaining_qty = remaining_qty - $1 WHERE id = $2', [deduct, lot.id]);

                // Calculate P&L
                const pnl = (sellPrice - parseFloat(lot.price)) * deduct;

                // Record P&L
                await client.query(
                    'INSERT INTO realized_pnl (symbol, qty, buy_price, sell_price, realized_pnl) VALUES ($1, $2, $3, $4, $5)',
                    [symbol, deduct, lot.price, sellPrice, pnl]
                );

                qtyToSell -= deduct;
            }
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error processing trade', e);
    } finally {
        client.release();
    }
};

const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'trades', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const trade = JSON.parse(message.value.toString());
            console.log('Processing:', trade);
            await processTrade(trade);
        },
    });
};

run();