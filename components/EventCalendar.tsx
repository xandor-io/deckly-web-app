'use client';

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useState, useMemo } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    eventId: string;
    venueName: string;
    status: string;
  };
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
}

export default function EventCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
}: EventCalendarProps) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const { defaultDate, max, views } = useMemo(
    () => ({
      defaultDate: new Date(),
      max: new Date(2025, 11, 31, 23, 59, 59),
      views: ['month', 'week', 'day'] as View[],
    }),
    []
  );

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3b82f6'; // blue

    if (event.resource?.status === 'scheduled') {
      backgroundColor = '#10b981'; // green
    } else if (event.resource?.status === 'draft') {
      backgroundColor = '#6b7280'; // gray
    } else if (event.resource?.status === 'cancelled') {
      backgroundColor = '#ef4444'; // red
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={views}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        style={{ height: '100%' }}
        popup
      />
    </div>
  );
}
