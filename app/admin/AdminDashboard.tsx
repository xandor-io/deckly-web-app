'use client';

import { useState } from 'react';
import EventCalendar from '@/components/EventCalendar';
import { MagneticButton } from '@/components/MagneticButton';

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

  const handleSelectEvent = (calEvent: { id: string }) => {
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
    <div className='mx-auto max-w-7xl'>
      <div className='mb-8'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
            <p className='mb-1 text-sm text-foreground/80'>Total Events</p>
            <p className='text-3xl font-bold text-foreground'>
              {events.length}
            </p>
          </div>
          <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
            <p className='mb-1 text-sm text-foreground/80'>Scheduled</p>
            <p className='text-3xl font-bold text-foreground'>
              {events.filter((e) => e.status === 'scheduled').length}
            </p>
          </div>
          <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
            <p className='mb-1 text-sm text-foreground/80'>Draft</p>
            <p className='text-3xl font-bold text-foreground/80'>
              {events.filter((e) => e.status === 'draft').length}
            </p>
          </div>
          <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
            <p className='mb-1 text-sm text-foreground/80'>Completed</p>
            <p className='text-3xl font-bold text-foreground'>
              {events.filter((e) => e.status === 'completed').length}
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <EventCalendar
            events={calendarEvents}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </div>

        <div className='space-y-6'>
          {selectedEvent ? (
            <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
              <h3 className='mb-4 text-lg font-semibold text-foreground'>
                Event Details
              </h3>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Event Name</p>
                  <p className='font-medium text-foreground'>
                    {selectedEvent.name}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Venue</p>
                  <p className='font-medium text-foreground'>
                    {selectedEvent.venueId.name}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Date</p>
                  <p className='font-medium text-foreground'>
                    {new Date(selectedEvent.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Time</p>
                  <p className='font-medium text-foreground'>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Status</p>
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm ${
                      selectedEvent.status === 'scheduled'
                        ? 'border-primary/30 bg-primary/20 text-primary'
                        : selectedEvent.status === 'draft'
                        ? 'border-foreground/20 bg-foreground/10 text-foreground/80'
                        : 'border-accent/30 bg-accent/20 text-accent'
                    }`}
                  >
                    {selectedEvent.status.toUpperCase()}
                  </span>
                </div>
                <div className='space-y-2 pt-4'>
                  <MagneticButton
                    href={`/admin/events/${selectedEvent._id}`}
                    variant='primary'
                    className='w-full text-center'
                  >
                    Manage Run of Show
                  </MagneticButton>
                  <MagneticButton
                    href={`/admin/events/${selectedEvent._id}/edit`}
                    variant='secondary'
                    className='w-full text-center'
                  >
                    Edit Event
                  </MagneticButton>
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
              <p className='text-center text-foreground/90'>
                Select an event to view details
              </p>
            </div>
          )}

          <div className='rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl'>
            <h3 className='mb-4 text-lg font-semibold text-foreground'>
              Quick Actions
            </h3>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <MagneticButton
                href='/admin/events/new'
                variant='primary'
                className='w-full text-center sm:col-span-2'
              >
                Create Event
              </MagneticButton>
              <MagneticButton
                href='/admin/events'
                variant='secondary'
                className='w-full text-center sm:col-span-2'
              >
                View All Events
              </MagneticButton>
              <MagneticButton
                href='/admin/djs'
                variant='secondary'
                className='w-full text-center'
              >
                Manage DJs
              </MagneticButton>
              <MagneticButton
                href='/admin/venues'
                variant='secondary'
                className='w-full text-center'
              >
                Manage Venues
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
