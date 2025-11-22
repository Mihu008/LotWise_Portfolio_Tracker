import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children, title = 'Portfolio Tracker' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col overflow-x-hidden font-sans text-slate-100">
        <header className="bg-transparent">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-white">Portfolio</Link>
              <nav className="hidden md:flex gap-2 text-sm text-slate-200">
                <Link href="/" className="px-3 py-2 rounded hover:bg-white/5">Trade</Link>
                <Link href="/positions" className="px-3 py-2 rounded hover:bg-white/5">Positions</Link>
                <Link href="/pnl" className="px-3 py-2 rounded hover:bg-white/5">P&L</Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
          Built for demo — not investment advice.
        </footer>
      </div>
    </>
  );
}
