import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";

type OrderPayload = {
  title?: string;
  description?: string;
  dateRequired?: string;
  pickup?: boolean;
  state?: string;
  location?: string;
  designType?: string;
  designText?: string;
  jacketType?: string;
  jacketColorOne?: string;
  jacketColorTwo?: string;
  flavor?: string;
  paymentMethod?: string;
  logoUrl?: string;
  customerName?: string;
  customerEmail?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  organizationName?: string;
  addressLine1?: string;
  addressLine2?: string;
  suburb?: string;
  postcode?: string;
  categoryId?: string;
  packagingOptionId?: string;
  quantity?: number;
  labelsCount?: number;
  jacket?: string;
  totalWeightKg?: number;
  totalPrice?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderPayload;
    const totalWeightKg = Number(body.totalWeightKg);

    if (!Number.isFinite(totalWeightKg) || totalWeightKg <= 0) {
      return NextResponse.json({ error: "Order weight is required." }, { status: 400 });
    }

    const { max_total_kg } = await getSettings();
    if (totalWeightKg > max_total_kg) {
      return NextResponse.json({ error: `Max total kg is ${max_total_kg}.` }, { status: 400 });
    }

    const order_number = `RC-${Date.now()}`;
    const title = body.title?.trim() || null;
    const order_description = body.description?.trim() || null;
    const due_date = body.dateRequired || null;
    const pickup = Boolean(body.pickup);
    const state = body.state?.trim() || null;
    const location = body.location?.trim() || null;

    const payload = {
      order_number,
      title,
      order_description,
      customer_name: body.customerName?.trim() || null,
      customer_email: body.customerEmail?.trim() || null,
      first_name: body.firstName?.trim() || null,
      last_name: body.lastName?.trim() || null,
      phone: body.phone?.trim() || null,
      organization_name: body.organizationName?.trim() || null,
      address_line1: body.addressLine1?.trim() || null,
      address_line2: body.addressLine2?.trim() || null,
      suburb: body.suburb?.trim() || null,
      postcode: body.postcode?.trim() || null,
      category_id: body.categoryId ?? null,
      packaging_option_id: body.packagingOptionId ?? null,
      quantity: body.quantity ?? null,
      labels_count: body.labelsCount ?? null,
      jacket: body.jacket ?? null,
      design_type: body.designType ?? null,
      design_text: body.designText ?? null,
      jacket_type: body.jacketType ?? null,
      jacket_color_one: body.jacketColorOne ?? null,
      jacket_color_two: body.jacketColorTwo ?? null,
      flavor: body.flavor ?? null,
      payment_method: body.paymentMethod ?? null,
      logo_url: body.logoUrl ?? null,
      due_date,
      total_weight_kg: totalWeightKg,
      total_price: body.totalPrice ?? null,
      status: "pending",
      made: false,
      pickup,
      state,
      location,
    };

    const client = supabaseServerClient;
    const { data, error } = await client.from("orders").insert(payload).select("id").single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ id: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
