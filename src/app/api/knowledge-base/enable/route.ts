import mongoose from "mongoose";
import Company from "@/models/companies.model";
import { createApiResponse } from "@/lib/apiResponse";
import { NextRequest } from "next/server";

/**
 * Toggle the enableKnowledgeBase flag for a company.
 */
async function toggleKnowledgeBase(companyId: string) {
  try {
    const updatedCompany = await Company.findOneAndUpdate(
      { companyId: new mongoose.Types.ObjectId(companyId) },
      [
        {
          $set: {
            enableKnowledgeBase: {
              $cond: {
                if: { $eq: ["$enableKnowledgeBase", true] },
                then: false,
                else: true,
              },
            },
          },
        },
      ],
      { new: true }
    ).lean();

    if (!updatedCompany) {
      return {
        message: "Company not found",
        code: 404,
      };
    }

    return {
      message: "Knowledge base toggled successfully",
      code: 200,
      enabled: updatedCompany.enableKnowledgeBase,
    };
  } catch (error) {
    console.error("Error toggling knowledge base:", error);
    return {
      message: "Failed to toggle knowledge base",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * PUT /api/...
 * Toggle company's knowledge base status.
 */
export async function PUT(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return createApiResponse({
        success: false,
        error: "Missing companyId",
        status: 400,
      });
    }

    const result = await toggleKnowledgeBase(companyId);

    return createApiResponse({
      success: result.code === 200,
      error: result.code !== 200 ? result.message : "",
      status: result.code,
      data: result,
    });
  } catch (error) {
    console.error("Error in POST /toggleKnowledgeBase:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}

/**
 * GET /api/...
 * Fetch the current enableKnowledgeBase status for a company.
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId");

    if (!companyId) {
      return createApiResponse({
        success: false,
        error: "Missing companyId",
        status: 400,
      });
    }

    const company = await Company.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .select("enableKnowledgeBase")
      .lean();

    if (!company) {
      return createApiResponse({
        success: false,
        error: "Company not found",
        status: 404,
      });
    }

    return createApiResponse({
      success: true,
      error: "",
      status: 200,
      data: {
        enabled: company.enableKnowledgeBase,
      },
    });
  } catch (error) {
    console.error("Error fetching knowledge base status:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
