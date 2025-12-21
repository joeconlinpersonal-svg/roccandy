"use client";

import { useState } from "react";
import type { LabelRange, SettingsRow } from "@/lib/data";
import { deleteLabelRange, upsertLabelRange, updateLabelSettings } from "./actions";

type Props = {
  ranges: LabelRange[];
  settings: SettingsRow;
};

export function LabelsTable({ ranges, settings }: Props) {
  const [editMode, setEditMode] = useState(false);
  const sorted = [...ranges].sort((a, b) => a.upper_bound - b.upper_bound);
  const [shipping, setShipping] = useState(settings.labels_supplier_shipping);
  const [markup, setMarkup] = useState(settings.labels_markup_multiplier);
  const [leadTime, setLeadTime] = useState(settings.lead_time_days);
  const [dirtyRangeIds, setDirtyRangeIds] = useState<Set<string>>(new Set());
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [newDirty, setNewDirty] = useState(false);
  const hasDirty = settingsDirty || newDirty || dirtyRangeIds.size > 0;
  const originalRanges = useMemo(() => {
    const map = new Map<string, LabelRange>();
    ranges.forEach((r) => map.set(r.id, r));
    return map;
  }, [ranges]);
  const originalSettings = useMemo(
    () => ({
      shipping: settings.labels_supplier_shipping,
      markup: settings.labels_markup_multiplier,
      lead: settings.lead_time_days,
    }),
    [settings]
  );

  const handleSaveAll = () => {
    if (settingsDirty) {
      const settingsForm = document.querySelector<HTMLFormElement>("#label-settings");
      settingsForm?.requestSubmit();
    }
    document.querySelectorAll<HTMLFormElement>("form[data-label-form]").forEach((f) => {
      const id = f.dataset.id;
      const isNew = f.dataset.new === "true";
      if (isNew ? newDirty : id && dirtyRangeIds.has(id)) {
        f.requestSubmit();
      }
    });
    setDirtyRangeIds(new Set());
    setSettingsDirty(false);
    setNewDirty(false);
    try {
      const evt = new CustomEvent("toast", { detail: { message: "Labels saved", tone: "success" } });
      window.dispatchEvent(evt);
    } catch {
      // no-op
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {!editMode && (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Edit
          </button>
        )}
        {editMode && (
          <>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!hasDirty}
              className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold ${
                hasDirty ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              Save all
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-400"
            >
              Done (view only)
            </button>
          </>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900">Global label settings</h3>
        <form id="label-settings" data-label-form action={updateLabelSettings} className="mt-2 grid gap-4 text-sm text-zinc-700 sm:grid-cols-2 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Supplier shipping
            {editMode ? (
              <input
                type="number"
                step="0.01"
                name="labels_supplier_shipping"
                value={shipping}
                onChange={(e) => {
                  setShipping(Number(e.target.value));
                  const next = Number(e.target.value);
                  setSettingsDirty(
                    next !== originalSettings.shipping || markup !== originalSettings.markup || leadTime !== originalSettings.lead
                  );
                }}
                className="rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-900">${shipping.toFixed(2)}</span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Markup multiplier
            {editMode ? (
              <input
                type="number"
                step="0.01"
                name="labels_markup_multiplier"
                value={markup}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setMarkup(next);
                  setSettingsDirty(
                    shipping !== originalSettings.shipping || next !== originalSettings.markup || leadTime !== originalSettings.lead
                  );
                }}
                className="rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
              />
            ) : (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900">{markup.toFixed(2)}x</span>
                <span className="text-xs text-zinc-500">(+{((markup - 1) * 100).toFixed(0)}%)</span>
              </div>
            )}
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
            Urgency fee period (days)
            {editMode ? (
              <input
                type="number"
                step="1"
                name="lead_time_days"
                value={leadTime}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setLeadTime(next);
                  setSettingsDirty(
                    shipping !== originalSettings.shipping || markup !== originalSettings.markup || next !== originalSettings.lead
                  );
                }}
                className="rounded border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
              />
            ) : (
              <span className="text-sm font-semibold text-zinc-900">{settings.lead_time_days} days</span>
            )}
          </label>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="px-3 py-2">Upper bound</th>
              <th className="px-3 py-2">Range cost</th>
              {editMode && <th className="px-3 py-2 w-28">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((range) => {
              const formId = `range-${range.id}`;
              const recomputeRangeDirty = () => {
                const form = document.getElementById(formId) as HTMLFormElement | null;
                const original = originalRanges.get(range.id);
                if (!form || !original) return;
                const upper = Number((form.elements.namedItem("upper_bound") as HTMLInputElement | null)?.value ?? 0);
                const cost = Number((form.elements.namedItem("range_cost") as HTMLInputElement | null)?.value ?? 0);
                const isSame =
                  Number(original.upper_bound) === upper && Number(original.range_cost) === cost;
                setDirtyRangeIds((prev) => {
                  const next = new Set(prev);
                  if (isSame) next.delete(range.id);
                  else next.add(range.id);
                  return next;
                });
              };
              return (
                <tr key={range.id} className="border-t border-zinc-100">
                  <td className="px-3 py-2">
                    {editMode ? (
                      <input
                        form={formId}
                        type="number"
                        name="upper_bound"
                        defaultValue={range.upper_bound}
                        className="w-full rounded border border-zinc-200 px-2 py-1"
                        onChange={recomputeRangeDirty}
                        required
                      />
                    ) : (
                      range.upper_bound
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editMode ? (
                      <input
                        form={formId}
                        type="number"
                        step="0.01"
                        name="range_cost"
                        defaultValue={range.range_cost}
                        className="w-full rounded border border-zinc-200 px-2 py-1"
                        onChange={recomputeRangeDirty}
                        required
                      />
                    ) : (
                      <>${range.range_cost.toFixed(2)}</>
                    )}
                  </td>
                  {editMode && (
                    <td className="px-3 py-2 space-y-1">
                      <form
                        id={formId}
                        data-label-form
                        data-id={range.id}
                        data-new="false"
                        action={upsertLabelRange}
                        className="hidden"
                      >
                        <input type="hidden" name="id" value={range.id} />
                      </form>
                      <form action={deleteLabelRange}>
                        <input type="hidden" name="id" value={range.id} />
                        <button
                          type="submit"
                          className="w-full rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              );
            })}
            {editMode && (
              <tr className="border-t border-zinc-100 bg-zinc-50/60">
                <td className="px-3 py-2">
                  <input
                    form="range-new"
                    type="number"
                    name="upper_bound"
                    className="w-full rounded border border-zinc-200 px-2 py-1"
                    onChange={() => setNewDirty(true)}
                    required
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    form="range-new"
                    type="number"
                    step="0.01"
                    name="range_cost"
                    className="w-full rounded border border-zinc-200 px-2 py-1"
                    onChange={() => setNewDirty(true)}
                    required
                  />
                </td>
                <td className="px-3 py-2">
                  <form id="range-new" data-label-form data-id="new" data-new="true" action={upsertLabelRange} className="hidden" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
