import mongoose, { Document, Schema, Types } from "mongoose";
import connection from "@/lib/db";
import { redisClient } from "@/lib/redis";

export interface IEnterpriseRule extends Document {
  ruleName?: string;
  platformId: Types.ObjectId;
  userId: Types.ObjectId;
  integrationUserId?: Types.ObjectId;
  credentialId: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  fileDetails?: Record<string, unknown>;
  organizationId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnterpriseRuleSchema: Schema<IEnterpriseRule> = new Schema(
  {
    ruleName: {
      type: String,
    },
    platformId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IntegrationPlatform",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    integrationUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IntegrationUser",
    },
    credentialId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "ACTIVE",
    },
    fileDetails: {
      type: Object,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

EnterpriseRuleSchema.post("save", async function (doc) {
  if (redisClient) {
    try {
      await redisClient.publish("enterprise_search", JSON.stringify(doc));
    } catch (err) {
      console.error("Redis publish error:", err);
    }
  }
});

const EnterpriseRuleModel = connection.enterprise.model<IEnterpriseRule>(
  "EnterpriseRule",
  EnterpriseRuleSchema
);

export default EnterpriseRuleModel;
