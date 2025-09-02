import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3-config";
import { createApiResponse } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const customPath = formData.get("path") as string;

    if (!file) {
      return createApiResponse({
        success: false,
        error: "File is required",
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "";
    const fileName = `${customPath || "uploads"}/${Date.now()}-${file.name}`;

    // Set appropriate content type based on file extension
    const contentType = file.type || "application/octet-stream";

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        ContentDisposition: "inline",
        Metadata: {
          fileExtension,
        },
      })
    );

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return createApiResponse({
      success: true,
      data: {
        fileUrl,
        fileName,
        contentType,
        size: buffer.length,
        fileExtension,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return createApiResponse({
      success: false,
      error: "Failed to upload file",
      status: 500,
    });
  }
}
