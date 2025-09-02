import mongoose, { Schema, Document } from "mongoose";
import connection from "@/lib/db";

export interface IFolderPermissionUserList extends Document {
  enterpriseRuleId: mongoose.Types.ObjectId;
  permissionList?: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

const FolderPermissionUserListSchema = new Schema(
  {
    enterpriseRuleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    permissionList: {
      type: [Object],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FolderPermissionUserListModel =
  connection.enterprise.model<IFolderPermissionUserList>(
    "FolderPermissionUserList",
    FolderPermissionUserListSchema
  );

export default FolderPermissionUserListModel;
