import { NextRequest, NextResponse } from "next/server";
import { connectDBEnterprise } from "@/lib/db";
import BillingModel from "@/models/billing.model";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const body = await request.json();
    const { userId, plan, billingCycle, paymentId, orderId } = body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    if (!plan || !billingCycle) {
      return NextResponse.json(
        { error: "Plan and billing cycle are required" },
        { status: 400 }
      );
    }

    // Calculate next payment date (30 days for monthly, 365 days for yearly)
    const nextPaymentDate = new Date();
    if (billingCycle.toLowerCase() === 'yearly') {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    } else {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    }

    // Calculate next payment amount based on plan
    let nextPaymentAmount = 0;
    if (plan.toLowerCase() === 'plus') {
      nextPaymentAmount = billingCycle.toLowerCase() === 'yearly' ? 144 : 15;
    } else if (plan.toLowerCase() === 'business') {
      nextPaymentAmount = billingCycle.toLowerCase() === 'yearly' ? 240 : 25;
    }

    // Update billing information in MongoDB
    const updateData: any = {
      plan,
      billingCycle,
      nextPaymentDate,
      nextPayment: nextPaymentAmount,
      paymentDate: new Date(),
      currentBill: 0, // Reset current bill after payment
    };

    // Add payment tracking if provided
    if (paymentId && orderId) {
      updateData.lastPaymentId = paymentId;
      updateData.lastOrderId = orderId;
    }

    const updatedBilling = await BillingModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      updateData,
      { new: true, upsert: true }
    );
    
    if (!updatedBilling) {
      return NextResponse.json(
        { error: "Failed to update billing information" },
        { status: 500 }
      );
    }
    
    console.log("Plan changed successfully:", { userId, plan, billingCycle });
    
    return NextResponse.json({
      success: true,
      message: "Plan changed successfully",
      data: updatedBilling
    });
  } catch (error) {
    console.error("Error changing plan:", error);
    return NextResponse.json(
      { error: "Failed to change plan" },
      { status: 500 }
    );
  }
}
