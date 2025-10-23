import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RunOfShow from '@/models/RunOfShow';
import Event from '@/models/Event';

/**
 * GET /api/admin/events/[id]/run-of-show
 * Fetch run of show for an event
 */
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

    const runOfShow = await RunOfShow.findOne({ eventId: params.id })
      .populate('timeSlots.djAssignments.djId')
      .lean();

    if (!runOfShow) {
      return NextResponse.json({ runOfShow: null }, { status: 200 });
    }

    return NextResponse.json({ runOfShow }, { status: 200 });
  } catch (error) {
    console.error('Error fetching run of show:', error);
    return NextResponse.json(
      { error: 'Failed to fetch run of show' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events/[id]/run-of-show
 * Create a new run of show for an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify event exists
    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if run of show already exists
    const existing = await RunOfShow.findOne({ eventId: params.id });
    if (existing) {
      return NextResponse.json(
        { error: 'Run of show already exists for this event' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { timeSlots } = body;

    const runOfShow = await RunOfShow.create({
      eventId: params.id,
      timeSlots: timeSlots || [],
    });

    const populated = await RunOfShow.findById(runOfShow._id)
      .populate('timeSlots.djAssignments.djId')
      .lean();

    // Serialize the response
    const serialized = {
      _id: populated!._id.toString(),
      eventId: populated!.eventId.toString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timeSlots: populated!.timeSlots.map((slot: any) => ({
        _id: slot._id?.toString(),
        slotName: slot.slotName,
        slotType: slot.slotType,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxDJs: slot.maxDJs,
        notes: slot.notes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        djAssignments: slot.djAssignments.map((assignment: any) => ({
          djId: {
            _id: assignment.djId._id.toString(),
            name: assignment.djId.name,
            email: assignment.djId.email,
            genres: assignment.djId.genres,
          },
          status: assignment.status,
          notificationSent: assignment.notificationSent,
          notificationSentAt: assignment.notificationSentAt?.toISOString(),
          confirmedAt: assignment.confirmedAt?.toISOString(),
          notes: assignment.notes,
        })),
      })),
    };

    return NextResponse.json({ runOfShow: serialized }, { status: 201 });
  } catch (error) {
    console.error('Error creating run of show:', error);
    return NextResponse.json(
      { error: 'Failed to create run of show' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/events/[id]/run-of-show
 * Update run of show for an event
 */
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

    const body = await request.json();
    const { timeSlots } = body;

    // Find or create run of show
    let runOfShow = await RunOfShow.findOne({ eventId: params.id });

    if (!runOfShow) {
      // Create if doesn't exist
      runOfShow = await RunOfShow.create({
        eventId: params.id,
        timeSlots: timeSlots || [],
      });
    } else {
      // Update existing
      runOfShow.timeSlots = timeSlots;
      await runOfShow.save();
    }

    const populated = await RunOfShow.findById(runOfShow._id)
      .populate('timeSlots.djAssignments.djId')
      .lean();

    // Serialize the response
    const serialized = {
      _id: populated!._id.toString(),
      eventId: populated!.eventId.toString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timeSlots: populated!.timeSlots.map((slot: any) => ({
        _id: slot._id?.toString(),
        slotName: slot.slotName,
        slotType: slot.slotType,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxDJs: slot.maxDJs,
        notes: slot.notes,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        djAssignments: slot.djAssignments.map((assignment: any) => ({
          djId: {
            _id: assignment.djId._id.toString(),
            name: assignment.djId.name,
            email: assignment.djId.email,
            genres: assignment.djId.genres,
          },
          status: assignment.status,
          notificationSent: assignment.notificationSent,
          notificationSentAt: assignment.notificationSentAt?.toISOString(),
          confirmedAt: assignment.confirmedAt?.toISOString(),
          notes: assignment.notes,
        })),
      })),
    };

    return NextResponse.json({ runOfShow: serialized }, { status: 200 });
  } catch (error) {
    console.error('Error updating run of show:', error);
    return NextResponse.json(
      { error: 'Failed to update run of show' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/events/[id]/run-of-show
 * Delete run of show for an event
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    await RunOfShow.findOneAndDelete({ eventId: params.id });

    return NextResponse.json({ message: 'Run of show deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting run of show:', error);
    return NextResponse.json(
      { error: 'Failed to delete run of show' },
      { status: 500 }
    );
  }
}
