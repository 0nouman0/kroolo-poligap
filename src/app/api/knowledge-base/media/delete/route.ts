import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { createApiResponse } from "@/lib/apiResponse";
import Media from "@/models/media.model";
import Company from "@/models/companies.model";

/**
 * DELETE /api/media/delete
 * Body: { companyId: string, mediaId: string }
 *
 * - Removes mediaId from company's media list
 * - Sets media.status to "DELETED"
 */
export async function DELETE(request: NextRequest) {
  try {
    const { companyId, mediaId } = await request.json();

    // Validate required fields
    if (!companyId || !mediaId) {
      return createApiResponse({
        success: false,
        error: "Missing companyId or mediaId",
        status: 400,
      });
    }

    const objectCompanyId = new mongoose.Types.ObjectId(companyId);
    const objectMediaId = new mongoose.Types.ObjectId(mediaId);

    // Step 1: Update media status to DELETED
    const updatedMedia = await Media.findOneAndUpdate(
      { _id: objectMediaId, companyId: objectCompanyId, status: "ACTIVE" },
      { $set: { status: "DELETED" } },
      { new: true }
    ).lean();

    if (!updatedMedia) {
      return createApiResponse({
        success: false,
        error: "Media not found or already deleted",
        status: 404,
      });
    }

    // Step 2: Remove mediaId from company's media list
    await Company.findOneAndUpdate(
      { companyId: objectCompanyId },
      { $pull: { media: objectMediaId } }
    );

    return createApiResponse({
      success: true,
      error: "Media deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error in DELETE /delete-media:", error);
    return createApiResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
