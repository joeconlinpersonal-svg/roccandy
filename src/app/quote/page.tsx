import { getCategories, getFlavors, getPackagingOptions, getSettings } from "@/lib/data";
import { QuoteBuilder } from "./QuoteBuilder";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function QuotePage() {
  const [categories, packagingOptions, settings, flavors] = await Promise.all([
    getCategories(),
    getPackagingOptions(),
    getSettings(),
    getFlavors(),
  ]);

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Quote</p>
          <h1 className="text-4xl font-semibold tracking-tight">Build a quick quote</h1>
          <p className="text-sm text-zinc-600">
            Select category, add packaging and quantities, and get a live price with rush fees,
            labels, and transaction fees applied. Weight cap of 8 kg is enforced quietly.
          </p>
        </div>

        <QuoteBuilder
          categories={categories}
          packagingOptions={packagingOptions}
          settings={settings}
          flavors={flavors}
        />
      </div>
    </main>
  );
}
