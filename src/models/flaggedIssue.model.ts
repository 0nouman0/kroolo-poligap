import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IFlaggedIssue extends Document {
  userId: mongoose.Types.ObjectId | string;
  companyId: mongoose.Types.ObjectId | string;
  status: string;
  reason: string;
  name: string;
  email: string;
  note: string;
  date: Date;
  link: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlaggedIssueSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "viewed", "resolved", "rejected"],
      required: true,
      default: "new",
    },
    reason: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FlaggedIssueModel =
  connection.enterprise.models.FlaggedIssue ||
  connection.enterprise.model<IFlaggedIssue>(
    "FlaggedIssue",
    FlaggedIssueSchema
  );

export default FlaggedIssueModel;
