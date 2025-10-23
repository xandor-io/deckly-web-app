import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AdminDashboard from './AdminDashboard';
import { Types } from 'mongoose';

interface VenuePopulated {
  _id: Types.ObjectId;
  name: string;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventLean {
  _id: Types.ObjectId;
  name: string;
  venueId: VenuePopulated;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  // Import models after dbConnect to ensure proper registration
  const Event = (await import('@/models/Event')).default;

  const events = await Event.find({}).populate('venueId').sort({ date: 1 }).lean<EventLean[]>();

  const serializedEvents = events.map((event) => {
    // Deep clone and serialize the event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized: any = {
      ...event,
      _id: event._id.toString(),
      venueId: {
        ...event.venueId,
        _id: event.venueId._id.toString(),
      },
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };

    // Serialize ticketmasterData if present
    if (event.ticketmasterData) {
      serialized.ticketmasterData = JSON.parse(JSON.stringify(event.ticketmasterData));
    }

    // Serialize externalIds if present
    if (event.externalIds) {
      serialized.externalIds = JSON.parse(JSON.stringify(event.externalIds));
    }

    return serialized;
  });

  return <AdminDashboard events={serializedEvents} />;
}
