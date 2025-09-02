import AgentConversation from "@/models/agentConversation.model";
import User from "@/models/users.model";
import mongoose from "mongoose";
import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId");
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId || !companyId) {
      return createApiResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const userDetails = await User.findOne({ userId }).select("email");

    const conversationList = await AgentConversation.find({
      companyId: new mongoose.Types.ObjectId(companyId.toString()),
      enterpriseUserId: userDetails?._id,
      status: "active",
    }).sort({ createdAt: -1 });

    if (!conversationList) {
      return createApiResponse({
        success: false,
        error: "Failed to fetch conversation chat",
        status: 404,
      });
    }

    return createApiResponse({
      status: 200,
      success: true,
      data: conversationList,
    });
  } catch (error) {
    console.error("Error in createChat:", error);
    return createApiResponse({
      success: false,
      error: "Failed to create conversation",
      status: 500,
    });
  }
}
