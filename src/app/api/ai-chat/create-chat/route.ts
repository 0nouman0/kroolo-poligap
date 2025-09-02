import AgentConversationChat from "@/models/agentConversationChat.model";
import AgentConversation from "@/models/agentConversation.model";
import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      conversation_id,
      user_query,
      created_at,
      content,
      streamingError,
      tool_calls,
      extra_data,
      images,
      videos,
      audio,
      response_audio,
    } = await request.json();

    if (!conversation_id || !user_query || !created_at) {
      return createApiResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const conversation = await AgentConversation.findById(conversation_id);

    if (!conversation) {
      return createApiResponse({
        success: false,
        error: "Conversation not found",
        status: 404,
      });
    }

    const newChat = await AgentConversationChat.create({
      conversationId: conversation_id,
      user_query,
      content,
      streamingError,
      created_at,
      tool_calls,
      extra_data,
      images,
      videos,
      audio,
      response_audio,
    });

    const saveChat = await newChat.save();

    await AgentConversationChat.findByIdAndUpdate(conversation_id, {
      $push: {
        conversationChats: saveChat._id,
      },
    });

    return createApiResponse({
      success: true,
      error: "Chat created successfully",
      status: 200,
      data: saveChat,
    });
  } catch (error) {
    console.error("Error in createChat:", error);
    return createApiResponse({
      success: false,
      error: "Failed to create chat",
      status: 500,
    });
  }
}
