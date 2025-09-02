import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    const id = params.id;

    const isThumb = request.nextUrl.searchParams.get('thumb') === '1';

    // Try fetch by ObjectId (if valid), then by string _id, then by legacy id field
    let asset: any = null;
    if (ObjectId.isValid(id)) {
      asset = await db.collection('assets').findOne({ _id: new ObjectId(id) });
    }
    if (!asset) {
      // Cast filters to any to support legacy records with string _id without TS errors
      asset = await (db.collection('assets').findOne as any)({ _id: id }) 
           || await (db.collection('assets').findOne as any)({ id });
    }
    if (!asset) {
      return NextResponse.json({ success: false, error: 'Asset not found' }, { status: 404 });
    }

    const fileField = isThumb ? (asset as any).thumbnailData : (asset as any).fileData;

    // fileField can be a Buffer or a BSON Binary ({ buffer: BufferLike })
    let data: Buffer;
    if (fileField && Buffer.isBuffer(fileField)) {
      data = fileField as Buffer;
    } else if (fileField?.buffer) {
      // Mongo Binary type exposes .buffer (Uint8Array)
      data = Buffer.from(fileField.buffer);
    } else {
      // Attempt to handle possible { data: <Buffer> } shapes or fall back to legacy disk
      const maybe = (fileField as any)?.data;
      if (maybe && (Buffer.isBuffer(maybe) || maybe?.buffer)) {
        data = Buffer.isBuffer(maybe) ? maybe : Buffer.from(maybe.buffer);
      } else {
        // Fallback order: legacy disk by filename -> proxy fetch original DB url (http) -> fail
        const filename: string | undefined = (asset as any).filename;
        const dbUrl: string | undefined = (asset as any).url;
        // Try legacy disk
        if (filename) {
          try {
            const uploadPath = join(process.cwd(), 'public', 'uploads', isThumb ? `thumb_${filename}` : filename);
            data = await readFile(uploadPath);
            // Hydrate DB with binary for future requests (only when fetching main file, not thumb)
            if (!isThumb) {
              try {
                const mime = (asset as any).mimetype || 'application/octet-stream';
                const updates: any = { fileData: data, updatedAt: new Date() };
                // If image, also ensure thumbnailData exists
                if (mime.startsWith('image/')) {
                  try {
                    const sharp = await import('sharp').then(m => m.default);
                    const thumbBuf = await sharp(data).resize(300, 300, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
                    updates.thumbnailData = thumbBuf;
                  } catch {}
                }
                await db.collection('assets').updateOne({ _id: new ObjectId(id) }, { $set: updates });
              } catch (e) {
                console.warn('Failed to hydrate asset binary from legacy disk:', e);
              }
            }
          } catch {
            // Try proxying original remote URL if present
            if (dbUrl && dbUrl.startsWith('http')) {
              try {
                const resp = await fetch(dbUrl);
                if (!resp.ok) {
                  return NextResponse.json({ success: false, error: 'Remote file not reachable' }, { status: 404 });
                }
                const arrayBuf = await resp.arrayBuffer();
                data = Buffer.from(arrayBuf);
                // Persist proxied data for future
                try {
                  await db.collection('assets').updateOne({ _id: new ObjectId(id) }, { $set: { fileData: data, updatedAt: new Date() } });
                } catch {}
              } catch {
                return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
              }
            } else {
              return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
            }
          }
        } else if (dbUrl && dbUrl.startsWith('http')) {
          try {
            const resp = await fetch(dbUrl);
            if (!resp.ok) {
              return NextResponse.json({ success: false, error: 'Remote file not reachable' }, { status: 404 });
            }
            const arrayBuf = await resp.arrayBuffer();
            data = Buffer.from(arrayBuf);
            // Persist proxied data for future
            try {
              await db.collection('assets').updateOne({ _id: new ObjectId(id) }, { $set: { fileData: data, updatedAt: new Date() } });
            } catch {}
          } catch {
            return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
          }
        } else {
          return NextResponse.json({ success: false, error: 'File data not available' }, { status: 404 });
        }
      }
    }

    const headers = new Headers();
    const contentType = isThumb ? 'image/jpeg' : ((asset as any).mimetype || 'application/octet-stream');
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', String(data.length));
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Disposition', `inline; filename="${isThumb ? 'thumb_' : ''}${(asset as any).filename || 'file'}"`);

    return new NextResponse(data, { status: 200, headers });
  } catch (error) {
    console.error('Error streaming asset file:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch asset file' }, { status: 500 });
  }
}
