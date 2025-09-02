import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface ICompany extends Document {
  name: string;
  companyId: mongoose.Types.ObjectId;
  enableKnowledgeBase: boolean;
  media: [
    {
      type: mongoose.Types.ObjectId;
      ref: "Media";
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    enableKnowledgeBase: {
      type: Boolean,
      default: false,
    },
    media: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Media",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CompanyModel = connection.enterprise.model<ICompany>(
  "Company",
  CompanySchema
);

export default CompanyModel;
