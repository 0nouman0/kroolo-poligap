import { NextRequest, NextResponse } from "next/server";
import { connectDBEnterprise } from "@/lib/db";
import BillingModel from "@/models/billing.model";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    // Update billing information to Starter plan
    const updateData = {
      plan: "Starter",
      billingCycle: "Monthly",
      nextPaymentDate: null,
      nextPayment: 0,
      currentBill: 0,
      usage: {
        workspaces: { current: 0, available: 1 },
        projects: { current: 0, available: 5 },
        goals: { current: 0, available: 5 },
        docs: { current: 0, available: 10 },
        teams: { current: 0, available: 5 },
        channels: { current: 0, available: 5 }
      }
    };

    const updatedBilling = await BillingModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      updateData,
      { new: true, upsert: true }
    );
    
    if (!updatedBilling) {
      return NextResponse.json(
        { error: "Failed to downgrade plan" },
        { status: 500 }
      );
    }
    
    console.log("Plan downgraded to Starter:", { userId });
    
    return NextResponse.json({
      success: true,
      message: "Plan downgraded to Starter successfully",
      data: updatedBilling
    });
  } catch (error) {
    console.error("Error downgrading plan:", error);
    return NextResponse.json(
      { error: "Failed to downgrade plan" },
      { status: 500 }
    );
  }
}
