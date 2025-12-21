"use client";

import { useMemo, useState } from "react";
import type { OrderRow } from "@/lib/data";
import { upsertOrder } from "./actions";

type Props = {
  orders: OrderRow[];
};

export function OrdersTable({ orders }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId]);

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  const weightLabel = (kg: number | null | undefined) => {
    if (!kg || Number.isNaN(kg)) return "—";
    return `${(Number(kg) * 1000).toFixed(0)} g`;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-3 py-3 text-left">Order #</th>
              <th className="px-3 py-3 text-left">Title</th>
              <th className="px-3 py-3 text-left">Date required</th>
              <th className="px-3 py-3 text-left">Made</th>
              <th className="px-3 py-3 text-left">Order description</th>
              <th className="px-3 py-3 text-left">Order weight</th>
              <th className="px-3 py-3 text-left">Pickup</th>
              <th className="px-3 py-3 text-left">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className={`cursor-pointer bg-white hover:bg-zinc-50 ${selectedId === order.id ? "bg-zinc-50" : ""}`}
                onClick={() => setSelectedId(order.id)}
              >
                <td className="px-3 py-2 font-semibold text-zinc-900">
                  {order.order_number ? `#${order.order_number}` : "—"}
                </td>
                <td className="px-3 py-2 text-zinc-800">{order.title ?? "Untitled"}</td>
                <td className="px-3 py-2 text-zinc-700">{formatDate(order.due_date)}</td>
                <td className="px-3 py-2">
                  <form action={upsertOrder} onClick={(e) => e.stopPropagation()}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="made" value={order.made ? "" : "on"} />
                    <button
                      type="submit"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        order.made
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      {order.made ? "Made" : "Mark made"}
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2 text-zinc-700">{order.order_description ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-700">{weightLabel(order.total_weight_kg)}</td>
                <td className="px-3 py-2 text-zinc-700">{order.pickup ? "Pickup" : "Delivery"}</td>
                <td className="px-3 py-2 text-zinc-700">{order.state ?? order.location ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900">Order details</h3>
        {!selected && <p className="mt-2 text-sm text-zinc-600">Click a row to view details.</p>}
        {selected && (
          <div className="mt-3 space-y-2 text-sm text-zinc-700">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Order #</p>
              <p className="font-semibold text-zinc-900">
                {selected.order_number ? `#${selected.order_number}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Title</p>
              <p className="font-semibold text-zinc-900">{selected.title ?? "Untitled"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Date required</p>
              <p className="font-semibold text-zinc-900">{formatDate(selected.due_date)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Order description</p>
              <p>{selected.order_description ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Order weight</p>
              <p className="font-semibold text-zinc-900">{weightLabel(selected.total_weight_kg)}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pickup / Delivery</p>
                <p className="font-semibold text-zinc-900">{selected.pickup ? "Pickup" : "Delivery"}</p>
                <p className="text-xs text-zinc-500">{selected.state ?? selected.location ?? "No state"}</p>
              </div>
              <form action={upsertOrder}>
                <input type="hidden" name="id" value={selected.id} />
                <input type="hidden" name="made" value={selected.made ? "" : "on"} />
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    selected.made
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  {selected.made ? "Made" : "Mark made"}
                </button>
              </form>
            </div>
            {(selected.first_name || selected.last_name || selected.customer_email) && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Customer</p>
                <p className="font-semibold text-zinc-900">
                  {[selected.first_name, selected.last_name].filter(Boolean).join(" ") || selected.customer_name || ""}
                </p>
                <p className="text-xs text-zinc-500">{selected.customer_email ?? ""}</p>
                {selected.phone && <p className="text-xs text-zinc-500">Phone: {selected.phone}</p>}
                {selected.organization_name && (
                  <p className="text-xs text-zinc-500">Org: {selected.organization_name}</p>
                )}
              </div>
            )}
            {(selected.address_line1 || selected.suburb || selected.postcode) && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Address</p>
                <p>{selected.address_line1}</p>
                {selected.address_line2 && <p>{selected.address_line2}</p>}
                <p>
                  {[selected.suburb, selected.state, selected.postcode].filter(Boolean).join(", ")}
                </p>
              </div>
            )}
            {selected.notes && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Notes</p>
                <p>{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
