import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes } = body || {};

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Amount (in paise) is required" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount, // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay create-order error", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
