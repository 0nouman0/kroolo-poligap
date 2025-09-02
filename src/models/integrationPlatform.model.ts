import { Document, Schema } from "mongoose";
import connection from "@/lib/db";

export interface IIntegrationPlatform extends Document {
  name: string;
  loginUrl?: string;
  logo?: string;
  title?: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  isVisible: boolean;
  position?: number;
  imageUrl?: string;
  onboarding: boolean;
  isVisibleOnProject: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationPlatformSchema: Schema<IIntegrationPlatform> = new Schema(
  {
    name: {
      type: String,
      maxlength: 200,
      required: true,
    },
    loginUrl: {
      type: String,
    },
    logo: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
    },
    imageUrl: {
      type: String,
    },
    onboarding: {
      type: Boolean,
      default: false,
    },
    isVisibleOnProject: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

IntegrationPlatformSchema.set("toObject", { virtuals: true });
IntegrationPlatformSchema.set("toJSON", { virtuals: true });

IntegrationPlatformSchema.virtual("IntegrationUser", {
  ref: "IntegrationUser",
  localField: "_id",
  foreignField: "platformId",
});

IntegrationPlatformSchema.virtual("connectedUser", {
  ref: "IntegrationUser",
  localField: "_id",
  foreignField: "platformId",
  justOne: true,
});

const IntegrationPlatformModel =
  connection.enterprise.model<IIntegrationPlatform>(
    "IntegrationPlatform",
    IntegrationPlatformSchema
  );

export default IntegrationPlatformModel;
