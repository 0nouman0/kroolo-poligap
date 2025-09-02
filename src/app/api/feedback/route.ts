import { NextRequest } from "next/server";
import FeedbackModel from "@/models/feedback.model";
import { createApiResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const { satisfaction, text, userId, companyId } = await request.json();
    if (!satisfaction || !userId || !companyId) {
      return createApiResponse({
        success: false,
        error: "Satisfaction, userId, and companyId are required",
        status: 400,
      });
    }
    const feedback = await FeedbackModel.create({
      satisfaction,
      text,
      userId,
      companyId,
    });
    return createApiResponse({
      success: true,
      data: feedback,
      status: 201,
    });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
