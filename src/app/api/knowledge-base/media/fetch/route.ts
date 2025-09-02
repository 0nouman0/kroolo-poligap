import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { createApiResponse } from "@/lib/apiResponse";
import Media from "@/models/media.model";

/**
 * GET /api/company/knowledge-base-media
 *
 * Fetches paginated media files grouped by file type.
 *
 * Query Parameters:
 * - companyId: string (required) → The company's ObjectId
 * - group: "youtube" | "link" | "other" (default: "other")
 *      - "youtube": fileType === "youtube"
 *      - "link": fileType === "link"
 *      - "other": all other file types
 * - page: number (default: 1) → Pagination page number (1-based)
 * - limit: number (default: 10) → Number of items per page
 *
 * Response:
 * {
 *   success: true,
 *   error: "",
 *   status: 200,
 *   data: {
 *     group: "youtube" | "link" | "other",
 *     currentPage: number,
 *     pageSize: number,
 *     totalCount: number,
 *     totalPages: number,
 *     files: [
 *       {
 *         fileUrl: string,
 *         fileType: string,
 *         fileName: string,
 *         fileSize: string,
 *         createdAt: Date
 *       },
 *       ...
 *     ]
 *   }
 * }
 *
 * Usage example:
 *   GET /api/knowledge-base-media?companyId=64...&group=other&page=2&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const companyId = url.searchParams.get("companyId");
    const group = url.searchParams.get("group") || "other";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!companyId) {
      return createApiResponse({
        success: false,
        error: "Missing companyId",
        status: 400,
      });
    }

    if (!["youtube", "link", "other"].includes(group)) {
      return createApiResponse({
        success: false,
        error: "Invalid group value. Use: youtube, link, or other.",
        status: 400,
      });
    }

    const objectCompanyId = new mongoose.Types.ObjectId(companyId);

    // Step 1: Aggregation pipeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      // Filter by company & active
      {
        $match: {
          companyId: objectCompanyId,
          status: "ACTIVE",
        },
      },
      // Add virtual group field: youtube, link, other
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
      // Filter on requested group
      {
        $match: {
          virtualGroup: group,
        },
      },
      // Sort (newest first)
      {
        $sort: { createdAt: -1 },
      },
      // Pagination
      { $skip: (page - 1) * limit },
      { $limit: limit },
      // Final fields
      {
        $project: {
          _id: 0,
          fileUrl: 1,
          fileType: 1,
          fileName: 1,
          fileSize: 1,
          createdAt: 1,
        },
      },
    ];

    // Step 2: Run pipeline
    const files = await Media.aggregate(pipeline);

    // Step 3: totalCount for pagination (separate count)
    const countPipeline = [
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
      {
        $match: {
          virtualGroup: group,
        },
      },
      { $count: "total" },
    ];

    const countResult = await Media.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    return createApiResponse({
      success: true,
      error: "",
      status: 200,
      data: {
        group,
        currentPage: page,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        files,
      },
    });
  } catch (error) {
    console.error("Error in GET /knowledge-base-media:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
