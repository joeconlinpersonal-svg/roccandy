"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { createFlavorUploadUrl, insertFlavor } from "./actions";

const MAX_IMAGE_SIZE_KB = 30;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_KB * 1024;
const FLAVOR_IMAGE_BUCKET = "flavor-images";

type ErrorInfo = { message: string; showSquoosh?: boolean };

export function AddFlavorForm() {
  const router = useRouter();
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const file = formData.get("image");

    if (!name) {
      setError({ message: "Flavor name required." });
      return;
    }
    if (!(file instanceof File) || file.size === 0) {
      setError({ message: "Flavor image required." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError({ message: `File is too large. Max ${MAX_IMAGE_SIZE_KB}KB.`, showSquoosh: true });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".png")) {
      setError({ message: "Only PNG images are supported." });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error: urlError } = await createFlavorUploadUrl(name);
      if (!data || urlError) {
        throw new Error(urlError || "Unable to prepare upload.");
      }

      const { error: uploadError } = await supabaseClient.storage
        .from(FLAVOR_IMAGE_BUCKET)
        .uploadToSignedUrl(data.path, data.token, file, { contentType: "image/png" });
      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: insertError } = await insertFlavor(name);
      if (insertError) {
        throw new Error(insertError);
      }

      form.reset();
      setSuccess("Flavor added.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to add flavor.";
      setError({ message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Flavor name
        <input
          type="text"
          name="name"
          required
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
          placeholder="e.g., Raspberry"
        />
      </label>
      <label className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        Flavor image
        <input
          type="file"
          name="image"
          accept="image/png"
          required
          className="mt-1 w-full rounded border border-zinc-200 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-[11px] text-zinc-500">PNG only, max {MAX_IMAGE_SIZE_KB}KB.</span>
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
          isSubmitting ? "bg-zinc-100 text-zinc-500" : "bg-zinc-900 text-white hover:bg-zinc-800"
        }`}
      >
        {isSubmitting ? "Adding..." : "Add flavor"}
      </button>
      {error && (
        <div className="text-xs text-red-600 space-y-1">
          <p>{error.message}</p>
          {error.showSquoosh && (
            <>
              <p>
                Go to{" "}
                <a
                  href="https://squoosh.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  https://squoosh.app/
                </a>
                .
              </p>
              <p>Select Compress &gt; OxiPNG.</p>
              <p>Choose Resize &gt; 256x256. If file size is still &gt; 30KB, try 128x128 or 96x96.</p>
            </>
          )}
        </div>
      )}
      {success && <p className="text-xs text-emerald-600">{success}</p>}
    </form>
  );
}
