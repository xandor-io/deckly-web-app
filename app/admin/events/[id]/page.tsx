import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RunOfShowManager from './RunOfShowManager';

export default async function ManageRunOfShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  const { id } = await params;

  await dbConnect();

  // Import models after dbConnect
  const Event = (await import('@/models/Event')).default;
  const RunOfShow = (await import('@/models/RunOfShow')).default;
  const DJ = (await import('@/models/DJ')).default;

  // Fetch event with venue
  const event = await Event.findById(id).populate('venueId').lean();

  if (!event) {
    redirect('/admin');
  }

  // Fetch or create run of show
  let runOfShow = await RunOfShow.findOne({ eventId: id })
    .populate('timeSlots.djAssignments.djId')
    .lean();

  if (!runOfShow) {
    // Create a new run of show if it doesn't exist
    const created = await RunOfShow.create({
      eventId: id,
      timeSlots: [],
    });
    runOfShow = await RunOfShow.findById(created._id)
      .populate('timeSlots.djAssignments.djId')
      .lean();
  }

  // Fetch all DJs
  const djs = await DJ.find({ isActive: true }).sort({ name: 1 }).lean();

  // Serialize data for client component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const venueData = event.venueId as any;
  const serializedEvent = {
    _id: event._id.toString(),
    name: event.name,
    date: event.date.toISOString(),
    startTime: event.startTime,
    endTime: event.endTime,
    status: event.status,
    venueId: {
      _id: venueData._id.toString(),
      name: venueData.name,
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
          djAssignments: slot.djAssignments.map((assignment) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const djData = assignment.djId as any;
            return {
              djId: {
                _id: djData._id.toString(),
                name: djData.name,
                email: djData.email,
                genres: djData.genres,
              },
              status: assignment.status,
              notificationSent: assignment.notificationSent,
              notificationSentAt: assignment.notificationSentAt?.toISOString(),
              confirmedAt: assignment.confirmedAt?.toISOString(),
              notes: assignment.notes,
            };
          }),
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
