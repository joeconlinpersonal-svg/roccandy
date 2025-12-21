import { getOrders, getSettings } from "@/lib/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersTable } from "./OrdersTable";

export const revalidate = 0;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [orders, settings] = await Promise.all([getOrders(), getSettings()]);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin / Production</p>
        <h2 className="text-3xl font-semibold">Production schedule</h2>
        <p className="text-sm text-zinc-600">
          Orders are limited to {settings.max_total_kg} kg and include the customer-provided fields for production.
        </p>
      </div>

      <OrdersTable orders={orders} />
    </section>
  );
}
