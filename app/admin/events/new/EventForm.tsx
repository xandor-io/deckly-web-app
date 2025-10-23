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

interface EventFormProps {
  venues: Venue[];
}

export default function EventForm({ venues }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    venueId: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    ticketUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const data = await response.json();
      router.push(`/admin/events/${data.event._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="mb-2 inline-block text-sm text-foreground/60 hover:text-foreground"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
        <p className="text-foreground/80">Add a new event to your calendar</p>
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
              {loading ? 'Creating...' : 'Create Event'}
            </button>
            <Link
              href="/admin"
              className="rounded-lg border border-foreground/20 bg-foreground/10 px-6 py-3 font-medium text-foreground transition-colors hover:bg-foreground/20"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
