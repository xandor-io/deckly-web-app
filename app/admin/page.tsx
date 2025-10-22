import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  const events = await Event.find({}).populate('venueId').sort({ date: 1 }).lean();

  const serializedEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    venueId: {
      ...event.venueId,
      _id: event.venueId._id.toString(),
    },
    date: event.date.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  }));

  return <AdminDashboard events={serializedEvents} />;
}
