import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event, { EventStatus } from '@/models/Event';
import Venue from '@/models/Venue';

/**
 * GET /api/admin/events
 * Fetch all events
 */
export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const events = await Event.find({})
      .populate('venueId')
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Create a new event
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Verify venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Create event
    const event = await Event.create({
      name,
      venueId,
      date: new Date(date),
      startTime,
      endTime,
      description,
      ticketUrl,
      status: EventStatus.DRAFT,
      externalSource: 'manual',
    });

    const populated = await Event.findById(event._id)
      .populate('venueId')
      .lean();

    // Serialize response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const venueData = populated!.venueId as any;
    const serialized = {
      _id: populated!._id.toString(),
      name: populated!.name,
      venueId: {
        _id: venueData._id.toString(),
        name: venueData.name,
      },
      date: populated!.date.toISOString(),
      startTime: populated!.startTime,
      endTime: populated!.endTime,
      description: populated!.description,
      ticketUrl: populated!.ticketUrl,
      status: populated!.status,
      externalSource: populated!.externalSource,
    };

    return NextResponse.json({ event: serialized }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
