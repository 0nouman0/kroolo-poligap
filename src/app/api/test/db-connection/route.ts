import { NextRequest, NextResponse } from "next/server";
import { connectDBEnterprise } from "@/lib/db";
import UserModel from "@/models/users.model";
import MembersModel from "@/models/members.model";
import BillingModel from "@/models/billing.model";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDBEnterprise();
    
    // Test database connection
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Count documents in each collection
    const userCount = await UserModel.countDocuments();
    const memberCount = await MembersModel.countDocuments();
    const billingCount = await BillingModel.countDocuments();

    // Get sample user data (first user)
    const sampleUser = await UserModel.findOne().lean();
    const sampleMember = sampleUser ? await MembersModel.findOne({ userId: sampleUser.userId }).lean() : null;
    const sampleBilling = sampleUser ? await BillingModel.findOne({ userId: sampleUser.userId }).lean() : null;

    return NextResponse.json({
      success: true,
      database: {
        status: dbStates[dbState as keyof typeof dbStates] || 'unknown',
        readyState: dbState
      },
      collections: {
        users: userCount,
        members: memberCount,
        billing: billingCount
      },
      sampleData: {
        user: sampleUser ? {
          id: sampleUser._id,
          name: sampleUser.name,
          email: sampleUser.email,
          userId: sampleUser.userId,
          country: sampleUser.country,
          mobile: sampleUser.mobile,
          createdAt: sampleUser.createdAt
        } : null,
        member: sampleMember ? {
          id: sampleMember._id,
          userId: sampleMember.userId,
          designation: sampleMember.designation,
          role: sampleMember.role,
          companyId: sampleMember.companyId
        } : null,
        billing: sampleBilling ? {
          id: sampleBilling._id,
          userId: sampleBilling.userId,
          plan: sampleBilling.plan,
          billingCycle: sampleBilling.billingCycle,
          activeUsers: sampleBilling.activeUsers
        } : null
      }
    });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      database: {
        status: 'error',
        readyState: mongoose.connection.readyState
      }
    }, { status: 500 });
  }
}
