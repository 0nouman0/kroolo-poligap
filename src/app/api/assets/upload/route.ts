import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// POST - Upload new asset
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'others';
    const description = formData.get('description') as string || '';
    const tags = formData.get('tags') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || '';
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    
    // Read file into buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate thumbnail for images
    let thumbnailBuffer: Buffer | null = null;
    if (file.type.startsWith('image/')) {
      try {
        thumbnailBuffer = await sharp(buffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }
    
    // Prepare asset document
    const assetDoc = {
      filename: uniqueFilename,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      category: category,
      description: description,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      // URLs will be formed after insert using the created _id
      fileData: buffer,
      thumbnailData: thumbnailBuffer,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert into MongoDB
    const result = await db.collection('assets').insertOne(assetDoc);
    
    // Return the created asset
    const createdAsset = {
      ...assetDoc,
      _id: result.insertedId.toString()
    };
    // Attach API URLs based on _id
    (createdAsset as any).url = `/api/assets/file/${createdAsset._id}`;
    if (thumbnailBuffer) {
      (createdAsset as any).thumbnailUrl = `/api/assets/file/${createdAsset._id}?thumb=1`;
    }
    
    return NextResponse.json({
      success: true,
      asset: createdAsset,
      message: 'Asset uploaded successfully'
    });
    
  } catch (error) {
    console.error('Error uploading asset:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload asset' },
      { status: 500 }
    );
  }
}
