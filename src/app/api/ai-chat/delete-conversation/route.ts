import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";
import AgentConversation from "@/models/agentConversation.model";

export async function DELETE(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get("conversationId");

    if (!conversationId) {
      return createApiResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const conversation = await AgentConversation.findOneAndUpdate(
      {
        _id: conversationId,
        status: "active",
      },
      {
        status: "deleted",
      }
    );

    if (!conversation) {
      return createApiResponse({
        success: false,
        error: "Conversation not found",
        status: 404,
      });
    }
    return createApiResponse({
      success: true,
      error: "Conversation deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return createApiResponse({
      success: false,
      error: "Failed to delete conversation",
      status: 500,
    });
  }
}
