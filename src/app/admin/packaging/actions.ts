"use server";

import { supabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function parseCategories(input: string | null) {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function upsertPackaging(formData: FormData) {
  const id = formData.get("id")?.toString() || undefined;
  const type = formData.get("type")?.toString();
  const size = formData.get("size")?.toString();
  const candy_weight_g = Number(formData.get("candy_weight_g"));
  const allowed_categories = parseCategories(formData.get("allowed_categories")?.toString() ?? "");
  const unit_price = Number(formData.get("unit_price"));
  const max_packages = Number(formData.get("max_packages"));

  if (!type || !size) throw new Error("Missing type or size");

  const client = supabaseServerClient;

  if (id) {
    const { error } = await client
      .from("packaging_options")
      .update({ type, size, candy_weight_g, allowed_categories, unit_price, max_packages })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client
      .from("packaging_options")
      .insert({ type, size, candy_weight_g, allowed_categories, unit_price, max_packages });
    if (error) throw new Error(error.message);
  }

  redirect("/admin/packaging");
}

export async function deletePackaging(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing id");
  const client = supabaseServerClient;
  const { error } = await client.from("packaging_options").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin/packaging");
}
