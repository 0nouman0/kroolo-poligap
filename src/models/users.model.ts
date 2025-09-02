import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IUser extends Document {
  email: string;
  name: string;
  userId: mongoose.Types.ObjectId;
  uniqueId: string;
  country: string;
  dob: string;
  mobile: string;
  profileImage: string;
  profileCreatedOn: string;
  banner: {
    image: string | null;
    color: string;
    type: string;
    yOffset: number;
  };
  about: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    uniqueId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    country: {
      type: String,
      required: false,
    },
    dob: {
      type: String,
      required: false,
    },
    mobile: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    profileCreatedOn: {
      type: String,
      required: false,
    },
    about: {
      type: String,
      required: false,
    },
    banner: {
      image: {
        type: String,
        required: false,
      },
      color: {
        type: String,
        required: false,
      },
      type: {
        type: String,
        required: false,
      },
      yOffset: {
        type: Number,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = connection.enterprise.model<IUser>("User", UserSchema);

export default UserModel;
