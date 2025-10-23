import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RunOfShowManager from './RunOfShowManager';

export default async function ManageRunOfShowPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  // Import models after dbConnect
  const Event = (await import('@/models/Event')).default;
  const RunOfShow = (await import('@/models/RunOfShow')).default;
  const DJ = (await import('@/models/DJ')).default;

  // Fetch event with venue
  const event = await Event.findById(params.id).populate('venueId').lean();

  if (!event) {
    redirect('/admin');
  }

  // Fetch or create run of show
  let runOfShow = await RunOfShow.findOne({ eventId: params.id })
    .populate('timeSlots.djAssignments.djId')
    .lean();

  if (!runOfShow) {
    // Create a new run of show if it doesn't exist
    runOfShow = await RunOfShow.create({
      eventId: params.id,
      timeSlots: [],
    });
    runOfShow = await RunOfShow.findById(runOfShow._id)
      .populate('timeSlots.djAssignments.djId')
      .lean();
  }

  // Fetch all DJs
  const djs = await DJ.find({ isActive: true }).sort({ name: 1 }).lean();

  // Serialize data for client component
  const serializedEvent = {
    _id: event._id.toString(),
    name: event.name,
    date: event.date.toISOString(),
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    venueId: {
      _id: event.venueId._id.toString(),
      name: event.venueId.name,
    },
  };

  const serializedRunOfShow = runOfShow
    ? {
        _id: runOfShow._id.toString(),
        eventId: runOfShow.eventId.toString(),
        timeSlots: runOfShow.timeSlots.map((slot) => ({
          _id: slot._id?.toString(),
          slotName: slot.slotName,
          slotType: slot.slotType,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxDJs: slot.maxDJs,
          notes: slot.notes,
          djAssignments: slot.djAssignments.map((assignment) => ({
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
      }
    : null;

  const serializedDJs = djs.map((dj) => ({
    _id: dj._id.toString(),
    name: dj.name,
    email: dj.email,
    genres: dj.genres,
    rating: dj.rating,
    bookingCount: dj.bookingCount,
  }));

  return (
    <RunOfShowManager
      event={serializedEvent}
      runOfShow={serializedRunOfShow}
      availableDJs={serializedDJs}
    />
  );
}
