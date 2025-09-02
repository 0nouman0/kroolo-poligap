import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Add tags to multiple assets
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { assetIds, tags } = await request.json();
    
    if (!assetIds || !Array.isArray(assetIds) || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset IDs or tags provided' },
        { status: 400 }
      );
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = assetIds.map(id => new ObjectId(id));
    
    // Add tags to existing tags (avoid duplicates)
    const result = await db
      .collection('assets')
      .updateMany(
        { _id: { $in: objectIds } },
        { 
          $addToSet: { tags: { $each: tags } },
          $set: { updatedAt: new Date() }
        }
      );
    
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Successfully added tags to ${result.modifiedCount} asset(s)`
    });
    
  } catch (error) {
    console.error('Error adding tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add tags' },
      { status: 500 }
    );
  }
}

// DELETE - Remove tags from multiple assets
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { assetIds, tags } = await request.json();
    
    if (!assetIds || !Array.isArray(assetIds) || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset IDs or tags provided' },
        { status: 400 }
      );
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = assetIds.map(id => new ObjectId(id));
    
    // Remove tags from assets
    const result = await db
      .collection('assets')
      .updateMany(
        { _id: { $in: objectIds } },
        { 
          $pullAll: { tags: tags },
          $set: { updatedAt: new Date() }
        }
      );
    
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `Successfully removed tags from ${result.modifiedCount} asset(s)`
    });
    
  } catch (error) {
    console.error('Error removing tags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove tags' },
      { status: 500 }
    );
  }
}
