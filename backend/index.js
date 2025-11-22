const express = require('express');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres', 
    host: process.env.DB_HOST || 'localhost',
    database: 'portfolio', 
    password: 'root', 
    port: 5432,
});

const kafka = new Kafka({ clientId: 'api', brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const producer = kafka.producer();

const init = async () => {
    await producer.connect();
    console.log('Kafka Producer connected');
};
init();

// POST- Add Trade (Publish to Kafka)
app.post('/trades', async (req, res) => {
    const { symbol, qty, price } = req.body;
    
    if (!symbol || !qty || !price) return res.status(400).send('Missing fields');

    await producer.send({
        topic: 'trades',
        messages: [{ value: JSON.stringify({ symbol, qty: parseFloat(qty), price: parseFloat(price), timestamp: new Date() }) }],
    });

    res.json({ status: 'queued' });
});

// GET- List Positions (Aggregated from open Lots)
app.get('/positions', async (req, res) => {
    const result = await pool.query(`
        SELECT 
            symbol, 
            SUM(remaining_qty) as total_qty, 
            SUM(remaining_qty * price) / NULLIF(SUM(remaining_qty), 0) as avg_cost
        FROM lots 
        WHERE remaining_qty > 0 
        GROUP BY symbol
    `);
    res.json(result.rows);
});

// GET- Realized P&L
app.get('/pnl', async (req, res) => {
    const result = await pool.query('SELECT * FROM realized_pnl ORDER BY created_at DESC');
    res.json(result.rows);
});

app.listen(3001, () => console.log('API running on 3001'));