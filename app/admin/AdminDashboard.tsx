'use client';

import { useState } from 'react';
import EventCalendar from '@/components/EventCalendar';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import DecklyLogo from '@/components/DecklyLogo';

interface Event {
  _id: string;
  name: string;
  venueId: {
    _id: string;
    name: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface AdminDashboardProps {
  events: Event[];
}

export default function AdminDashboard({ events }: AdminDashboardProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Transform events for the calendar
  const calendarEvents = events.map((event) => {
    const eventDate = new Date(event.date);
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const start = new Date(eventDate);
    start.setHours(startHour, startMinute, 0);

    const end = new Date(eventDate);
    end.setHours(endHour, endMinute, 0);

    // Handle overnight events
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    return {
      id: event._id,
      title: `${event.name} @ ${event.venueId.name}`,
      start,
      end,
      resource: {
        eventId: event._id,
        venueName: event.venueId.name,
        status: event.status,
      },
    };
  });

  const handleSelectEvent = (calEvent: any) => {
    const event = events.find((e) => e._id === calEvent.id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // TODO: Open modal to create new event
    console.log('Create event for:', slotInfo);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <DecklyLogo />
            <div className="flex items-center gap-4">
              <Link
                href="/admin/events/new"
                className="bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 text-slate-900 px-4 py-2 rounded-lg font-semibold transition duration-200"
              >
                Create Event
              </Link>
              <LogoutButton className="text-sm text-slate-400 hover:text-white" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-1">Total Events</p>
              <p className="text-3xl font-bold text-white">{events.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-1">Scheduled</p>
              <p className="text-3xl font-bold text-cyan-400">
                {events.filter((e) => e.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-1">Draft</p>
              <p className="text-3xl font-bold text-slate-300">
                {events.filter((e) => e.status === 'draft').length}
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-indigo-400">
                {events.filter((e) => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EventCalendar
              events={calendarEvents}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          </div>

          <div className="space-y-6">
            {selectedEvent ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Event Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Event Name</p>
                    <p className="font-medium text-white">{selectedEvent.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Venue</p>
                    <p className="font-medium text-white">{selectedEvent.venueId.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="font-medium text-white">
                      {new Date(selectedEvent.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Time</p>
                    <p className="font-medium text-white">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEvent.status === 'scheduled'
                          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                          : selectedEvent.status === 'draft'
                          ? 'bg-slate-700 text-slate-300 border border-slate-600'
                          : 'bg-indigo-400/20 text-indigo-400 border border-indigo-400/30'
                      }`}
                    >
                      {selectedEvent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="pt-4 space-y-2">
                    <Link
                      href={`/admin/events/${selectedEvent._id}`}
                      className="block w-full bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 text-slate-900 text-center py-2 px-4 rounded-lg font-semibold transition duration-200"
                    >
                      Manage Run of Show
                    </Link>
                    <Link
                      href={`/admin/events/${selectedEvent._id}/edit`}
                      className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-2 px-4 rounded-lg transition duration-200"
                    >
                      Edit Event
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <p className="text-slate-400 text-center">
                  Select an event to view details
                </p>
              </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/djs"
                  className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-2 px-4 rounded-lg transition duration-200"
                >
                  Manage DJs
                </Link>
                <Link
                  href="/admin/venues"
                  className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-2 px-4 rounded-lg transition duration-200"
                >
                  Manage Venues
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
