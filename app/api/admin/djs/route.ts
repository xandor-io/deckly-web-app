import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DJ from '@/models/DJ';

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    const dj = await DJ.create(data);

    return NextResponse.json({ success: true, dj }, { status: 201 });
  } catch (error) {
    console.error('Error creating DJ:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'A DJ with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create DJ' },
      { status: 500 }
    );
  }
}
