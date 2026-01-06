"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { createFlavorUploadUrl } from "./actions";

const MAX_IMAGE_SIZE_KB = 30;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_KB * 1024;
const FLAVOR_IMAGE_BUCKET = "flavor-images";
const SQUOOSH_URL = "https://squoosh.app/";

type Props = {
  flavorName: string;
};

export function ReplaceFlavorIcon({ flavorName }: Props) {
  const router = useRouter();
  const [error, setError] = useState<{ message: string; showSquoosh?: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputId = `replace-icon-${flavorName.replace(/[^a-z0-9-_]+/gi, "-")}`;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    setError(null);

    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setError({ message: `File is too large. Max ${MAX_IMAGE_SIZE_KB}KB.`, showSquoosh: true });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".png")) {
      setError({ message: "Only PNG images are supported." });
      return;
    }

    setIsUploading(true);
    try {
      const { data, error: urlError } = await createFlavorUploadUrl(flavorName);
      if (!data || urlError) {
        throw new Error(urlError || "Unable to prepare upload.");
      }

      const { error: uploadError } = await supabaseClient.storage
        .from(FLAVOR_IMAGE_BUCKET)
        .uploadToSignedUrl(data.path, data.token, file, { contentType: "image/png" });
      if (uploadError) {
        throw new Error(uploadError.message);
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to replace icon.";
      setError({ message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center">
      <input
        id={inputId}
        type="file"
        accept="image/png"
        className="sr-only"
        onChange={handleFileChange}
      />
      <label
        htmlFor={inputId}
        data-neutral-button
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
          isUploading ? "pointer-events-none text-zinc-400" : "text-zinc-600 hover:text-zinc-800"
        }`}
      >
        {isUploading ? "Uploading..." : "Replace icon"}
      </label>
      {error && (
        <div className="mt-1 text-[11px] text-red-600 space-y-1">
          <p>{error.message}</p>
          {error.showSquoosh && (
            <>
              <p>
                Go to{" "}
                <a href={SQUOOSH_URL} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {SQUOOSH_URL}
                </a>
                .
              </p>
              <p>Select Compress &gt; OxiPNG.</p>
              <p>Choose Resize &gt; 256x256. If file size is still &gt; 30KB, try 128x128 or 96x96.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
