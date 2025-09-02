import mongoose, { Document, Schema } from "mongoose";
import connection from "@/lib/db";

export enum MediaStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}

export interface IMedia extends Document {
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  companyId: mongoose.Types.ObjectId;
  status: MediaStatus;
  fileSize?: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema: Schema = new Schema(
  {
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MediaStatus),
      required: true,
      default: MediaStatus.ACTIVE,
    },
    fileSize: {
      type: String,
      default: "",
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

MediaSchema.set("toObject", { virtuals: true });
MediaSchema.set("toJSON", { virtuals: true });

const MediaModel =
  connection.enterprise.models.Media ||
  connection.enterprise.model<IMedia>("Media", MediaSchema);

export default MediaModel;
