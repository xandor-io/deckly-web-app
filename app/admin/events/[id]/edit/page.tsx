import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import EditEventForm from './EditEventForm';

export default async function EditEventPage({
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

  const Event = (await import('@/models/Event')).default;
  const Venue = (await import('@/models/Venue')).default;

  // Fetch event
  const event = await Event.findById(id).populate('venueId').lean();

  if (!event) {
    redirect('/admin/events');
  }

  // Fetch all venues
  const venues = await Venue.find({ isActive: true }).sort({ name: 1 }).lean();

  const serializedEvent = {
    _id: event._id.toString(),
    name: event.name,
    venueId: event.venueId._id.toString(),
    date: event.date.toISOString().split('T')[0], // YYYY-MM-DD format for input
    startTime: event.startTime,
    endTime: event.endTime,
    description: event.description || '',
    ticketUrl: event.ticketUrl || '',
    status: event.status,
    externalSource: event.externalSource,
  };

  const serializedVenues = venues.map((venue) => ({
    _id: venue._id.toString(),
    name: venue.name,
    city: venue.city,
    state: venue.state,
  }));

  return <EditEventForm event={serializedEvent} venues={serializedVenues} />;
}
