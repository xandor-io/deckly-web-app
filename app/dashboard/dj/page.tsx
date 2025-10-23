import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RunOfShow from '@/models/RunOfShow';
import Event from '@/models/Event';
import { format } from 'date-fns';
import LogoutButton from '@/components/auth/LogoutButton';
import DecklyLogo from '@/components/DecklyLogo';
import { ShaderBackground } from '@/components/ShaderBackground';
import { Types } from 'mongoose';

interface DJAssignmentLean {
  djId: Types.ObjectId;
  status: string;
  notificationSent: boolean;
  notificationSentAt?: Date;
  confirmedAt?: Date;
  notes?: string;
}

interface TimeSlotLean {
  _id?: Types.ObjectId;
  slotName: string;
  slotType: string;
  startTime: string;
  endTime: string;
  djAssignments: DJAssignmentLean[];
  maxDJs?: number;
  notes?: string;
}

interface RunOfShowLean {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  timeSlots: TimeSlotLean[];
  createdAt: Date;
  updatedAt: Date;
}

interface VenuePopulated {
  _id: Types.ObjectId;
  name: string;
  city: string;
  state: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EventPopulated {
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

export default async function DJDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If user doesn't have a DJ profile yet, show a setup message
  if (!user.djId) {
    return (
      <div className="relative min-h-screen">
        <ShaderBackground />
        <nav className="relative z-10 border-b border-border/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <DecklyLogo />
                <h1 className="text-xl font-semibold text-foreground">DJ Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">{user.name || user.email}</span>
                <LogoutButton className="text-sm text-muted-foreground hover:text-foreground" />
              </div>
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to Deckly!</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been created. An admin will set up your DJ profile soon.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Once your profile is set up, you&apos;ll be able to view your bookings and schedules here.
            </p>
          </div>
        </main>
      </div>
    );
  }

  await dbConnect();

  // Import Venue to ensure it's registered for population
  await import('@/models/Venue');

  // Get all bookings for this DJ
  const runOfShows = await RunOfShow.find({
    'timeSlots.djAssignments.djId': user.djId,
  })
    .populate('eventId')
    .lean<RunOfShowLean[]>();

  // Extract events and filter DJ's specific time slots
  const bookings = await Promise.all(
    runOfShows.map(async (ros) => {
      const event = await Event.findById(ros.eventId).populate('venueId').lean<EventPopulated>();
      if (!event) return null;

      const djSlots = ros.timeSlots
        .map((slot: TimeSlotLean) => {
          const djAssignment = slot.djAssignments.find(
            (assignment: DJAssignmentLean) => assignment.djId.toString() === user.djId?.toString()
          );
          if (!djAssignment) return null;
          return {
            ...slot,
            djAssignment,
          };
        })
        .filter((slot) => slot !== null);

      return {
        event,
        slots: djSlots,
      };
    })
  );

  const validBookings = bookings.filter((b) => b !== null);

  return (
    <div className="relative min-h-screen">
      <ShaderBackground />
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <DecklyLogo />
              <h1 className="text-xl font-semibold text-foreground">DJ Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">{user.name || user.email}</span>
              <LogoutButton className="text-sm text-muted-foreground hover:text-foreground" />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <p className="font-medium text-foreground">{(user.djId as any).name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <p className="font-medium text-foreground">{(user.djId as any).email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Genres</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(user.djId as any).genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-medium"
                  >
                    {genre.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="font-medium text-2xl text-primary">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(user.djId as any).bookingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Bookings</h2>

          {validBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No bookings yet. Check back soon!
            </p>
          ) : (
            <div className="space-y-4">
              {validBookings.map((booking, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-xl p-4 hover:border-border/70 transition-colors bg-background/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {booking.event.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.event.venueId.name}
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        {booking.event.venueId.city}, {booking.event.venueId.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(booking.event.date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.event.startTime} - {booking.event.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {booking.slots.map((slot, slotIdx) => (
                      <div
                        key={slotIdx}
                        className="bg-background/50 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-foreground">{slot.slotName}</p>
                          <p className="text-sm text-muted-foreground">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                              slot.djAssignment.status === 'confirmed'
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : slot.djAssignment.status === 'pending'
                                ? 'bg-accent/20 text-accent border border-accent/30'
                                : 'bg-destructive/20 text-destructive border border-destructive/30'
                            }`}
                          >
                            {slot.djAssignment.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-sm font-medium">
                          {slot.slotType.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
