import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IBilling extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  plan: string;
  billingCycle: string;
  activeUsers: number;
  currentBill: number;
  nextPayment: number;
  paymentDate: Date;
  nextPaymentDate: Date;
  usage: {
    workspaces: { current: number; available: number };
    projects: { current: number; available: number };
    goals: { current: number; available: number };
    docs: { current: number; available: number };
    teams: { current: number; available: number };
    channels: { current: number; available: number };
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillingSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Company",
    },
    plan: {
      type: String,
      required: true,
      enum: ["Starter", "Professional", "Enterprise"],
      default: "Starter",
    },
    billingCycle: {
      type: String,
      required: true,
      enum: ["Monthly", "Yearly"],
      default: "Monthly",
    },
    activeUsers: {
      type: Number,
      required: true,
      default: 1,
    },
    currentBill: {
      type: Number,
      required: false,
      default: 0,
    },
    nextPayment: {
      type: Number,
      required: false,
      default: 0,
    },
    paymentDate: {
      type: Date,
      required: false,
    },
    nextPaymentDate: {
      type: Date,
      required: false,
    },
    usage: {
      workspaces: {
        current: { type: Number, default: 0 },
        available: { type: Number, default: 1 },
      },
      projects: {
        current: { type: Number, default: 0 },
        available: { type: Number, default: 5 },
      },
      goals: {
        current: { type: Number, default: 0 },
        available: { type: Number, default: 5 },
      },
      docs: {
        current: { type: Number, default: 0 },
        available: { type: Number, default: 10 },
      },
      teams: {
        current: { type: Number, default: 0 },
        available: { type: Number, default: 5 },
      },
      channels: {
        current: { type: Number, default: 0 },
        available: { type: Number, default: 5 },
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const BillingModel = connection.enterprise.model<IBilling>("Billing", BillingSchema);

export default BillingModel;
