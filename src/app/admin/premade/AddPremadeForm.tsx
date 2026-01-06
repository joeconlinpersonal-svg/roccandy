"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { createPremadeUploadUrl, insertPremadeCandy } from "./actions";

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const PREMADE_IMAGE_BUCKET = "premade-images";

type ErrorInfo = { message: string };

type Props = {
  flavorOptions: string[];
};

export function AddPremadeForm({ flavorOptions }: Props) {
  const router = useRouter();
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const toggleFlavor = (flavorName: string) => {
    setSelectedFlavors((prev) => {
      if (flavorName === "Mixed") {
        return prev.includes("Mixed") ? [] : ["Mixed"];
      }
      const withoutMixed = prev.filter((item) => item !== "Mixed");
      if (withoutMixed.includes(flavorName)) {
        return withoutMixed.filter((item) => item !== flavorName);
      }
      return [...withoutMixed, flavorName];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const weightValueRaw = String(formData.get("weight_value") || "").trim();
    const weightUnit = String(formData.get("weight_unit") || "g");
    const priceRaw = String(formData.get("price") || "").trim();
    const approxPcsRaw = String(formData.get("approx_pcs") || "").trim();
    const file = formData.get("image");
    const greatValue = formData.get("great_value") === "on";
    const flavors = selectedFlavors.includes("Mixed") ? ["Mixed"] : selectedFlavors;

    if (!name) {
      setError({ message: "Name is required." });
      return;
    }
    if (selectedFlavors.length === 0) {
      setError({ message: "Select at least one flavor, or choose Mixed." });
      return;
    }
    const weightValue = Number(weightValueRaw);
    if (!Number.isFinite(weightValue) || weightValue <= 0) {
      setError({ message: "Weight must be greater than 0." });
      return;
    }
    const weight_g = weightUnit === "kg" ? weightValue * 1000 : weightValue;
    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price <= 0) {
      setError({ message: "Price must be greater than 0." });
      return;
    }
    const approx_pcs = approxPcsRaw ? Number(approxPcsRaw) : null;
    if (approxPcsRaw && (!Number.isFinite(approx_pcs) || approx_pcs <= 0)) {
      setError({ message: "Approx pcs must be greater than 0." });
      return;
    }
    if (!(file instanceof File) || file.size === 0) {
      setError({ message: "Image is required." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError({ message: `File is too large. Max ${MAX_IMAGE_SIZE_MB}MB.` });
      return;
    }
    const fileName = file.name.toLowerCase();
    const extension = fileName.endsWith(".png")
      ? "png"
      : fileName.endsWith(".jpg")
        ? "jpg"
        : fileName.endsWith(".jpeg")
          ? "jpeg"
          : "";
    if (!extension) {
      setError({ message: "Only PNG or JPG images are supported." });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: urlError } = await createPremadeUploadUrl(name, extension);
      if (!data || urlError) {
        throw new Error(urlError || "Unable to prepare upload.");
      }

      const contentType = extension === "png" ? "image/png" : "image/jpeg";
      const { error: uploadError } = await supabaseClient.storage
        .from(PREMADE_IMAGE_BUCKET)
        .uploadToSignedUrl(data.path, data.token, file, { contentType });
      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: insertError } = await insertPremadeCandy({
        name,
        description,
        weight_g,
        price,
        approx_pcs,
        image_path: data.path,
        flavors: flavors.length ? flavors : null,
        great_value: greatValue,
      });
      if (insertError) {
        throw new Error(insertError);
      }

      form.reset();
      setSelectedFlavors([]);
      setSuccess("Pre-made candy added.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to add pre-made candy.";
      setError({ message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Name*
        <input
          type="text"
          name="name"
          required
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          placeholder="e.g., Strawberry Hearts"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Description
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Short description for the shop page."
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Weight*
          <input
            type="number"
            name="weight_value"
            required
            min="0"
            step="0.1"
            className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
            placeholder="e.g., 250"
          />
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Unit
          <select
            name="weight_unit"
            className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
            defaultValue="g"
          >
            <option value="g">g</option>
            <option value="kg">kg</option>
          </select>
        </label>
      </div>
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Price (AUD)*
        <input
          type="number"
          name="price"
          required
          min="0"
          step="0.01"
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          placeholder="e.g., 24.95"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Approx pcs
        <input
          type="number"
          name="approx_pcs"
          min="0"
          step="1"
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </label>
      <label className="mt-2 flex w-full items-center gap-2 rounded border border-zinc-200 px-3 py-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
        <input type="checkbox" name="great_value" className="h-4 w-4 rounded border-zinc-300" />
        Mark as discounted
      </label>
      <div className="space-y-2">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Flavors*</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {["Mixed", ...flavorOptions.filter((flavor) => flavor !== "Mixed")].map((flavor) => {
          const checked = selectedFlavors.includes(flavor);
          const disabled =
            flavor !== "Mixed" && selectedFlavors.includes("Mixed") && !checked;
            return (
              <label
                key={flavor}
                className={`flex items-center gap-2 rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-700 ${
                  disabled ? "opacity-50" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleFlavor(flavor)}
                />
                {flavor}
              </label>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-500">Choose Mixed if the pack contains multiple flavors.</p>
      </div>
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Image*
        <input
          type="file"
          name="image"
          accept="image/png,image/jpeg"
          required
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-[11px] text-zinc-500">PNG or JPG, max {MAX_IMAGE_SIZE_MB}MB.</span>
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
          isSubmitting ? "bg-zinc-100 text-zinc-500" : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {isSubmitting ? "Saving..." : "Add pre-made candy"}
      </button>
      {error && <p className="text-xs text-red-600">{error.message}</p>}
      {success && <p className="text-xs text-emerald-600">{success}</p>}
    </form>
  );
}
