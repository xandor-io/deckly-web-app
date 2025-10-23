import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import EventForm from './EventForm';

export default async function NewEventPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  const Venue = (await import('@/models/Venue')).default;

  const venues = await Venue.find({ isActive: true }).sort({ name: 1 }).lean();

  const serializedVenues = venues.map((venue) => ({
    _id: venue._id.toString(),
    name: venue.name,
    city: venue.city,
    state: venue.state,
  }));

  return <EventForm venues={serializedVenues} />;
}
