"use server";

import { supabaseServerClient } from "@/lib/supabase/server";

const PREMADE_IMAGE_BUCKET = "premade-images";

function normalizePremadeFileName(value: string) {
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

function normalizeExtension(extension: string) {
  const cleaned = extension.replace(".", "").toLowerCase();
  if (cleaned === "png" || cleaned === "jpg" || cleaned === "jpeg") return cleaned;
  return "";
}

export type PremadeUploadUrlResponse = {
  data: { path: string; token: string } | null;
  error: string | null;
};

export async function createPremadeUploadUrl(name: string, extension: string): Promise<PremadeUploadUrlResponse> {
  const trimmed = name?.toString().trim();
  const normalizedExt = normalizeExtension(extension);
  if (!trimmed) {
    return { data: null, error: "Name is required." };
  }
  if (!normalizedExt) {
    return { data: null, error: "Only PNG or JPG images are supported." };
  }

  const slug = normalizePremadeFileName(trimmed);
  const fileName = normalizeFileName(`${slug}-${Date.now()}.${normalizedExt}`);
  const client = supabaseServerClient;
  const { data, error } = await client.storage
    .from(PREMADE_IMAGE_BUCKET)
    .createSignedUploadUrl(fileName, { upsert: true });

  if (error || !data) {
    return { data: null, error: error?.message ?? "Unable to prepare upload." };
  }

  return { data: { path: data.path, token: data.token }, error: null };
}

export async function insertPremadeCandy(payload: {
  name: string;
  description: string;
  weight_g: number;
  price: number;
  approx_pcs?: number | null;
  image_path: string;
  flavors?: string[] | null;
  great_value?: boolean;
  is_active?: boolean;
}): Promise<{ error: string | null }> {
  const name = payload.name?.toString().trim();
  const description = payload.description?.toString().trim() ?? "";
  if (!name) return { error: "Name is required." };
  if (!payload.flavors || payload.flavors.length === 0) {
    return { error: "Select at least one flavor." };
  }
  if (!Number.isFinite(payload.weight_g) || payload.weight_g <= 0) {
    return { error: "Weight must be greater than 0." };
  }
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return { error: "Price must be greater than 0." };
  }
  if (!payload.image_path) {
    return { error: "Image is required." };
  }

  const client = supabaseServerClient;
  const { data: sortRows, error: sortError } = await client
    .from("premade_candies")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  if (sortError) return { error: sortError.message };

  const nextSort = Number(sortRows?.[0]?.sort_order ?? -1) + 1;
  const { error } = await client.from("premade_candies").insert({
    name,
    description,
    weight_g: payload.weight_g,
    price: payload.price,
    approx_pcs: payload.approx_pcs ?? null,
    image_path: payload.image_path,
    flavors: payload.flavors ?? null,
    great_value: payload.great_value ?? false,
    is_active: payload.is_active ?? true,
    sort_order: nextSort,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function updatePremadeCandy(payload: {
  id: string;
  name: string;
  description: string;
  weight_g: number;
  price: number;
  approx_pcs?: number | null;
  image_path?: string;
  flavors?: string[] | null;
  great_value?: boolean;
}): Promise<{ error: string | null }> {
  if (!payload.id) return { error: "Missing item id." };
  const name = payload.name?.toString().trim();
  const description = payload.description?.toString().trim() ?? "";
  if (!name) return { error: "Name is required." };
  if (!payload.flavors || payload.flavors.length === 0) {
    return { error: "Select at least one flavor." };
  }
  if (!Number.isFinite(payload.weight_g) || payload.weight_g <= 0) {
    return { error: "Weight must be greater than 0." };
  }
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return { error: "Price must be greater than 0." };
  }

  const update: {
    name: string;
    description: string;
    weight_g: number;
    price: number;
    approx_pcs: number | null;
    flavors: string[] | null;
    great_value: boolean;
    image_path?: string;
  } = {
    name,
    description,
    weight_g: payload.weight_g,
    price: payload.price,
    approx_pcs: payload.approx_pcs ?? null,
    flavors: payload.flavors ?? null,
    great_value: payload.great_value ?? false,
  };

  if (payload.image_path) {
    update.image_path = payload.image_path;
  }

  const client = supabaseServerClient;
  const { error } = await client.from("premade_candies").update(update).eq("id", payload.id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function setPremadeActive(id: string, is_active: boolean): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing item id." };
  const client = supabaseServerClient;
  const { error } = await client.from("premade_candies").update({ is_active }).eq("id", id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function updatePremadeOrder(
  updates: { id: string; sort_order: number }[]
): Promise<{ error: string | null }> {
  if (!updates.length) return { error: null };
  const client = supabaseServerClient;
  for (const update of updates) {
    const { error } = await client
      .from("premade_candies")
      .update({ sort_order: update.sort_order })
      .eq("id", update.id);
    if (error) return { error: error.message };
  }
  return { error: null };
}
