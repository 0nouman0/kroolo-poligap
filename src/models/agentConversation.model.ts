import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IAgentConversation extends Document {
  chatName: string;
  companyId: mongoose.Types.ObjectId;
  enterpriseUserId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  summary: string;
  status: "active" | "inactive" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const AgentConversationSchema: Schema = new Schema(
  {
    chatName: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    enterpriseUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "AiAgent",
    },
    summary: {
      type: String,
      required: false,
      default: "This is a summary of the conversation",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const AgentConversationModel = connection.enterprise.model<IAgentConversation>(
  "AgentConversation",
  AgentConversationSchema
);

export default AgentConversationModel;
