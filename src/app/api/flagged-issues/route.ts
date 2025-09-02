import { NextRequest, NextResponse } from "next/server";
import FlaggedIssueModel from "@/models/flaggedIssue.model";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Validate required fields
    const required = [
      "userId",
      "companyId",
      "status",
      "reason",
      "name",
      "email",
      "note",
      "date",
      "link",
      "title",
    ];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }
    // Convert date to Date object if needed
    if (typeof data.date === "string") {
      data.date = new Date(data.date);
    }
    const flaggedIssue = await FlaggedIssueModel.create(data);
    return NextResponse.json({ success: true, data: flaggedIssue });
  } catch (e) {
    console.error("Error in POST /api/flagged-issues:", e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const userId = searchParams.get("userId");
    const filter: any = {};
    if (companyId) filter.companyId = companyId;
    if (userId) filter.userId = userId;
    const issues = await FlaggedIssueModel.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(issues);
  } catch (e) {
    console.error("Error in GET /api/flagged-issues:", e);
    return NextResponse.json(
      { error: "Failed to fetch flagged issues" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    if (data.companyId) {
      // Mark all issues for this company as viewed
      await FlaggedIssueModel.updateMany(
        { companyId: data.companyId },
        { $set: { viewed: true, status: "viewed" } }
      );
      return NextResponse.json({ success: true });
    } else if (data.id) {
      // Mark a single issue as viewed
      await FlaggedIssueModel.findByIdAndUpdate(data.id, {
        $set: { viewed: true, status: "viewed" },
      });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Missing companyId or id" },
        { status: 400 }
      );
    }
  } catch (e) {
    console.error("Error in PATCH /api/flagged-issues:", e);
    return NextResponse.json(
      { error: "Failed to update flagged issues" },
      { status: 500 }
    );
  }
}
