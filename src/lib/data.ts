import { supabaseServerClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
};

export type WeightTier = {
  id: string;
  category_id: string;
  min_kg: number;
  max_kg: number;
  price: number;
  per_kg: boolean;
  notes: string | null;
};

export type PackagingOption = {
  id: string;
  type: string;
  size: string;
  candy_weight_g: number;
  allowed_categories: string[];
  unit_price: number;
  max_packages: number;
};

export type LabelRange = {
  id: string;
  upper_bound: number;
  range_cost: number;
};

export type SettingsRow = {
  id: number;
  lead_time_days: number;
  urgency_fee: number;
  transaction_fee_percent: number;
  jacket_rainbow: number;
  jacket_two_colour: number;
  jacket_pinstripe: number;
  max_total_kg: number;
  labels_supplier_shipping: number;
  labels_markup_multiplier: number;
  labels_max_bulk: number;
};

export type Flavor = {
  id: string;
  name: string;
};

export type OrderRow = {
  id: string;
  order_number: string | null;
  title: string | null;
  order_description: string | null;
  customer_name: string | null;
  customer_email: string | null;
  category_id: string | null;
  packaging_option_id: string | null;
  quantity: number | null;
  labels_count: number | null;
  jacket: string | null;
  design_type: string | null;
  design_text: string | null;
  jacket_type: string | null;
  jacket_color_one: string | null;
  jacket_color_two: string | null;
  flavor: string | null;
  payment_method: string | null;
  logo_url: string | null;
  due_date: string | null;
  total_weight_kg: number;
  total_price: number | null;
  status: string;
  notes: string | null;
  made: boolean;
  pickup: boolean;
  state: string | null;
  location: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  organization_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  suburb: string | null;
  postcode: string | null;
  created_at: string;
};

export type ProductionSlot = {
  id: string;
  slot_date: string; // ISO date
  capacity_kg: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export type OrderSlot = {
  id: string;
  order_id: string;
  slot_id: string;
  kg_assigned: number;
  created_at: string;
};

async function fetchTable<T>(table: string) {
  const client = supabaseServerClient;
  const { data, error } = await client.from(table).select("*");
  if (error) throw new Error(error.message);
  return data as T[];
}

export async function getCategories() {
  return fetchTable<Category>("categories");
}

export async function getWeightTiers() {
  return fetchTable<WeightTier>("weight_tiers");
}

export async function getPackagingOptions() {
  return fetchTable<PackagingOption>("packaging_options");
}

export async function getLabelRanges() {
  return fetchTable<LabelRange>("label_ranges");
}

export async function getSettings() {
  const rows = await fetchTable<SettingsRow>("settings");
  return rows[0];
}

export async function getOrders() {
  return fetchTable<OrderRow>("orders");
}

export async function getProductionSlots() {
  return fetchTable<ProductionSlot>("production_slots");
}

export async function getOrderSlots() {
  return fetchTable<OrderSlot>("order_slots");
}

export async function getFlavors() {
  return fetchTable<Flavor>("flavors");
}
