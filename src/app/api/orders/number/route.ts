import { NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/orderNumbers";

export async function GET() {
  try {
    const orderNumber = await generateOrderNumber();
    return NextResponse.json({ orderNumber });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to generate order number";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
