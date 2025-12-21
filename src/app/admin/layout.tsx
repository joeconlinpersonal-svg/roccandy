import Link from "next/link";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";

const nav = [
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/packaging", label: "Packaging" },
  { href: "/admin/labels", label: "Labels" },
  { href: "/admin/flavors", label: "Flavors" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-zinc-900">
        <header className="border-b border-zinc-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin</p>
              <h1 className="text-lg font-semibold">Roc Candy Console</h1>
            </div>
            <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
              <Link href="/admin" className="hover:text-zinc-900">
                Home
              </Link>
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-zinc-900">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
