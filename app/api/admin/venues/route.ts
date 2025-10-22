import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();

    const venue = await Venue.create(data);

    return NextResponse.json({ success: true, venue }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating venue:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to create venue' },
      { status: 500 }
    );
  }
}
