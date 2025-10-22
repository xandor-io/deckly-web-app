import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DJ from '@/models/DJ';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const dj = await DJ.findById(params.id).lean();

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    const serializedDJ = {
      ...dj,
      _id: dj._id.toString(),
      createdAt: dj.createdAt.toISOString(),
      updatedAt: dj.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, dj: serializedDJ });
  } catch (error: any) {
    console.error('Error fetching DJ:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch DJ' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    const dj = await DJ.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, dj });
  } catch (error: any) {
    console.error('Error updating DJ:', error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A DJ with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update DJ' },
      { status: 500 }
    );
  }
}
