/**
 * GET /api/knowledge-base/overview
 *
 * Fetches:
 *  - enableKnowledgeBase status of the company
 *  - First page of media files per virtual group: youtube, link, other
 *
 * Query Parameters:
 * - companyId: string (required) → The company's ObjectId
 * - limit: number (default: 10) → Number of items to fetch per group
 *
 * Response:
 * {
 *   success: true,
 *   error: "",
 *   status: 200,
 *   data: {
 *     enabled: boolean,
 *     youtube: { totalCount, totalPages, files: [...] },
 *     link: { totalCount, totalPages, files: [...] },
 *     other: { totalCount, totalPages, files: [...] }
 *   }
 * }
 */
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { createApiResponse } from "@/lib/apiResponse";
import Media from "@/models/media.model";
import Company from "@/models/companies.model";

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const companyId = url.searchParams.get("companyId");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!companyId) {
      return createApiResponse({
        success: false,
        error: "Missing companyId",
        status: 400,
      });
    }

    const objectCompanyId = new mongoose.Types.ObjectId(companyId);

    // Fetch enableKnowledgeBase from Company
    const company = await Company.findOne({
      companyId: objectCompanyId,
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

    // Step 1: aggregation - create virtualGroup and group files
    const pipeline = [
      {
        $match: {
          companyId: objectCompanyId,
          status: "ACTIVE",
        },
      },
      {
        $addFields: {
          virtualGroup: {
            $switch: {
              branches: [
                { case: { $eq: ["$fileType", "youtube"] }, then: "youtube" },
                { case: { $eq: ["$fileType", "link"] }, then: "link" },
              ],
              default: "other",
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$virtualGroup",
          files: {
            $push: {
              fileUrl: "$fileUrl",
              fileType: "$fileType",
              fileName: "$fileName",
              fileSize: "$fileSize",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $project: {
          group: "$_id",
          totalCount: { $size: "$files" },
          files: { $slice: ["$files", limit] },
        },
      },
      {
        $addFields: {
          totalPages: {
            $ceil: { $divide: ["$totalCount", limit] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          group: 1,
          totalCount: 1,
          totalPages: 1,
          files: 1,
        },
      },
    ];

    const results = await Media.aggregate(pipeline as mongoose.PipelineStage[]);

    // Map into final object with default empty groups
    const groupedData: Record<
      "youtube" | "link" | "other",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { totalCount: number; totalPages: number; files: any[] }
    > = {
      youtube: { totalCount: 0, totalPages: 0, files: [] },
      link: { totalCount: 0, totalPages: 0, files: [] },
      other: { totalCount: 0, totalPages: 0, files: [] },
    };

    for (const group of results) {
      if (groupedData[group.group as "youtube" | "link" | "other"]) {
        groupedData[group.group as "youtube" | "link" | "other"] = {
          totalCount: group.totalCount,
          totalPages: group.totalPages,
          files: group.files,
        };
      }
    }

    return createApiResponse({
      success: true,
      error: "",
      status: 200,
      data: {
        enabled: company.enableKnowledgeBase,
        ...groupedData,
      },
    });
  } catch (error) {
    console.error("Error in GET /knowledge-base-media/overview:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
