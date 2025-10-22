import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';
import { Types } from 'mongoose';

interface VenueLean {
  _id: Types.ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity?: number;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  autoImportEnabled: boolean;
  lastImportDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const venue = await Venue.findById(id).lean<VenueLean>();

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
  } catch (error) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch venue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const data = await request.json();
    const { id } = await params;

    const venue = await Venue.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, venue });
  } catch (error) {
    console.error('Error updating venue:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update venue' },
      { status: 500 }
    );
  }
}
