import { useState } from 'react';
import Layout from '../components/Layout';
import Pager from '../components/Pager';
import { API_URL } from '../utils/config';

export default function TradeInput() {
  const [form, setForm] = useState({ symbol: 'AAPL', qty: 10, price: 150 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('${API_URL}/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      alert('Trade Queued Successfully!');
      // Reset form slightly or keep values for rapid entry
    } catch (error) {
      console.error(error);
      alert('Error submitting trade');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <Layout title="Enter Trade">
        <div className=" max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700">New Trade Execution</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Ticker Symbol</label>
              <input 
                type="text" 
                className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono"
                placeholder="e.g. AAPL"
                value={form.symbol}
                onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Quantity</label>
                <input 
                  type="number" 
                  className={`w-full rounded-lg border p-2.5 text-sm outline-none focus:ring-2 font-mono
                    ${form.qty >= 0 
                      ? 'border-green-200 focus:border-green-500 focus:ring-green-200 bg-green-50 text-green-900' 
                      : 'border-red-200 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900'
                    }`}
                  placeholder="10"
                  value={form.qty}
                  onChange={e => setForm({...form, qty: e.target.value})}
                />
                <p className="text-xs mt-1 text-slate-400">{form.qty >= 0 ? 'Positive = BUY' : 'Negative = SELL'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  placeholder="150.00"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              type="submit" 
              className={`w-full py-3 px-4 rounded-lg text-white font-medium text-sm shadow-md transition-all
                ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'}`}
            >
              {isSubmitting ? 'Broadcasting to Kafka...' : 'Execute Trade'}
            </button>
          </form>
        </div>
      </div>
      </Layout>
      <Pager />
    </>
  );
}