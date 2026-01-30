import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseServerClient } from "@/lib/supabase/server";

type WooWebhookPayload = {
  id?: number;
  status?: string;
  date_paid?: string | null;
  payment_method_title?: string | null;
};

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const computed = createHmac("sha256", secret).update(rawBody).digest("base64");
  return computed === signature;
}

export async function POST(request: Request) {
  const secret = process.env.WOO_WEBHOOK_SECRET?.trim();
  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  if (secret && !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: WooWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WooWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!payload?.id) {
    return NextResponse.json({ error: "Missing Woo order id." }, { status: 400 });
  }

  const status = payload.status ?? null;
  const paidAt = payload.date_paid ? new Date(payload.date_paid).toISOString() : null;
  const paid = status === "processing" || status === "completed";

  const updates: Record<string, unknown> = {
    woo_order_status: status,
  };
  if (paid && paidAt) {
    updates.paid_at = paidAt;
    updates.status = "pending";
  }
  if (payload.payment_method_title) {
    updates.payment_method = payload.payment_method_title;
  }

  const client = supabaseServerClient;
  const { error } = await client
    .from("orders")
    .update(updates)
    .eq("woo_order_id", String(payload.id));

  if (error) {
    console.error("Woo webhook update failed:", error);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
