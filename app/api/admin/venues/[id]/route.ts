import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';

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

    const venue = await Venue.findById(params.id).lean();

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const serializedVenue = {
      ...venue,
      _id: venue._id.toString(),
      createdAt: venue.createdAt.toISOString(),
      updatedAt: venue.updatedAt.toISOString(),
      lastImportDate: venue.lastImportDate ? venue.lastImportDate.toISOString() : null,
    };

    return NextResponse.json({ success: true, venue: serializedVenue });
  } catch (error: any) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch venue' },
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

    const venue = await Venue.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, venue });
  } catch (error: any) {
    console.error('Error updating venue:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to update venue' },
      { status: 500 }
    );
  }
}
