"use server";

import { supabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function upsertLabelRange(formData: FormData) {
  const id = formData.get("id")?.toString() || undefined;
  const upper_bound = Number(formData.get("upper_bound"));
  const range_cost = Number(formData.get("range_cost"));

  const client = supabaseServerClient;
  if (id) {
    const { error } = await client
      .from("label_ranges")
      .update({ upper_bound, range_cost })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client.from("label_ranges").insert({ upper_bound, range_cost });
    if (error) throw new Error(error.message);
  }

  redirect("/admin/labels");
}

export async function deleteLabelRange(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing id");
  const client = supabaseServerClient;
  const { error } = await client.from("label_ranges").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect("/admin/labels");
}

export async function updateLabelSettings(formData: FormData) {
  const labels_supplier_shipping = Number(formData.get("labels_supplier_shipping"));
  const labels_markup_multiplier = Number(formData.get("labels_markup_multiplier"));
  const client = supabaseServerClient;
  const { error } = await client
    .from("settings")
    .update({ labels_supplier_shipping, labels_markup_multiplier })
    .eq("id", 1);
  if (error) throw new Error(error.message);
  redirect("/admin/labels");
}
