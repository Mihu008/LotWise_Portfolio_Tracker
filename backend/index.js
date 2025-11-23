const express = require('express');
const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'postgres.railway.internal',
        database: process.env.DB_NAME || 'portfolio',
        password: process.env.DB_PASSWORD || 'JacYnCqDneODEaRjswUxebyTowKzSxks',
        port: 5432,
    };

if (dbConfig.host || dbConfig.connectionString) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(dbConfig);

const kafkaConfig = {
    clientId: 'api',
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
const producer = kafka.producer();

const initKafka = async () => {
    try {
        await producer.connect();
        console.log('✅ Kafka Producer connected');
    } catch (err) {
        console.error('❌ Kafka Connection Error:', err);
        setTimeout(initKafka, 5000);
    }
};
initKafka();

app.post('/trades', async (req, res) => {
    const { symbol, qty, price } = req.body;
    if (!symbol || !qty || !price) return res.status(400).send('Missing fields');

    try {
        const message = {
            symbol,
            qty: parseFloat(qty),
            price: parseFloat(price),
            timestamp: new Date()
        };

        await producer.send({
            topic: 'trades',
            messages: [{ value: JSON.stringify(message) }],
        });

        res.json({ status: 'queued' });
    } catch (err) {
        console.error("Kafka Send Error:", err);
        res.status(500).send("Failed to queue trade");
    }
});

// --- View Data Endpoints ---

app.get('/positions', async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/pnl', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM realized_pnl ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on ${PORT}`));