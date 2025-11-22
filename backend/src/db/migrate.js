require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'postgres',
});

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        //Trade table
        await client.query(`
            CREATE TABLE IF NOT EXISTS Trade (
            id SERIAL PRIMARY KEY,
            sympbol VARCHAR(10) NOT NULL,
            qty DECIMAL(18, 4) NOT NULL,
            price DECIMAL(18, 4) NOT NULL,
            timestamp TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        //Lots Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS lots (
            id SERIAL PRIMARY KEY,
            symbol VARCHAR(10) NOT NULL,
            qty DECIMAL(18, 4) NOT NULL,
            remaining_qty DECIMAL(18, 4) NOT NULL,
            cost_basis DECIMAL(18, 4) NOT NULL,
            trade_id INTEGER REFERENCES trades(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )    
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS closed_lots (
            id SERIAL PRIMARY KEY,
            original_lot_id INTEGER REFERENCES lots(id),
            symbol VARCHAR(10) NOT NULL,
            qty_closed DECIMAL(18, 4) NOT NULL,
            cost_basis DECIMAL(18, 4) NOT NULL,
            sell_price DECIMAL(18, 4) NOT NULL,
            realized_pnl DECIMAL(18, 4) NOT NULL,
            sell_trade_id INTEGER REFERENCES trades(id),
            closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )    
        `);

        //closed_lots Table(realized P&L)
        await client.query(`
            CREATE TABLE IF NOT EXISTS closed_lots (
            id SERIAL PRIMARY KEY,
            original_lot_id INTEGER REFERENCES lots(id),
            symbol VARCHAR(10) NOT NULL,
            qty_closed DECIMAL(18, 4) NOT NULL,
            cost_basis DECIMAL(18, 4) NOT NULL,
            sell_price DECIMAL(18, 4) NOT NULL,
            realized_pnl DECIMAL(18, 4) NOT NULL,
            sell_trade_id INTEGER REFERENCES trades(id),
            closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_lots_symbol ON lots(symbol);
            CREATE INDEX IF NOT EXISTS idx_lots_remaining ON lots(remaining_qty);
            CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
            CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp);
            CREATE INDEX IF NOT EXISTS idx_closed_lots_symbol ON closed_lots(symbol);
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);