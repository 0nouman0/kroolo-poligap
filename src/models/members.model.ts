import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IMember extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  status: ["ACTIVE", "INACTIVE"];
  designation: string;
  role: string;
  reportingManagerId: mongoose.Types.ObjectId;
  reportingManagerName: string;
  reportingManagerEmail: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdByEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user", "owner"],
      default: "user",
    },
    department: {
      type: String,
      required: false,
    },
    reportingManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    reportingManagerName: {
      type: String,
      required: false,
    },
    reportingManagerEmail: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    createdByName: {
      type: String,
      required: false,
    },
    createdByEmail: {
      type: String,
      required: false,
    },
    designation: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const MembersModel = connection.enterprise.model<IMember>(
  "Members",
  MemberSchema
);

export default MembersModel;
