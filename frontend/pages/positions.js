import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Pager from '../components/Pager';

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formatting helper
  const fmt = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/positions');
      const data = await res.json();
      setPositions(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Layout title="Open Positions">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-700">Current Holdings</h2>
          <span className="text-xs bg-white text-slate-600 px-2 py-1 rounded border border-slate-200 shadow-sm">
            {loading ? 'Syncing...' : `${positions.length} Active Assets`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {positions.length === 0 && !loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-sm">No open positions found.</td></tr>
              ) : (
                positions.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{p.symbol}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-slate-700">{p.total_qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-slate-600">{fmt(p.avg_cost)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-medium text-slate-800">
                      {fmt(p.total_qty * p.avg_cost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
      <Pager />
    </>
  );
}