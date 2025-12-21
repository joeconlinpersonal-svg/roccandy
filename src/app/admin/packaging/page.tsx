import { getCategories, getPackagingOptions } from "@/lib/data";
import { PackagingTable } from "./PackagingTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PackagingPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const [options, categories] = await Promise.all([getPackagingOptions(), getCategories()]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin / Packaging</p>
        <h2 className="text-3xl font-semibold">Packaging options</h2>
        <p className="text-sm text-zinc-600">
          View or edit packaging rows. Allowed categories are comma-separated IDs (e.g.,
          weddings-initials,custom-1-6). Max packages is the cap per order.
        </p>
      </div>

      <PackagingTable options={options} categories={categories} />
    </section>
  );
}
