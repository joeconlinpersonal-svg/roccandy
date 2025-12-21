import { getSettings } from "@/lib/data";
import { supabaseServerClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const revalidate = 0;

async function updateSettings(formData: FormData) {
  "use server";

  const lead_time_days = Number(formData.get("lead_time_days"));
  const urgency_fee = Number(formData.get("urgency_fee"));
  const transaction_fee_percent = Number(formData.get("transaction_fee_percent"));
  const max_total_kg = Number(formData.get("max_total_kg"));
  const jacket_rainbow = Number(formData.get("jacket_rainbow"));
  const jacket_two_colour = Number(formData.get("jacket_two_colour"));
  const jacket_pinstripe = Number(formData.get("jacket_pinstripe"));
  const labels_supplier_shipping = Number(formData.get("labels_supplier_shipping"));
  const labels_markup_multiplier = Number(formData.get("labels_markup_multiplier"));

  const client = supabaseServerClient;
  const { error } = await client
    .from("settings")
    .update({
      lead_time_days,
      urgency_fee,
      transaction_fee_percent,
      max_total_kg,
      jacket_rainbow,
      jacket_two_colour,
      jacket_pinstripe,
      labels_supplier_shipping,
      labels_markup_multiplier,
    })
    .eq("id", 1);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/admin/settings");
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const settings = await getSettings();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Admin / Settings</p>
        <h2 className="text-3xl font-semibold">Fees and limits</h2>
        <p className="text-sm text-zinc-600">
          Edit core fees and limits. Changes save to Supabase (server-side). Add auth before sharing.
        </p>
      </div>

      <form action={updateSettings} className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <fieldset className="space-y-2 text-sm text-zinc-700">
          <h3 className="text-base font-semibold text-zinc-900">General</h3>
          <label className="block">
            <span className="text-xs text-zinc-500">Urgency fee period (days)</span>
            <input
              type="number"
              name="lead_time_days"
              defaultValue={settings.lead_time_days}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Urgency fee ($)</span>
            <input
              type="number"
              step="0.01"
              name="urgency_fee"
              defaultValue={settings.urgency_fee}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Transaction fee (%)</span>
            <input
              type="number"
              step="0.01"
              name="transaction_fee_percent"
              defaultValue={settings.transaction_fee_percent}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Max total kg</span>
            <input
              type="number"
              step="0.1"
              name="max_total_kg"
              defaultValue={settings.max_total_kg}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
        </fieldset>

        <fieldset className="space-y-2 text-sm text-zinc-700">
          <h3 className="text-base font-semibold text-zinc-900">Jackets</h3>
          <label className="block">
            <span className="text-xs text-zinc-500">Rainbow ($)</span>
            <input
              type="number"
              step="0.01"
              name="jacket_rainbow"
              defaultValue={settings.jacket_rainbow}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Two colour ($)</span>
            <input
              type="number"
              step="0.01"
              name="jacket_two_colour"
              defaultValue={settings.jacket_two_colour}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">Pinstripe ($)</span>
            <input
              type="number"
              step="0.01"
              name="jacket_pinstripe"
              defaultValue={settings.jacket_pinstripe}
              className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
              min={0}
            />
          </label>
        </fieldset>

        <fieldset className="space-y-2 text-sm text-zinc-700 md:col-span-2">
          <h3 className="text-base font-semibold text-zinc-900">Labels</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <label className="block">
              <span className="text-xs text-zinc-500">Supplier shipping ($)</span>
              <input
                type="number"
                step="0.01"
                name="labels_supplier_shipping"
                defaultValue={settings.labels_supplier_shipping}
                className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
                min={0}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Markup multiplier (e.g., 1.2)</span>
              <input
                type="number"
                step="0.01"
                name="labels_markup_multiplier"
                defaultValue={settings.labels_markup_multiplier}
                className="mt-1 w-full rounded border border-zinc-200 px-2 py-1"
                min={0}
              />
              <p className="mt-1 text-xs text-zinc-500">
                (+{((settings.labels_markup_multiplier - 1) * 100).toFixed(0)}% current)
              </p>
            </label>
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Save changes
          </button>
          <p className="mt-2 text-xs text-zinc-500">
            This writes directly to Supabase using the server key. Add auth before sharing widely.
          </p>
        </div>
      </form>
    </section>
  );
}
