import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-sky-100 opacity-70" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-20 md:py-28">
          <header className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                Roc Candy
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Design your candy order with live pricing and crystal-clear options.
              </h1>
              <p className="max-w-2xl text-lg leading-7 text-zinc-600">
                Pick your order type, packaging, labels, and extras—see the price update instantly.
                No surprises. When you’re ready, hand it off for production.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/quote"
                  className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  Design your order
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400"
                >
                  Admin console
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-xl backdrop-blur">
              <div className="space-y-3 text-sm text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Live preview
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Instant pricing
                  </span>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-lg font-semibold text-zinc-900">Example total</p>
                  <p className="text-3xl font-semibold text-zinc-900">$395.00</p>
                  <p className="text-xs text-zinc-500">
                    Weddings (initials), 5 × 1kg bulk, no labels, no extras.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <p className="text-xs text-zinc-500">Order type</p>
                    <p className="font-semibold text-zinc-900">Weddings</p>
                    <p className="text-xs text-zinc-500">Initials</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-3">
                    <p className="text-xs text-zinc-500">Packaging</p>
                    <p className="font-semibold text-zinc-900">Bulk 1kg</p>
                    <p className="text-xs text-zinc-500">5 units</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-md backdrop-blur md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">1. Pick your type</p>
              <p className="text-sm text-zinc-600">
                Weddings, custom text, or branded candy—each with the right pricing logic.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">2. Packaging</p>
              <p className="text-sm text-zinc-600">
                Sizes filtered per order type; bulk allowed; quantity caps enforced.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">3. Extras & labels</p>
              <p className="text-sm text-zinc-600">
                Optional labels (bulk has its own cap), jackets, rush fees—all priced live.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
