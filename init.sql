CREATE TABLE lots (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10),
    qty DECIMAL,
    remaining_qty DECIMAL,
    price DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE realized_pnl (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10),
    qty DECIMAL,
    buy_price DECIMAL,
    sell_price DECIMAL,
    realized_pnl DECIMAL,
    created_at TIMESTAMP DEFAULT NOW()
);