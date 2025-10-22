import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import RunOfShow from '@/models/RunOfShow';
import Event from '@/models/Event';
import { format } from 'date-fns';
import LogoutButton from '@/components/auth/LogoutButton';
import DecklyLogo from '@/components/DecklyLogo';

export default async function DJDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If user doesn't have a DJ profile yet, show a setup message
  if (!user.djId) {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-8">
                <DecklyLogo />
                <h1 className="text-xl font-semibold text-white">DJ Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">{user.name || user.email}</span>
                <LogoutButton className="text-sm text-slate-400 hover:text-white" />
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Welcome to Deckly!</h2>
            <p className="text-slate-400 mb-6">
              Your account has been created. An admin will set up your DJ profile soon.
            </p>
            <p className="text-sm text-slate-500">
              Once your profile is set up, you'll be able to view your bookings and schedules here.
            </p>
          </div>
        </main>
      </div>
    );
  }

  await dbConnect();

  // Get all bookings for this DJ
  const runOfShows = await RunOfShow.find({
    'timeSlots.djAssignments.djId': user.djId,
  })
    .populate('eventId')
    .lean();

  // Extract events and filter DJ's specific time slots
  const bookings = await Promise.all(
    runOfShows.map(async (ros) => {
      const event = await Event.findById(ros.eventId).populate('venueId').lean();
      if (!event) return null;

      const djSlots = ros.timeSlots
        .map((slot) => {
          const djAssignment = slot.djAssignments.find(
            (assignment) => assignment.djId.toString() === user.djId?.toString()
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
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <DecklyLogo />
              <h1 className="text-xl font-semibold text-white">DJ Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">{user.name || user.email}</span>
              <LogoutButton className="text-sm text-slate-400 hover:text-white" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400">Name</p>
              <p className="font-medium text-white">{user.djId.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-medium text-white">{user.djId.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Genres</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.djId.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-full text-xs font-medium"
                  >
                    {genre.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Bookings</p>
              <p className="font-medium text-2xl text-cyan-400">
                {user.djId.bookingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Bookings</h2>

          {validBookings.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No bookings yet. Check back soon!
            </p>
          ) : (
            <div className="space-y-4">
              {validBookings.map((booking, idx) => (
                <div
                  key={idx}
                  className="border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {booking.event.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {booking.event.venueId.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.event.venueId.city}, {booking.event.venueId.state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {format(new Date(booking.event.date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-slate-400">
                        {booking.event.startTime} - {booking.event.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {booking.slots.map((slot, slotIdx) => (
                      <div
                        key={slotIdx}
                        className="bg-slate-900/50 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-white">{slot.slotName}</p>
                          <p className="text-sm text-slate-400">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          <span
                            className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                              slot.djAssignment.status === 'confirmed'
                                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                                : slot.djAssignment.status === 'pending'
                                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                                : 'bg-red-400/20 text-red-400 border border-red-400/30'
                            }`}
                          >
                            {slot.djAssignment.status.toUpperCase()}
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-indigo-400/20 text-indigo-400 border border-indigo-400/30 rounded-full text-sm font-medium">
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
