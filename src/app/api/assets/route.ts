import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all assets
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');
    
    // Build query
    let query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const assets = await db
      .collection('assets')
      .find(query)
      .sort({ uploadDate: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      assets: assets.map(asset => {
        const id = asset._id.toString();
        const thumbnailUrl = (asset as any).thumbnailData ? `/api/assets/file/${id}?thumb=1` : (asset as any).thumbnailUrl;
        return {
          ...asset,
          url: `/api/assets/file/${id}`,
          thumbnailUrl,
          _id: id,
        };
      })
    });
    
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

// DELETE - Delete multiple assets
export async function DELETE(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { assetIds } = await request.json();
    
    if (!assetIds || !Array.isArray(assetIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid asset IDs provided' },
        { status: 400 }
      );
    }
    
    // Convert string IDs to ObjectIds
    const objectIds = assetIds.map(id => new ObjectId(id));
    
    // Get assets to delete (for file cleanup)
    const assetsToDelete = await db
      .collection('assets')
      .find({ _id: { $in: objectIds } })
      .toArray();
    
    // Delete from database
    const result = await db
      .collection('assets')
      .deleteMany({ _id: { $in: objectIds } });
    
    // TODO: Delete actual files from storage (implement based on your storage solution)
    // This would typically involve deleting files from your file storage system
    
    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} asset(s)`
    });
    
  } catch (error) {
    console.error('Error deleting assets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete assets' },
      { status: 500 }
    );
  }
}
