"use server";

import { supabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const FLAVOR_IMAGE_BUCKET = "flavor-images";
const PATH = "/admin/flavors";

function normalizeFlavorFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-");
}

export type FlavorUploadUrlResponse = {
  data: { path: string; token: string } | null;
  error: string | null;
};

export async function createFlavorUploadUrl(name: string): Promise<FlavorUploadUrlResponse> {
  const trimmed = name?.toString().trim();
  if (!trimmed) {
    return { data: null, error: "Flavor name required." };
  }

  const fileName = normalizeFileName(`${normalizeFlavorFileName(trimmed)}.png`);
  const client = supabaseServerClient;
  const { data, error } = await client.storage
    .from(FLAVOR_IMAGE_BUCKET)
    .createSignedUploadUrl(fileName, { upsert: true });

  if (error || !data) {
    return { data: null, error: error?.message ?? "Unable to prepare upload." };
  }

  return { data: { path: data.path, token: data.token }, error: null };
}

export async function insertFlavor(name: string): Promise<{ error: string | null }> {
  const trimmed = name?.toString().trim();
  if (!trimmed) return { error: "Flavor name required." };

  const client = supabaseServerClient;
  const { error } = await client.from("flavors").insert({ name: trimmed });
  if (error) return { error: error.message };
  return { error: null };
}

export async function deleteFlavor(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing id");
  const client = supabaseServerClient;
  const { error } = await client.from("flavors").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect(PATH);
}

export async function removeFlavorIcon(formData: FormData) {
  const name = formData.get("name")?.toString();
  if (!name) throw new Error("Missing flavor name");
  const fileName = normalizeFileName(`${normalizeFlavorFileName(name)}.png`);
  const client = supabaseServerClient;
  const { error } = await client.storage.from(FLAVOR_IMAGE_BUCKET).remove([fileName]);
  if (error) throw new Error(error.message);
  redirect(PATH);
}
