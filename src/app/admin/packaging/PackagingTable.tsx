"use client";

import { useEffect, useState } from "react";
import type { Category, PackagingOption } from "@/lib/data";
import { deletePackaging, upsertPackaging } from "./actions";

type Props = {
  options: PackagingOption[];
  categories: Category[];
};

function toCategoryString(arr: string[]) {
  return arr.join(", ");
}

export function PackagingTable({ options, categories }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [allowedSelections, setAllowedSelections] = useState<Record<string, string[]>>({});
  const [newAllowed, setNewAllowed] = useState<string[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const hasDirty = dirtyIds.size > 0;
  const originalMap = useMemo(() => {
    const map = new Map<string, PackagingOption>();
    options.forEach((o) => map.set(o.id, o));
    return map;
  }, [options]);

  useEffect(() => {
    const initial: Record<string, string[]> = {};
    options.forEach((opt) => {
      initial[opt.id] = opt.allowed_categories;
    });
    // Reset selections when options refresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowedSelections(initial);
    setDirtyIds(new Set());
  }, [options]);

  const markDirty = (id: string) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const toggleAllowed = (id: string, catId: string) => {
    setAllowedSelections((prev) => {
      const current = prev[id] ?? [];
      const exists = current.includes(catId);
      const next = exists ? current.filter((c) => c !== catId) : [...current, catId];
      return { ...prev, [id]: next };
    });
    markDirty(id);
  };

  const recomputeDirty = () => {
    const next = new Set<string>();
    options.forEach((opt) => {
      const form = document.getElementById(`pack-${opt.id}`) as HTMLFormElement | null;
      if (!form) return;
      const type = (form.elements.namedItem("type") as HTMLInputElement | null)?.value ?? "";
      const size = (form.elements.namedItem("size") as HTMLInputElement | null)?.value ?? "";
      const candy_weight_g = Number(
        (form.elements.namedItem("candy_weight_g") as HTMLInputElement | null)?.value ?? 0
      );
      const unit_price = Number(
        (form.elements.namedItem("unit_price") as HTMLInputElement | null)?.value ?? 0
      );
      const max_packages = Number(
        (form.elements.namedItem("max_packages") as HTMLInputElement | null)?.value ?? 0
      );
      const allowed_categories = allowedSelections[opt.id] ?? [];
      const original = originalMap.get(opt.id);
      const allowedSame =
        original &&
        allowed_categories.length === original.allowed_categories.length &&
        allowed_categories.every((c) => original.allowed_categories.includes(c));
      const isSame =
        original &&
        original.type === type &&
        original.size === size &&
        Number(original.candy_weight_g) === candy_weight_g &&
        Number(original.unit_price) === unit_price &&
        Number(original.max_packages) === max_packages &&
        allowedSame;
      if (!isSame) next.add(opt.id);
    });
    // Handle new row: if any field filled or any allowed selected, mark dirty
    const newForm = document.getElementById("pack-new") as HTMLFormElement | null;
    if (newForm) {
      const type = (newForm.elements.namedItem("type") as HTMLInputElement | null)?.value ?? "";
      const size = (newForm.elements.namedItem("size") as HTMLInputElement | null)?.value ?? "";
      const candy = (newForm.elements.namedItem("candy_weight_g") as HTMLInputElement | null)?.value ?? "";
      const unit = (newForm.elements.namedItem("unit_price") as HTMLInputElement | null)?.value ?? "";
      const max = (newForm.elements.namedItem("max_packages") as HTMLInputElement | null)?.value ?? "";
      const hasAllowed = newAllowed.length > 0;
      const anyField = [type, size, candy, unit, max].some((v) => v !== "");
      if (anyField || hasAllowed) next.add("new");
      else next.delete("new");
    }
    setDirtyIds(next);
  };

  const handleSaveAll = () => {
    document.querySelectorAll<HTMLFormElement>("form[data-pack-form]").forEach((f) => {
      const id = f.dataset.id;
      const isNew = f.dataset.new === "true";
      if (isNew ? dirtyIds.has("new") : id && dirtyIds.has(id)) {
        f.requestSubmit();
      }
    });
    setDirtyIds(new Set());
    try {
      const evt = new CustomEvent("toast", { detail: { message: "Packaging saved", tone: "success" } });
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
                hasDirty
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-zinc-100 text-zinc-500"
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Candy weight (g)</th>
                <th className="px-3 py-2">Allowed categories</th>
                <th className="px-3 py-2">Unit price</th>
                <th className="px-3 py-2">Max packages</th>
                {editMode && <th className="px-3 py-2 w-28">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {options.map((opt) => {
                const formId = `pack-${opt.id}`;
                return (
                  <tr key={opt.id} className="border-t border-zinc-100">
                    <td className="px-3 py-2">
                      {editMode ? (
                        <input
                          form={formId}
                          type="text"
                          name="type"
                          defaultValue={opt.type}
                          className="w-full rounded border border-zinc-200 px-2 py-1"
                          onChange={() => recomputeDirty()}
                        />
                      ) : (
                        opt.type
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editMode ? (
                        <input
                          form={formId}
                          type="text"
                          name="size"
                          defaultValue={opt.size}
                          className="w-full rounded border border-zinc-200 px-2 py-1"
                          onChange={() => recomputeDirty()}
                        />
                      ) : (
                        opt.size
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editMode ? (
                        <input
                          form={formId}
                          type="number"
                          step="0.1"
                          name="candy_weight_g"
                          defaultValue={opt.candy_weight_g}
                          className="w-full rounded border border-zinc-200 px-2 py-1"
                          onChange={() => recomputeDirty()}
                        />
                      ) : (
                        opt.candy_weight_g
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editMode ? (
                        <div className="space-y-1 rounded border border-zinc-200 p-2">
                          <input
                            form={formId}
                            type="hidden"
                            name="allowed_categories"
                          value={(allowedSelections[opt.id] ?? []).join(",")}
                          readOnly
                        />
                          <div className="flex flex-wrap gap-2 text-xs text-zinc-700">
                            {categories.map((cat) => {
                              const checked = (allowedSelections[opt.id] ?? []).includes(cat.id);
                              return (
                                <label key={cat.id} className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2 py-1 hover:bg-zinc-50">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                  onChange={() => toggleAllowed(opt.id, cat.id)}
                                    className="rounded border-zinc-300"
                                  />
                                  {cat.name}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-600">{toCategoryString(opt.allowed_categories)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editMode ? (
                        <input
                          form={formId}
                          type="number"
                          step="0.01"
                          name="unit_price"
                          defaultValue={opt.unit_price}
                          className="w-full rounded border border-zinc-200 px-2 py-1"
                          onChange={() => recomputeDirty()}
                        />
                      ) : (
                        <>${opt.unit_price.toFixed(2)}</>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editMode ? (
                        <input
                          form={formId}
                          type="number"
                          name="max_packages"
                          defaultValue={opt.max_packages}
                          className="w-full rounded border border-zinc-200 px-2 py-1"
                          onChange={() => recomputeDirty()}
                        />
                      ) : (
                        opt.max_packages
                      )}
                    </td>
                    {editMode && (
                      <td className="px-3 py-2 space-y-1">
                        <form
                          id={formId}
                          data-pack-form
                          data-id={opt.id}
                          data-new="false"
                          action={upsertPackaging}
                          className="hidden"
                        >
                          <input type="hidden" name="id" value={opt.id} />
                        </form>
                        <form action={deletePackaging}>
                          <input type="hidden" name="id" value={opt.id} />
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
                      form="pack-new"
                      type="text"
                      name="type"
                      className="w-full rounded border border-zinc-200 px-2 py-1"
                      placeholder="Type"
                      required
                      onChange={() => {
                        markDirty("new");
                        recomputeDirty();
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      form="pack-new"
                      type="text"
                      name="size"
                      className="w-full rounded border border-zinc-200 px-2 py-1"
                      placeholder="Size"
                      required
                      onChange={() => {
                        markDirty("new");
                        recomputeDirty();
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      form="pack-new"
                      type="number"
                      step="0.1"
                      name="candy_weight_g"
                      className="w-full rounded border border-zinc-200 px-2 py-1"
                      placeholder="e.g., 23"
                      required
                      onChange={() => {
                        markDirty("new");
                        recomputeDirty();
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      form="pack-new"
                      type="text"
                      name="allowed_categories"
                      className="hidden"
                      value={newAllowed.join(",")}
                      readOnly
                    />
                    {editMode && (
                      <div className="space-y-1 rounded border border-zinc-200 p-2">
                        <div className="flex flex-wrap gap-2 text-xs text-zinc-700">
                          {categories.map((cat) => {
                            const checked = newAllowed.includes(cat.id);
                            return (
                              <label key={cat.id} className="inline-flex items-center gap-1 rounded border border-zinc-200 px-2 py-1 hover:bg-zinc-50">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setNewAllowed((prev) => {
                                      const next = prev.includes(cat.id)
                                        ? prev.filter((c) => c !== cat.id)
                                        : [...prev, cat.id];
                                      markDirty("new");
                                      recomputeDirty();
                                      return next;
                                    })
                                  }
                                  className="rounded border-zinc-300"
                                />
                                {cat.name}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      form="pack-new"
                      type="number"
                      step="0.01"
                      name="unit_price"
                      className="w-full rounded border border-zinc-200 px-2 py-1"
                      placeholder="0.00"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      form="pack-new"
                      type="number"
                      name="max_packages"
                      className="w-full rounded border border-zinc-200 px-2 py-1"
                      placeholder="Max per order"
                      required
                    />
                  </td>
                  <td className="px-3 py-2">
                    <form id="pack-new" data-pack-form data-id="new" data-new="true" action={upsertPackaging} className="hidden" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
