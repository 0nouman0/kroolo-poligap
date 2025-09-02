import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { createApiResponse } from "@/lib/apiResponse";
import Media from "@/models/media.model";
import Company from "@/models/companies.model";

/**
 * Uploads media file to knowledge base and associates it with a company.
 *
 * @param companyId - ID of the company to associate media with
 * @param userId - ID of user uploading the media
 * @param mediaData - Object containing media details:
 *   - fileUrl: URL where file is stored
 *   - fileName: Name of the file
 *   - fileType: MIME type of file
 *   - fileSize: Size of file in bytes
 * @returns Object containing upload status and new media details
 */
async function uploadKnowledgeBaseMedia(
  companyId: string,
  userId: string,
  mediaData?: {
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: string;
  }
) {
  try {
    const newMedia = await Media.create({
      fileUrl: mediaData?.fileUrl || "",
      fileName: mediaData?.fileName || "",
      fileType: mediaData?.fileType || "",
      fileSize: mediaData?.fileSize || "0",
      companyId: new mongoose.Types.ObjectId(companyId),
      uploadedBy: new mongoose.Types.ObjectId(userId),
      status: "ACTIVE",
    });

    await Company.findOneAndUpdate(
      { companyId: new mongoose.Types.ObjectId(companyId) },
      { $push: { media: newMedia._id } },
      { new: true }
    );

    return {
      message: "Media uploaded successfully",
      code: 200,
      newMedia,
    };
  } catch (error) {
    console.error("Error in uploadKnowledgeBaseMedia:", error);
    return {
      message: "Failed to upload media",
      code: 500,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * POST /api/company/upload-knowledge-base-media
 * Body: { companyId: string, userId: string, mediaData: { fileUrl, fileName, fileType, fileSize } }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, userId, mediaData } = body;

    if (!companyId || !userId || !mediaData?.fileName || !mediaData?.fileType) {
      return createApiResponse({
        success: false,
        error:
          "Missing required fields: companyId, userId, fileName, or fileType",
        status: 400,
      });
    }

    const result = await uploadKnowledgeBaseMedia(companyId, userId, mediaData);

    return createApiResponse({
      success: result.code === 200,
      error: result.code !== 200 ? result.message : "",
      status: result.code,
      data: result,
    });
  } catch (error) {
    console.error("Error in POST /upload-knowledge-base-media:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
