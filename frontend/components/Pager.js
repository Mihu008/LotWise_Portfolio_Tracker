import { useRouter } from 'next/router';

export default function Pager({ routes = ['/', '/positions', '/pnl'] }) {
  const router = useRouter();
  const idx = routes.indexOf(router.pathname);

  const go = (i) => {
    const r = routes[i];
    if (r) router.push(r);
  };

  return (
    <div className="mt-6 flex justify-between ">
      <button
        onClick={() => go((idx === -1 ? 0 : idx) - 1)}
        className={`px-4 py-2 rounded-md border text-sm ${idx > 0 ? 'bg-white hover:bg-slate-50' : 'opacity-40 cursor-not-allowed bg-slate-100'}`}
        disabled={idx <= 0}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      <button
        onClick={() => go((idx === -1 ? 0 : idx) + 1)}
        className={`px-4 py-2 rounded-md border text-sm ${idx < routes.length - 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'opacity-40 cursor-not-allowed bg-slate-100'}`}
        disabled={idx >= routes.length - 1}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
}
