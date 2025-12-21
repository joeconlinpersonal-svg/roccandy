"use server";

import { supabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PATH = "/admin/flavors";

export async function addFlavor(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) throw new Error("Flavor name required");
  const client = supabaseServerClient;
  const { error } = await client.from("flavors").insert({ name });
  if (error) throw new Error(error.message);
  redirect(PATH);
}

export async function deleteFlavor(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("Missing id");
  const client = supabaseServerClient;
  const { error } = await client.from("flavors").delete().eq("id", id);
  if (error) throw new Error(error.message);
  redirect(PATH);
}
