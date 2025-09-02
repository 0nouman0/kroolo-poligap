import { Document, Schema, Types } from "mongoose";
import connections from "@/lib/db";

export interface IEnterpriseIntegration extends Document {
  platformId: Types.ObjectId;
  userId: Types.ObjectId;
  accountId: string;
  // Active -> Integration Connected
  // Inactive -> User have the permission to connect
  // Deleted -> User deleted the integration
  status: "ACTIVE" | "DELETED" | "INACTIVE";
  permission?: boolean;
  requestPermission?: boolean;
  companyId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnterpriseIntegrationSchema: Schema<IEnterpriseIntegration> = new Schema(
  {
    platformId: {
      type: Schema.Types.ObjectId,
      ref: "IntegrationPlatform",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DELETED"],
      default: "INACTIVE",
    },
    permission: {
      type: Boolean,
    },
    requestPermission: {
      type: Boolean,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const EnterpriseIntegrationModel =
  connections.enterprise.model<IEnterpriseIntegration>(
    "EnterpriseIntegration",
    EnterpriseIntegrationSchema
  );

export default EnterpriseIntegrationModel;
