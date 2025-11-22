import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Pager from '../components/Pager';

export default function RealizedPnL() {
  const [pnl, setPnl] = useState([]);
  const [loading, setLoading] = useState(true);

  const fmt = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/pnl');
      const data = await res.json();
      setPnl(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalRealized = pnl.reduce((acc, curr) => acc + parseFloat(curr.realized_pnl), 0);

  return (
    <>
      <Layout title="Realized P&L">
      <div className="space-y-6">
        
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Performance History</h1>
            <p className="text-slate-400 text-sm">Realized gains/losses based on FIFO logic</p>
          </div>
          <div className="text-right">
             <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Total P&L</div>
             <div className={`text-3xl font-mono font-bold ${totalRealized >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fmt(totalRealized)}
             </div>
          </div>
        </div>

        {/* P&L Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty Closed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Spread (Buy → Sell)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {pnl.length === 0 && !loading ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">No trade history yet.</td></tr>
                ) : (
                  pnl.map((p, i) => {
                    const profit = parseFloat(p.realized_pnl);
                    const isProfitable = profit >= 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                            {new Date(p.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{p.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600 font-mono">{p.qty}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-slate-400 font-mono">
                            {fmt(p.buy_price)} → {fmt(p.sell_price)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold font-mono ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfitable ? '+' : ''}{fmt(profit)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
      <Pager />
    </>
  );
}