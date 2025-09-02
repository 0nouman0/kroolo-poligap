import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'poligap';

interface AuditLog {
  _id?: ObjectId;
  fileName: string;
  standards: string[];
  score: number;
  status: 'compliant' | 'non-compliant' | 'partial';
  gapsCount: number;
  analysisDate: Date;
  fileSize: number;
  analysisMethod?: string;
  userId?: string;
  sessionId?: string;
  snapshot?: {
    gaps?: Array<{
      id: string;
      title: string;
      description: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      category: string;
      recommendation: string;
      section?: string;
    }>;
    suggestions?: string[];
    // Optional full analysis payload for detailed History rendering
    fullResult?: any;
  };
}

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const standards = searchParams.get('standards')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const db = await connectToDatabase();
    const collection = db.collection<AuditLog>('audit_logs');
    
    // Build query to match any of the selected standards
    const query = standards.length > 0 
      ? { standards: { $in: standards } }
      : {};
    
    const logs = await collection
      .find(query)
      .sort({ analysisDate: -1 })
      .limit(limit)
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      logs: logs.map(log => ({
        ...log,
        _id: log._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fileName,
      standards,
      score,
      status,
      gapsCount,
      fileSize,
      analysisMethod,
      userId,
      sessionId,
      snapshot
    } = body;

    if (!fileName || !standards || score === undefined || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection<AuditLog>('audit_logs');
    
    const auditLog: AuditLog = {
      fileName,
      standards,
      score,
      status,
      gapsCount: gapsCount || 0,
      analysisDate: new Date(),
      fileSize: fileSize || 0,
      analysisMethod,
      userId,
      sessionId,
      snapshot
    };

    const result = await collection.insertOne(auditLog);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString(),
      log: { ...auditLog, _id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
