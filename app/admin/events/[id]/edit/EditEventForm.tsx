'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Venue {
  _id: string;
  name: string;
  city: string;
  state: string;
}

interface Event {
  _id: string;
  name: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  ticketUrl: string;
  status: string;
  externalSource?: string;
}

interface EditEventFormProps {
  event: Event;
  venues: Venue[];
}

export default function EditEventForm({ event, venues }: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: event.name,
    venueId: event.venueId,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    description: event.description,
    ticketUrl: event.ticketUrl,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/events/${event._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update event');
      }

      router.push(`/admin/events/${event._id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/events/${event._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      router.push('/admin/events');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/admin/events/${event._id}`}
          className="mb-2 inline-block text-sm text-foreground/60 hover:text-foreground"
        >
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
        <p className="text-foreground/80">Update event details</p>
        {event.externalSource === 'ticketmaster' && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            This event was imported from Ticketmaster
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Event Details
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Event Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Saturday Night Live"
                className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Venue *
              </label>
              <select
                required
                value={formData.venueId}
                onChange={(e) =>
                  setFormData({ ...formData, venueId: e.target.value })
                }
                className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Select a venue...</option>
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name} ({venue.city}, {venue.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Event description..."
                rows={4}
                className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Ticket URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Ticket URL
              </label>
              <input
                type="url"
                value={formData.ticketUrl}
                onChange={(e) =>
                  setFormData({ ...formData, ticketUrl: e.target.value })
                }
                placeholder="https://tickets.example.com/event"
                className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/admin/events/${event._id}`}
              className="rounded-lg border border-foreground/20 bg-foreground/10 px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/20"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-foreground/80">
            Once you delete an event, there is no going back. This will also delete
            the associated run of show and DJ assignments.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-6 py-3 font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
