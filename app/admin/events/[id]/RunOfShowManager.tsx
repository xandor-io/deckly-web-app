'use client';

import { useState } from 'react';
import { MagneticButton } from '@/components/MagneticButton';
import Link from 'next/link';

// Helper function to convert 24-hour time to 12-hour format
function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

interface DJ {
  _id: string;
  name: string;
  email: string;
  genres: string[];
  rating?: number;
  bookingCount?: number;
}

interface DJAssignment {
  djId: DJ;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
  notificationSent: boolean;
  notificationSentAt?: string;
  confirmedAt?: string;
  notes?: string;
}

interface TimeSlot {
  _id?: string;
  slotName: string;
  slotType: 'opener' | 'main' | 'closer' | 'special_guest';
  startTime: string;
  endTime: string;
  maxDJs?: number;
  notes?: string;
  djAssignments: DJAssignment[];
}

interface RunOfShow {
  _id: string;
  eventId: string;
  timeSlots: TimeSlot[];
}

interface Event {
  _id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  venueId: {
    _id: string;
    name: string;
  };
}

interface RunOfShowManagerProps {
  event: Event;
  runOfShow: RunOfShow | null;
  availableDJs: DJ[];
}

export default function RunOfShowManager({
  event,
  runOfShow: initialRunOfShow,
  availableDJs,
}: RunOfShowManagerProps) {
  const [runOfShow, setRunOfShow] = useState<RunOfShow | null>(
    initialRunOfShow
  );
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [selectedDJs, setSelectedDJs] = useState<{ [slotId: string]: string }>(
    {}
  );

  const [newSlot, setNewSlot] = useState<Partial<TimeSlot>>({
    slotName: '',
    slotType: 'opener',
    startTime: event.startTime,
    endTime: '',
    maxDJs: 1,
    notes: '',
    djAssignments: [],
  });

  const slotTypeColors = {
    opener: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    main: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    closer: 'border-green-500/30 bg-green-500/10 text-green-400',
    special_guest: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  };

  const statusColors = {
    pending: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    confirmed: 'border-green-500/30 bg-green-500/10 text-green-400',
    declined: 'border-red-500/30 bg-red-500/10 text-red-400',
    cancelled: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
  };

  const handleAddSlot = async () => {
    if (!newSlot.slotName || !newSlot.startTime || !newSlot.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${event._id}/run-of-show`, {
        method: runOfShow ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSlots: [
            ...(runOfShow?.timeSlots || []),
            {
              ...newSlot,
              djAssignments: [],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error('Failed to add time slot');

      const data = await response.json();
      setRunOfShow(data.runOfShow);
      setIsAddingSlot(false);
      setNewSlot({
        slotName: '',
        slotType: 'opener',
        startTime: event.startTime,
        endTime: '',
        maxDJs: 1,
        notes: '',
        djAssignments: [],
      });
    } catch (error) {
      console.error('Error adding slot:', error);
      alert('Failed to add time slot');
    }
  };

  const handleAssignDJ = async (slotId: string) => {
    const djId = selectedDJs[slotId];
    if (!djId) {
      alert('Please select a DJ');
      return;
    }

    const slot = runOfShow?.timeSlots.find((s) => s._id === slotId);
    if (!slot) return;

    // Check if DJ is already assigned
    if (slot.djAssignments.some((a) => a.djId._id === djId)) {
      alert('This DJ is already assigned to this slot');
      return;
    }

    const dj = availableDJs.find((d) => d._id === djId);
    if (!dj) return;

    try {
      const updatedSlots = runOfShow!.timeSlots.map((s) => {
        if (s._id === slotId) {
          return {
            ...s,
            djAssignments: [
              ...s.djAssignments,
              {
                djId: dj,
                status: 'pending' as const,
                notificationSent: false,
              },
            ],
          };
        }
        return s;
      });

      const response = await fetch(`/api/admin/events/${event._id}/run-of-show`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlots: updatedSlots }),
      });

      if (!response.ok) throw new Error('Failed to assign DJ');

      const data = await response.json();
      setRunOfShow(data.runOfShow);
      setSelectedDJs({ ...selectedDJs, [slotId]: '' });
    } catch (error) {
      console.error('Error assigning DJ:', error);
      alert('Failed to assign DJ');
    }
  };

  const handleRemoveDJ = async (slotId: string, djId: string) => {
    if (!confirm('Remove this DJ from the time slot?')) return;

    try {
      const updatedSlots = runOfShow!.timeSlots.map((s) => {
        if (s._id === slotId) {
          return {
            ...s,
            djAssignments: s.djAssignments.filter((a) => a.djId._id !== djId),
          };
        }
        return s;
      });

      const response = await fetch(`/api/admin/events/${event._id}/run-of-show`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlots: updatedSlots }),
      });

      if (!response.ok) throw new Error('Failed to remove DJ');

      const data = await response.json();
      setRunOfShow(data.runOfShow);
    } catch (error) {
      console.error('Error removing DJ:', error);
      alert('Failed to remove DJ');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Delete this time slot?')) return;

    try {
      const updatedSlots = runOfShow!.timeSlots.filter((s) => s._id !== slotId);

      const response = await fetch(`/api/admin/events/${event._id}/run-of-show`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSlots: updatedSlots }),
      });

      if (!response.ok) throw new Error('Failed to delete time slot');

      const data = await response.json();
      setRunOfShow(data.runOfShow);
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete time slot');
    }
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
          <h1 className="text-3xl font-bold text-foreground">{event.name}</h1>
          <p className="text-foreground/80">
            {new Date(event.date).toLocaleDateString()} at {event.venueId.name}
          </p>
        </div>
        <div className="flex gap-2">
          <MagneticButton
            href={`/admin/events/${event._id}/edit`}
            variant="secondary"
          >
            Edit Event
          </MagneticButton>
        </div>
      </div>

      {/* Event Info Card */}
      <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-foreground/80">Date</p>
            <p className="font-medium text-foreground">
              {new Date(event.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground/80">Time</p>
            <p className="font-medium text-foreground">
              {formatTime12Hour(event.startTime)} - {formatTime12Hour(event.endTime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground/80">Venue</p>
            <p className="font-medium text-foreground">{event.venueId.name}</p>
          </div>
          <div>
            <p className="text-sm text-foreground/80">Status</p>
            <span className="inline-block rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
              {event.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="rounded-2xl border border-foreground/20 bg-foreground/15 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Run of Show</h2>
          <MagneticButton
            onClick={() => setIsAddingSlot(true)}
            variant="primary"
          >
            + Add Time Slot
          </MagneticButton>
        </div>

        {/* Add Slot Form */}
        {isAddingSlot && (
          <div className="mb-6 rounded-xl border border-foreground/20 bg-foreground/10 p-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              New Time Slot
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Slot Name
                </label>
                <input
                  type="text"
                  value={newSlot.slotName}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, slotName: e.target.value })
                  }
                  placeholder="e.g., Opening Set"
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Slot Type
                </label>
                <select
                  value={newSlot.slotType}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      slotType: e.target.value as TimeSlot['slotType'],
                    })
                  }
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="opener">Opener</option>
                  <option value="main">Main</option>
                  <option value="closer">Closer</option>
                  <option value="special_guest">Special Guest</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Max DJs
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSlot.maxDJs}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, maxDJs: parseInt(e.target.value) })
                  }
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newSlot.notes}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, notes: e.target.value })
                  }
                  placeholder="Any special notes"
                  className="w-full rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddSlot}
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
              >
                Add Slot
              </button>
              <button
                onClick={() => setIsAddingSlot(false)}
                className="rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-medium text-foreground hover:bg-foreground/20"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Time Slots List */}
        <div className="space-y-4">
          {runOfShow?.timeSlots.length === 0 ? (
            <p className="py-8 text-center text-foreground/60">
              No time slots yet. Click &quot;Add Time Slot&quot; to get started.
            </p>
          ) : (
            runOfShow?.timeSlots
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((slot) => (
                <div
                  key={slot._id}
                  className="rounded-xl border border-foreground/20 bg-foreground/5 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {slot.slotName}
                        </h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            slotTypeColors[slot.slotType]
                          }`}
                        >
                          {slot.slotType.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">
                        {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                        {slot.notes && ` • ${slot.notes}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot._id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>

                  {/* DJ Assignments */}
                  <div className="space-y-2">
                    {slot.djAssignments.map((assignment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/5 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {assignment.djId.name}
                            </p>
                            <p className="text-sm text-foreground/60">
                              {assignment.djId.genres.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${
                              statusColors[assignment.status]
                            }`}
                          >
                            {assignment.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() =>
                              handleRemoveDJ(slot._id!, assignment.djId._id)
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add DJ to Slot */}
                    {(!slot.maxDJs ||
                      slot.djAssignments.length < slot.maxDJs) && (
                      <div className="flex gap-2">
                        <select
                          value={selectedDJs[slot._id!] || ''}
                          onChange={(e) =>
                            setSelectedDJs({
                              ...selectedDJs,
                              [slot._id!]: e.target.value,
                            })
                          }
                          className="flex-1 rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                        >
                          <option value="">Select DJ...</option>
                          {availableDJs
                            .filter(
                              (dj) =>
                                !slot.djAssignments.some(
                                  (a) => a.djId._id === dj._id
                                )
                            )
                            .map((dj) => (
                              <option key={dj._id} value={dj._id}>
                                {dj.name} ({dj.genres.join(', ')})
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => handleAssignDJ(slot._id!)}
                          className="rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
                        >
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
