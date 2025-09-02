import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'poligap';

interface TaskDoc {
  _id?: ObjectId;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate?: string;
  assignee?: string;
  category?: string; // e.g., section/category name
  source: 'compliance' | 'contract';
  sourceRef?: {
    resultId?: string;
    gapId?: string;
    fileName?: string;
    standard?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, updates } = body as { id?: string; updates?: Partial<TaskDoc> };
    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'id and updates are required' }, { status: 400 });
    }

    const allowed: (keyof TaskDoc)[] = ['title','description','status','priority','dueDate','assignee','category','source','sourceRef'];
    const set: any = { updatedAt: new Date() };
    for (const k of allowed) {
      if (k in updates && typeof (updates as any)[k] !== 'undefined') {
        set[k] = (updates as any)[k];
      }
    }
    if ('status' in set && !['pending','in-progress','completed'].includes(set.status)) {
      return NextResponse.json({ success: false, error: 'invalid status' }, { status: 400 });
    }
    if ('priority' in set && !['critical','high','medium','low'].includes(set.priority)) {
      return NextResponse.json({ success: false, error: 'invalid priority' }, { status: 400 });
    }
    if ('source' in set && !['compliance','contract','manual'].includes(set.source)) {
      return NextResponse.json({ success: false, error: 'invalid source' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection<TaskDoc>('tasks');
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: set });
    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let id: string | null = null;
    // accept id from query or body
    const { searchParams } = new URL(request.url);
    id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = (body && body.id) || null;
    }
    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }
    const db = await connectToDatabase();
    const collection = db.collection<TaskDoc>('tasks');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}

async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(DB_NAME);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');

    const db = await connectToDatabase();
    const collection = db.collection<TaskDoc>('tasks');

    const filter: any = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (status && ['pending','in-progress','completed'].includes(status)) filter.status = status;
    if (priority && ['critical','high','medium','low'].includes(priority)) filter.priority = priority;
    if (source && ['compliance','contract'].includes(source)) filter.source = source;

    const tasks = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json({
      success: true,
      tasks: tasks.map(t => ({ ...t, _id: t._id?.toString() })),
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      status = 'pending',
      priority = 'medium',
      dueDate,
      assignee,
      category,
      source = 'compliance',
      sourceRef,
    } = body || {};

    if (!title) {
      return NextResponse.json({ success: false, error: 'title is required' }, { status: 400 });
    }

    if (!['pending','in-progress','completed'].includes(status)) {
      return NextResponse.json({ success: false, error: 'invalid status' }, { status: 400 });
    }
    if (!['critical','high','medium','low'].includes(priority)) {
      return NextResponse.json({ success: false, error: 'invalid priority' }, { status: 400 });
    }
    if (!['compliance','contract'].includes(source)) {
      return NextResponse.json({ success: false, error: 'invalid source' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection<TaskDoc>('tasks');

    const now = new Date();
    const task: TaskDoc = {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      category,
      source,
      sourceRef,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(task);
    return NextResponse.json({ success: true, id: result.insertedId.toString(), task: { ...task, _id: result.insertedId.toString() } });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}
