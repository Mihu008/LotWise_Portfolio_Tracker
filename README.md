📈 Lotwise Portfolio Tracker

A full-stack portfolio tracking system demonstrating FIFO lot matching, realized P&L computation, and stream-based trade processing using Node.js, Next.js, Kafka, and Postgres.

This project implements a minimal but production-inspired workflow for recording trades, tracking open positions, and computing realized P&L through a background worker.

🚀 Tech Stack
Layer	Technology
Frontend	Next.js (React), TypeScript
Backend API	Node.js (Express), Postgres
Worker	Node.js, Kafka consumer
Messaging	Apache Kafka
Database	PostgreSQL
Containerization	Docker + Docker Compose

-------------------------------------------------------------------------------------------------------------------

🧠 Objective

Build a lotwise portfolio tracker where:

Buy trades (positive qty) create new lots.

Sell trades (negative qty) close lots using FIFO.

System maintains open positions and realized P&L.

Frontend provides UI for adding trades and viewing results.

-------------------------------------------------------------------------------------------------------------------

📘 Contents

Data Model

FIFO Matching Logic

Running Locally

API Endpoints

Assumptions

Test Scenario

Deployment Options

-------------------------------------------------------------------------------------------------------------------


🗄️ Data Model

The database schema (defined in init.sql) contains two main tables:

1. lots

Stores all buy lots and remaining open quantities.

Column	Type	Description
id	serial PK	Unique identifier
symbol	varchar(10)	Ticker
qty	decimal	Buy quantity (positive)
remaining_qty	decimal	Unmatched quantity
price	decimal	Buy price
created_at	timestamp	FIFO order basis
2. realized_pnl

Stores each matched portion of a sell trade.

Column	Type	Description
id	serial PK	Unique identifier
symbol	varchar(10)	Ticker
qty	decimal	Matched quantity
buy_price	decimal	Price of matched buy
sell_price	decimal	Sell price
realized_pnl	decimal	(sell_price − buy_price) × qty
created_at	timestamp	Timestamp

-------------------------------------------------------------------------------------------------------------------

📌 Relationships

lots represents open positions.

realized_pnl records the result of closing lots.

remaining_qty is reduced as lots are consumed.

-------------------------------------------------------------------------------------------------------------------

🔁 FIFO Matching Logic

The worker processes all trades streamed through Kafka.

Buy Trade

Insert a new row into lots

Set remaining_qty = qty

Sell Trade

Convert negative qty → positive sell_qty

Query open lots for the symbol (FIFO by created_at)

Loop through lots until the entire sell amount is matched:

matched = min(lot.remaining_qty, sell_qty_remaining)

Insert realized_pnl entry

Reduce lot.remaining_qty

Reduce sell_qty_remaining

Example

If you buy 100 @150, then 50 @160, then sell 80 @170:

20 left from first lot

50 left from second lot

Correct realized P&L entries created

-------------------------------------------------------------------------------------------------------------------

🔐 Database Configuration (IMPORTANT)

This project uses PostgreSQL for storing lots and realized P&L.
You must configure the database credentials before running the backend or worker services.

✅ 1. Environment Files

Each service that connects to the database requires a .env file:

backend/.env

worker/.env

Use the provided .env.example files as a template:

cp backend/.env.example backend/.env
cp worker/.env.example worker/.env

🔧 2. Required Environment Variables

Set the following variables in both .env files:

POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

KAFKA_BROKER=localhost:9092


⚠️ Do NOT commit real passwords or .env files to Git.
The repo should only include .env.example.

-------------------------------------------------------------------------------------------------------------------

🐳 Running with Docker

If you use Docker Compose, database credentials must match the variables specified in:

docker-compose.yml


Default local-development database configuration:

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portfolio
POSTGRES_HOST=postgres
POSTGRES_PORT=5432


The database will auto-initialize using init.sql.

-------------------------------------------------------------------------------------------------------------------

🛠️ Running Locally
Prerequisites

Docker & Docker Compose
OR

Node.js 20+ + a running Postgres instance

-------------------------------------------------------------------------------------------------------------------

▶️ Using Docker (recommended)
docker compose up -d --build


Services:

Service	URL / Port
Frontend	http://localhost:3000

Backend API	http://localhost:3001

Postgres	localhost:5432
Kafka	as configured in docker-compose

Stop:

docker compose down

-------------------------------------------------------------------------------------------------------------------

▶️ Running Without Docker
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

Worker
cd worker
npm install
node index.js


Database schema is auto-initialized using init.sql (or run manually if using external Postgres).

-------------------------------------------------------------------------------------------------------------------

📡 API Endpoints
POST /trades

Submit a trade:

{
  "symbol": "AAPL",
  "qty": 100,
  "price": 150
}

GET /positions

Returns open lots + aggregated positions.

GET /pnl

Returns realized P&L entries.

-------------------------------------------------------------------------------------------------------------------

📌 Assumptions

Single account only (no multi-portfolio support)

No brokerage fees or taxes

Quantities stored as DECIMAL (avoid float errors)

Sells assume enough buy lots exist (simple demo behavior)

Next.js uses Pages Router (pages/)

Type checking errors in .next excluded from build for convenience

Worker handles all FIFO logic; backend stores trades and publishes to Kafka

-------------------------------------------------------------------------------------------------------------------

🧪 Test Scenario
Action	Result
Buy 100 AAPL @ 150	Creates lot #1
Buy 50 AAPL @ 160	Creates lot #2
Sell 80 AAPL @ 170	FIFO closes 80 shares
Expected Outcome

Remaining open = 70 shares

20 left from the first lot

50 left from the second lot

Realized P&L recorded accurately

-------------------------------------------------------------------------------------------------------------------

🌐 Deployment Options (Free-Tier Friendly)
Component	Suggested Platform
Frontend	Vercel / Netlify
Backend API	Render / Railway / Heroku
Worker	Render Cron Worker / Railway Background Worker
Postgres	Supabase / Railway Postgres
Full stack	Docker on Fly.io or free VM

A test dataset or seed trades can be found in /seed or generated via the UI.

-------------------------------------------------------------------------------------------------------------------

🎯 Summary

This project demonstrates:

A clean lotwise accounting model

FIFO trade matching

Realized P&L computation

Event-driven architecture (Kafka)

Full stack integration via Next.js + Node + Postgres