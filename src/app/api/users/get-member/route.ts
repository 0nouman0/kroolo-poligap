// Example: /api/users/get-member
import Member from "@/models/members.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId, companyId } = await req.json();
  const member = await Member.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    companyId: new mongoose.Types.ObjectId(companyId),
    status: "ACTIVE",
  }).lean();
  return NextResponse.json({ member });
}