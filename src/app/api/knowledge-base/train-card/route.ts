import { createApiResponse } from "@/lib/apiResponse";
import Media from "@/models/media.model";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

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

    const pipeline = [
      // Step 1: Filter active media for the company
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          status: "ACTIVE",
        },
      },

      // Step 2: Convert fileSize to number
      {
        $addFields: {
          numericFileSize: {
            $toDouble: { $ifNull: ["$fileSize", "0"] },
          },
        },
      },

      // Step 3: Group by fileType for byFileType stats
      {
        $group: {
          _id: "$fileType",
          count: { $sum: 1 },
          totalSize: { $sum: "$numericFileSize" },
          docs: { $push: "$$ROOT" },
        },
      },

      // Step 4: Do overall totals (all docs together)
      {
        $group: {
          _id: null,
          byFileType: {
            $push: {
              fileType: "$_id",
              count: "$count",
              totalSize: "$totalSize",
            },
          },
          totalCount: { $sum: "$count" },
          totalSize: { $sum: "$totalSize" },
          allDocs: { $push: "$docs" },
        },
      },

      // Step 5: Flatten allDocs (from array of arrays) → single array
      {
        $addFields: {
          allDocs: {
            $reduce: {
              input: "$allDocs",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },

      // Step 6: Filter out youtube/link and get otherFiles stats
      {
        $addFields: {
          otherFilesArray: {
            $filter: {
              input: "$allDocs",
              as: "doc",
              cond: {
                $and: [
                  { $ne: ["$$doc.fileType", "youtube"] },
                  { $ne: ["$$doc.fileType", "link"] },
                ],
              },
            },
          },
        },
      },

      {
        $addFields: {
          otherFilesCount: { $size: "$otherFilesArray" },
          otherFilesTotalSize: {
            $sum: "$otherFilesArray.numericFileSize",
          },
        },
      },

      // Step 7: Format final output
      {
        $project: {
          _id: 0,
          totalCount: 1,
          totalSize: 1,
          byFileType: 1,
          otherFiles: {
            count: "$otherFilesCount",
            totalSize: "$otherFilesTotalSize",
          },
        },
      },
    ];

    const [trainCard] = await Media.aggregate(pipeline);

    if (!trainCard) {
      return createApiResponse({
        success: false,
        error: "Train card - details not found",
        status: 404,
      });
    }

    return createApiResponse({
      success: true,
      error: "",
      status: 200,
      data: trainCard,
    });
  } catch (error) {
    console.error("Error in getSelectedChat:", error);
    return createApiResponse({
      success: false,
      error: "Failed to get conversation",
      status: 500,
    });
  }
}
