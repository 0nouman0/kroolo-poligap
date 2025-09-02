import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IAgentConversationChat extends Document {
  conversationId: mongoose.Types.ObjectId;
  user_query: string;
  content: string;
  streamingError: boolean;
  created_at: Date;
  tool_calls: mongoose.Schema.Types.Mixed[];
  extra_data: object;
  images: mongoose.Schema.Types.Mixed[];
  videos: mongoose.Schema.Types.Mixed[];
  audio: mongoose.Schema.Types.Mixed[];
  response_audio: mongoose.Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

const AgentConversationSchema: Schema = new Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "AgentConversation",
    },
    user_query: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    created_at: {
      type: Date,
      required: true,
    },
    streamingError: {
      type: Boolean,
      required: false,
    },
    extra_data: {
      type: Object,
      required: false,
    },
    images: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    ],
    videos: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    ],
    audio: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
    ],
    response_audio: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const AgentConversationModel =
  connection.enterprise.model<IAgentConversationChat>(
    "AgentConversationChat",
    AgentConversationSchema
  );

export default AgentConversationModel;
