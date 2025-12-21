import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

const links = [
  { href: "/admin/pricing", label: "Pricing tiers" },
  { href: "/admin/packaging", label: "Packaging options" },
  { href: "/admin/labels", label: "Label ranges" },
  { href: "/admin/orders", label: "Orders & schedule" },
  { href: "/admin/settings", label: "Fees and limits" },
];

export default async function AdminHome() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight">Workspace</h1>
          <p className="text-sm text-zinc-600">
            Review pricing data pulled from Supabase. Auth guard to be added; keep this private until
            roles are wired.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:border-zinc-300"
            >
              {item.label} →
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
