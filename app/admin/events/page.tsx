import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Link from 'next/link';
import { MagneticButton } from '@/components/MagneticButton';

// Helper function to convert 24-hour time to 12-hour format
function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default async function EventsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  const Event = (await import('@/models/Event')).default;
  const Venue = (await import('@/models/Venue')).default;

  const events = await Event.find({})
    .populate('venueId')
    .sort({ date: 1 }) // Sort ascending - soonest events first
    .lean();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const serializedEvents = events.map((event: any) => ({
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
    externalSource: event.externalSource,
    ticketUrl: event.ticketUrl,
    isPast: event.date < today,
  }));

  // Sort to put upcoming events first, then past events
  serializedEvents.sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);

    // If both are upcoming or both are past, sort by date ascending
    if ((aDate >= today && bDate >= today) || (aDate < today && bDate < today)) {
      return aDate.getTime() - bDate.getTime();
    }

    // Upcoming events come before past events
    return aDate >= today ? -1 : 1;
  });

  const statusColors: { [key: string]: string } = {
    draft: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
    imported: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    ros_draft: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    ros_complete: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    pending_confirmation: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    confirmed: 'border-green-500/30 bg-green-500/10 text-green-400',
    completed: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
    cancelled: 'border-red-500/30 bg-red-500/10 text-red-400',
    scheduled: 'border-primary/30 bg-primary/20 text-primary',
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin"
            className="mb-2 inline-block text-sm text-foreground/60 hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-foreground/80">
            Manage all events across your venues
          </p>
        </div>
        <MagneticButton href="/admin/events/new" variant="primary">
          + Create Event
        </MagneticButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm text-foreground/80">Total Events</p>
          <p className="text-3xl font-bold text-foreground">
            {serializedEvents.length}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm text-foreground/80">Imported</p>
          <p className="text-3xl font-bold text-blue-400">
            {serializedEvents.filter((e) => e.externalSource === 'ticketmaster').length}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm text-foreground/80">Confirmed</p>
          <p className="text-3xl font-bold text-green-400">
            {serializedEvents.filter((e) => e.status === 'confirmed').length}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm text-foreground/80">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">
            {serializedEvents.filter((e) => e.status === 'pending_confirmation').length}
          </p>
        </div>
        <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
          <p className="mb-1 text-sm text-foreground/80">Upcoming</p>
          <p className="text-3xl font-bold text-foreground">
            {serializedEvents.filter((e) => new Date(e.date) > new Date()).length}
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl border border-foreground/20 bg-foreground/15 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/20">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Venue
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Source
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {serializedEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-foreground/60"
                  >
                    No events found. Create your first event to get started.
                  </td>
                </tr>
              ) : (
                serializedEvents.map((event) => (
                  <tr
                    key={event._id}
                    className={`border-b border-foreground/10 transition-colors hover:bg-foreground/5 ${
                      event.isPast ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/events/${event._id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {event.name}
                        </Link>
                        {event.ticketUrl && (
                          <a
                            href={event.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            🎫
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      {event.venueId.name}
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-foreground/80">
                      {formatTime12Hour(event.startTime)} -{' '}
                      {formatTime12Hour(event.endTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${
                          statusColors[event.status] ||
                          'border-foreground/20 bg-foreground/10 text-foreground/80'
                        }`}
                      >
                        {event.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {event.externalSource === 'ticketmaster' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Ticketmaster
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/60">Manual</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/events/${event._id}`}
                          className="rounded-lg border border-primary/30 bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
                        >
                          Run of Show
                        </Link>
                        <Link
                          href={`/admin/events/${event._id}/edit`}
                          className="rounded-lg border border-foreground/20 bg-foreground/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
