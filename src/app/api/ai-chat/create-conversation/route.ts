import AgentConversation from "@/models/agentConversation.model";
import mongoose from "mongoose";
import User from "@/models/users.model";
import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId, companyId } = await request.json();
    console.log("userId and companyId =>", userId, companyId);

    if (!userId || !companyId) {
      return createApiResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const user = await User.findOne({
      userId: mongoose.Types.ObjectId.createFromHexString(userId),
    });

    if (!user) {
      return createApiResponse({
        success: false,
        error: "User not found",
        status: 404,
      });
    }

    const conversationName = new Date().toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });

    const newConversation = await AgentConversation.create({
      enterpriseUserId: user._id,
      companyId: mongoose.Types.ObjectId.createFromHexString(companyId),
      chatName: conversationName,
      status: "active",
    });

    const saveConversation = await newConversation.save();
    return createApiResponse({
      success: true,
      error: "Conversation created successfully",
      status: 200,
      data: saveConversation,
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
