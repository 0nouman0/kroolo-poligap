import { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, bucketName } from "@/lib/s3-config";
import { createApiResponse } from "@/lib/apiResponse";
import User from "@/models/users.model";
import mongoose from "mongoose";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get("type") as string;
    const userId = formData.get("userId") as string;
    const file = formData.get("file") as File;

    if (!type || !userId) {
      return createApiResponse({
        success: false,
        error: "Type and userId are required",
        status: 400,
      });
    }

    if (!file || !file.type.startsWith("image/")) {
      return createApiResponse({
        success: false,
        error: "Only image files are supported",
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 75 }) // You can tune quality
      .toBuffer();

    const fileName = `enterprise-search/${Date.now()}-${
      file.name.split(".")[0]
    }.webp`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: webpBuffer,
        ContentType: "image/webp",
      })
    );

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    if (type === "banner") {
      await User.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $set: {
            banner: {
              image: fileUrl,
            },
          },
        },
        { upsert: true }
      );
    } else if (type === "profileImage") {
      await User.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          $set: {
            profileImage: fileUrl,
          },
        },
        { upsert: true }
      );
    }

    return createApiResponse({
      success: true,
      data: { fileUrl },
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
