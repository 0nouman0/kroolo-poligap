import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'poligap';

interface TemplateAuditLog {
  _id?: ObjectId;
  templateId: string;
  templateName?: string;
  action?: 'selected' | 'analyzed';
  fileName?: string;
  score?: number;
  status?: 'compliant' | 'non-compliant' | 'partial';
  gapsCount?: number;
  analysisDate: Date;
  fileSize?: number;
  analysisMethod?: string;
  userId?: string;
  sessionId?: string;
  snapshot?: any;
}

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const limit = parseInt(searchParams.get('limit') || '20');
    if (!templateId) {
      return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection<TemplateAuditLog>('template_audit_logs');

    const logs = await collection
      .find({ templateId })
      .sort({ analysisDate: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      logs: logs.map(log => ({ ...log, _id: log._id?.toString() })),
    });
  } catch (error) {
    console.error('Error fetching template audit logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch template audit logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      templateId,
      templateName,
      action,
      fileName,
      score,
      status,
      gapsCount,
      fileSize,
      analysisMethod,
      userId,
      sessionId,
      snapshot,
    } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection<TemplateAuditLog>('template_audit_logs');

    const log: TemplateAuditLog = {
      templateId,
      templateName,
      action,
      fileName,
      score,
      status,
      gapsCount,
      analysisDate: new Date(),
      fileSize,
      analysisMethod,
      userId,
      sessionId,
      snapshot,
    };

    const result = await collection.insertOne(log);

    return NextResponse.json({ success: true, id: result.insertedId.toString(), log: { ...log, _id: result.insertedId.toString() } });
  } catch (error) {
    console.error('Error creating template audit log:', error);
    return NextResponse.json({ success: false, error: 'Failed to create template audit log' }, { status: 500 });
  }
}
