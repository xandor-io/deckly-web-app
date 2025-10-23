import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import RunOfShow from '@/models/RunOfShow';

/**
 * GET /api/admin/events/[id]
 * Fetch a single event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const event = await Event.findById(id).populate('venueId').lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]
 * Update an event
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const body = await request.json();
    const { name, venueId, date, startTime, endTime, description, ticketUrl } = body;

    // Validate required fields
    if (!name || !venueId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update event
    const event = await Event.findByIdAndUpdate(
      id,
      {
        name,
        venueId,
        date: new Date(date),
        startTime,
        endTime,
        description,
        ticketUrl,
      },
      { new: true, runValidators: true }
    )
      .populate('venueId')
      .lean();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Serialize response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const venueData = event.venueId as any;
    const serialized = {
      _id: event._id.toString(),
      name: event.name,
      venueId: {
        _id: venueData._id.toString(),
        name: venueData.name,
      },
      date: event.date.toISOString(),
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
      ticketUrl: event.ticketUrl,
      status: event.status,
    };

    return NextResponse.json({ event: serialized }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]
 * Delete an event and its associated run of show
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    // Delete event
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete associated run of show
    await RunOfShow.findOneAndDelete({ eventId: id });

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
