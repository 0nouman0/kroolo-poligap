import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  satisfaction: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    satisfaction: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const FeedbackModel = connection.enterprise.model<IFeedback>(
  "Feedback",
  FeedbackSchema
);

export default FeedbackModel;
