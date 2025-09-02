import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('Test file upload:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Try to read the file content
    let content = '';
    let method = '';

    try {
      // Method 1: Direct text reading
      content = await file.text();
      method = 'file.text()';
      console.log('Successfully read with file.text()');
    } catch (error) {
      console.log('file.text() failed, trying ArrayBuffer');
      
      try {
        // Method 2: ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        content = decoder.decode(arrayBuffer);
        method = 'ArrayBuffer + TextDecoder';
        console.log('Successfully read with ArrayBuffer');
      } catch (error2) {
        console.error('Both methods failed:', error2);
        return NextResponse.json({
          success: false,
          error: 'Failed to read file content',
          fileInfo: {
            name: file.name,
            type: file.type,
            size: file.size
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        type: file.type,
        size: file.size
      },
      contentLength: content.length,
      contentPreview: content.substring(0, 200),
      extractionMethod: method
    });

  } catch (error) {
    console.error('Test file upload error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}