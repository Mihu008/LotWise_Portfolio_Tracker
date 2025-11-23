const API_URL = 'http://localhost:3001/trades';

const trades = [
    // Buy First Lot
    { symbol: 'AAPL', qty: 100, price: 150 },
    // Buy Second Lot
    { symbol: 'AAPL', qty: 50, price: 160 },
    // Sell (Partial sell of Lot 1)
    { symbol: 'AAPL', qty: -80, price: 170 }
];

async function seed() {
    console.log(" Starting Trade Seed...");

    for (const trade of trades) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trade)
            });
            
            if (response.ok) {
                const type = trade.qty > 0 ? 'BUY ' : 'SELL';
                console.log(`✅ ${type} ${Math.abs(trade.qty)} ${trade.symbol} @ $${trade.price}`);
            } else {
                console.log(`❌ Failed: ${response.statusText}`);
            }

            // Critical: Wait 500ms between trades to ensure Kafka 
            // processes them in the correct timestamp order for FIFO.
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error("Error connecting to API:", error.message);
        }
    }

    console.log("✨ Seeding Complete! Check the UI.");
}

seed();