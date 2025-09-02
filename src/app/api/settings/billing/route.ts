import { NextRequest, NextResponse } from "next/server";
import { connectDBEnterprise } from "@/lib/db";
import connections from "@/lib/db";
import BillingModel from "@/models/billing.model";
import mongoose from "mongoose";

// GET billing information
export async function GET(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user's billing data from MongoDB
    let billing = await BillingModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    // If no billing record exists, create a default one
    if (!billing) {
      billing = new BillingModel({
        userId: new mongoose.Types.ObjectId(userId),
        plan: "Starter",
        billingCycle: "Monthly",
        activeUsers: 1,
        currentBill: 0,
        nextPayment: 0,
        usage: {
          workspaces: { current: 0, available: 1 },
          projects: { current: 0, available: 5 },
          goals: { current: 0, available: 5 },
          docs: { current: 0, available: 10 },
          teams: { current: 0, available: 5 },
          channels: { current: 0, available: 5 }
        }
      });
      await billing.save();
    }
    
    const billingInfo = {
      plan: billing.plan,
      billingCycle: billing.billingCycle,
      activeUsers: billing.activeUsers,
      // formatted (legacy UI)
      currentBill: billing.currentBill > 0 ? `$${billing.currentBill}` : "—",
      nextPayment: billing.nextPayment > 0 ? `$${billing.nextPayment}` : "—",
      // raw numeric values for integrations
      currentBillValue: typeof billing.currentBill === 'number' ? billing.currentBill : 0,
      nextPaymentValue: typeof billing.nextPayment === 'number' ? billing.nextPayment : 0,
      paymentDate: billing.paymentDate ? billing.paymentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : "—",
      nextPaymentDate: billing.nextPaymentDate ? billing.nextPaymentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : "—",
      usage: billing.usage
    };

    return NextResponse.json({
      success: true,
      data: billingInfo
    });
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    );
  }
}

// PUT update billing information
export async function PUT(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    const body = await request.json();
    const { userId, plan, billingCycle } = body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Valid User ID is required" },
        { status: 400 }
      );
    }

    // Update billing information in MongoDB
    const updateData: any = {};
    
    if (plan) updateData.plan = plan;
    if (billingCycle) updateData.billingCycle = billingCycle;
    
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
    
    console.log("Updated billing info:", { userId, plan, billingCycle });
    
    return NextResponse.json({
      success: true,
      message: "Billing information updated successfully"
    });
  } catch (error) {
    console.error("Error updating billing info:", error);
    return NextResponse.json(
      { error: "Failed to update billing information" },
      { status: 500 }
    );
  }
}
