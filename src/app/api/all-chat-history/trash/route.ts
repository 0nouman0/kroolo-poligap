import { createApiResponse } from "@/lib/apiResponse";
import AgentConversation from "@/models/agentConversation.model";
import User from "@/models/users.model";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId");

    if (!companyId) {
      return createApiResponse({
        success: false,
        error: "Missing companyId",
        status: 400,
      });
    }

    const conversations = await AgentConversation.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      status: "deleted",
    });

    if (!conversations) {
      return createApiResponse({
        success: false,
        error: "Conversation not found",
        status: 404,
      });
    }

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const user = await User.findById(conversation?.enterpriseUserId).select(
          "name email profileImage"
        );
        return {
          conversation,
          user,
        };
      })
    );

    return createApiResponse({
      success: true,
      error: "Conversation found",
      data,
      status: 200,
    });
  } catch (error) {
    console.error("Error in getSelectedChat:", error);
    return createApiResponse({
      success: false,
      error: "Failed to get conversation",
      status: 500,
    });
  }
}
