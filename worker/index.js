const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

const dbConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER || 'user',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'portfolio',
        password: process.env.DB_PASSWORD || 'password',
        port: 5432,
    };

if (dbConfig.host || dbConfig.connectionString) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(dbConfig);

const kafkaConfig = {
    clientId: 'worker',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
};

if (process.env.KAFKA_USERNAME) {
    kafkaConfig.ssl = true;
    kafkaConfig.sasl = {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    };
}

const kafka = new Kafka(kafkaConfig);
const consumer = kafka.consumer({ groupId: 'trade-group' });

const processTrade = async (trade) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { symbol, qty, price } = trade;

        if (qty > 0) {
            // BUY Logic
            await client.query(
                'INSERT INTO lots (symbol, qty, remaining_qty, price) VALUES ($1, $2, $3, $4)',
                [symbol, qty, qty, price]
            );
            console.log(`[BUY] Created lot for ${symbol}`);
        } else {
            // SELL Logic
            let qtyToSell = Math.abs(qty);
            const sellPrice = price;

            const res = await client.query(
                'SELECT * FROM lots WHERE symbol = $1 AND remaining_qty > 0 ORDER BY created_at ASC FOR UPDATE',
                [symbol]
            );
            
            const openLots = res.rows;

            for (const lot of openLots) {
                if (qtyToSell <= 0) break;

                const available = parseFloat(lot.remaining_qty);
                const deduct = Math.min(available, qtyToSell);
                
                await client.query('UPDATE lots SET remaining_qty = remaining_qty - $1 WHERE id = $2', [deduct, lot.id]);

                const pnl = (sellPrice - parseFloat(lot.price)) * deduct;

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
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'trades', fromBeginning: true });
        console.log(" Worker connected to Kafka");

        await consumer.run({
            eachMessage: async ({ message }) => {
                const trade = JSON.parse(message.value.toString());
                console.log('Processing:', trade);
                await processTrade(trade);
            },
        });
    } catch (err) {
        console.error(" Worker Kafka Error:", err);
        setTimeout(run, 5000);
    }
};

run();