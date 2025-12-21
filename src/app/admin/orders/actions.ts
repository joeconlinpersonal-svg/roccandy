"use server";

import { supabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/data";

const ORDERS_PATH = "/admin/orders";

export async function upsertOrder(formData: FormData) {
  const id = formData.get("id")?.toString() || undefined;
  const order_number = formData.get("order_number")?.toString() || null;
  const title = formData.get("title")?.toString() || null;
  const order_description = formData.get("order_description")?.toString() || null;
  const customer_name = formData.get("customer_name")?.toString() || null;
  const customer_email = formData.get("customer_email")?.toString() || null;
  const category_id = formData.get("category_id")?.toString() || null;
  const packaging_option_id = formData.get("packaging_option_id")?.toString() || null;
  const quantity = formData.get("quantity") ? Number(formData.get("quantity")) : null;
  const labels_count = formData.get("labels_count") ? Number(formData.get("labels_count")) : null;
  const jacket = formData.get("jacket")?.toString() || null;
  const due_date = formData.get("due_date")?.toString() || null;
  const first_name = formData.get("first_name")?.toString() || null;
  const last_name = formData.get("last_name")?.toString() || null;
  const phone = formData.get("phone")?.toString() || null;
  const organization_name = formData.get("organization_name")?.toString() || null;
  const address_line1 = formData.get("address_line1")?.toString() || null;
  const address_line2 = formData.get("address_line2")?.toString() || null;
  const suburb = formData.get("suburb")?.toString() || null;
  const postcode = formData.get("postcode")?.toString() || null;
  const order_weight_g = formData.get("order_weight_g");
  const total_weight_kg_input = formData.get("total_weight_kg");
  const total_weight_kg =
    order_weight_g !== null
      ? Number(order_weight_g) / 1000
      : total_weight_kg_input !== null
        ? Number(total_weight_kg_input)
        : NaN;
  const total_price = formData.get("total_price") ? Number(formData.get("total_price")) : null;
  const status = formData.get("status")?.toString() || "pending";
  const notes = formData.get("notes")?.toString() || null;
  const made = formData.get("made") === "on";
  const pickup = formData.get("pickup") === "on";
  const state = formData.get("state")?.toString() || null;

  const client = supabaseServerClient;
  const existing = id
    ? (await client.from("orders").select("*").eq("id", id).maybeSingle()).data
    : null;

  const resolvedWeightKg = Number.isFinite(total_weight_kg)
    ? total_weight_kg
    : existing?.total_weight_kg ?? NaN;
  if (!Number.isFinite(resolvedWeightKg) || resolvedWeightKg <= 0) {
    throw new Error("Order weight is required.");
  }

  const { max_total_kg } = await getSettings();
  if (resolvedWeightKg > max_total_kg) {
    throw new Error(`Max total kg per settings is ${max_total_kg}.`);
  }

  const payload = {
    order_number: order_number ?? existing?.order_number ?? null,
    title: title ?? existing?.title ?? null,
    order_description: order_description ?? existing?.order_description ?? null,
    customer_name: customer_name ?? existing?.customer_name ?? null,
    customer_email: customer_email ?? existing?.customer_email ?? null,
    category_id: category_id ?? existing?.category_id ?? null,
    packaging_option_id: packaging_option_id ?? existing?.packaging_option_id ?? null,
    quantity: quantity ?? existing?.quantity ?? null,
    labels_count: labels_count ?? existing?.labels_count ?? null,
    jacket: jacket ?? existing?.jacket ?? null,
    due_date: due_date ?? existing?.due_date ?? null,
    total_weight_kg: resolvedWeightKg,
    total_price: total_price ?? existing?.total_price ?? null,
    status: status ?? existing?.status ?? "pending",
    notes: notes ?? existing?.notes ?? null,
    made: made ?? existing?.made ?? false,
    pickup: pickup ?? existing?.pickup ?? false,
    state: state ?? existing?.state ?? null,
    first_name: first_name ?? existing?.first_name ?? null,
    last_name: last_name ?? existing?.last_name ?? null,
    phone: phone ?? existing?.phone ?? null,
    organization_name: organization_name ?? existing?.organization_name ?? null,
    address_line1: address_line1 ?? existing?.address_line1 ?? null,
    address_line2: address_line2 ?? existing?.address_line2 ?? null,
    suburb: suburb ?? existing?.suburb ?? null,
    postcode: postcode ?? existing?.postcode ?? null,
  };

  if (id) {
    const { error } = await client.from("orders").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client.from("orders").insert(payload);
    if (error) throw new Error(error.message);
  }

  redirect(ORDERS_PATH);
}

export async function upsertSlot(formData: FormData) {
  const id = formData.get("id")?.toString() || undefined;
  const slot_date = formData.get("slot_date")?.toString() || null;
  const capacity_kg = Number(formData.get("capacity_kg") || 0);
  const status = formData.get("status")?.toString() || "open";
  const notes = formData.get("notes")?.toString() || null;

  if (!slot_date) throw new Error("Slot date is required.");
  if (!Number.isFinite(capacity_kg) || capacity_kg <= 0) {
    throw new Error("Capacity must be greater than zero.");
  }

  const client = supabaseServerClient;
  const payload = { slot_date, capacity_kg, status, notes };
  if (id) {
    const { error } = await client.from("production_slots").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client.from("production_slots").insert(payload);
    if (error) throw new Error(error.message);
  }

  redirect(ORDERS_PATH);
}

export async function assignOrderToSlot(formData: FormData) {
  const assignmentId = formData.get("assignment_id")?.toString() || undefined;
  const order_id = formData.get("order_id")?.toString();
  const slot_id = formData.get("slot_id")?.toString();
  const kg_assigned = Number(formData.get("kg_assigned") || 0);

  if (!order_id || !slot_id) throw new Error("Order and slot are required.");
  if (!Number.isFinite(kg_assigned) || kg_assigned <= 0) {
    throw new Error("Assigned kg must be greater than zero.");
  }

  const client = supabaseServerClient;

  const { data: order, error: orderError } = await client
    .from("orders")
    .select("id,total_weight_kg")
    .eq("id", order_id)
    .single();
  if (orderError) throw new Error(orderError.message);

  const { data: slot, error: slotError } = await client
    .from("production_slots")
    .select("id,capacity_kg")
    .eq("id", slot_id)
    .single();
  if (slotError) throw new Error(slotError.message);

  const { data: slotAssignments, error: slotAssignmentsError } = await client
    .from("order_slots")
    .select("id,kg_assigned")
    .eq("slot_id", slot_id);
  if (slotAssignmentsError) throw new Error(slotAssignmentsError.message);

  const { data: orderAssignments, error: orderAssignmentsError } = await client
    .from("order_slots")
    .select("id,kg_assigned")
    .eq("order_id", order_id);
  if (orderAssignmentsError) throw new Error(orderAssignmentsError.message);

  const previousForAssignment =
    assignmentId ? slotAssignments.find((a) => a.id === assignmentId)?.kg_assigned ?? 0 : 0;

  const slotUsed =
    slotAssignments.reduce((sum, a) => sum + Number(a.kg_assigned || 0), 0) -
    previousForAssignment +
    kg_assigned;
  if (slotUsed > Number(slot.capacity_kg)) {
    throw new Error("This slot would exceed its capacity.");
  }

  const orderUsed =
    orderAssignments.reduce((sum, a) => sum + Number(a.kg_assigned || 0), 0) -
    previousForAssignment +
    kg_assigned;
  if (orderUsed > Number(order.total_weight_kg)) {
    throw new Error("Assigned kg exceeds the order's total weight.");
  }

  if (assignmentId) {
    const { error } = await client
      .from("order_slots")
      .update({ order_id, slot_id, kg_assigned })
      .eq("id", assignmentId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client.from("order_slots").insert({ order_id, slot_id, kg_assigned });
    if (error) throw new Error(error.message);
  }

  redirect(ORDERS_PATH);
}

export async function deleteAssignment(formData: FormData) {
  const assignmentId = formData.get("assignment_id")?.toString();
  if (!assignmentId) throw new Error("Missing assignment id");

  const client = supabaseServerClient;
  const { error } = await client.from("order_slots").delete().eq("id", assignmentId);
  if (error) throw new Error(error.message);

  redirect(ORDERS_PATH);
}
