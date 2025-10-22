import mongoose, { Schema, Document, Types } from 'mongoose';

export enum SlotType {
  OPENER = 'opener',
  MAIN = 'main',
  CLOSER = 'closer',
  SPECIAL_GUEST = 'special_guest',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}

export interface IDJAssignment {
  djId: Types.ObjectId;
  status: BookingStatus;
  notificationSent: boolean;
  notificationSentAt?: Date;
  confirmedAt?: Date;
  notes?: string;
}

export interface ITimeSlot {
  _id?: Types.ObjectId;
  slotName: string; // e.g., "First Hour Opener", "Second Hour Opener", "Main Set"
  slotType: SlotType;
  startTime: string;
  endTime: string;
  djAssignments: IDJAssignment[]; // Multiple DJs can be assigned to the same slot
  maxDJs?: number; // Optional limit on how many DJs can be in this slot
  notes?: string;
}

export interface IRunOfShow extends Document {
  _id: string;
  eventId: Types.ObjectId;
  timeSlots: ITimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const DJAssignmentSchema = new Schema<IDJAssignment>({
  djId: {
    type: Schema.Types.ObjectId,
    ref: 'DJ',
    required: [true, 'Please provide a DJ ID'],
  },
  status: {
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.PENDING,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
  notificationSentAt: {
    type: Date,
  },
  confirmedAt: {
    type: Date,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
});

const TimeSlotSchema = new Schema<ITimeSlot>({
  slotName: {
    type: String,
    required: [true, 'Please provide a slot name'],
    maxlength: [100, 'Slot name cannot be more than 100 characters'],
  },
  slotType: {
    type: String,
    enum: Object.values(SlotType),
    required: [true, 'Please specify a slot type'],
  },
  startTime: {
    type: String,
    required: [true, 'Please provide a start time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
  },
  endTime: {
    type: String,
    required: [true, 'Please provide an end time'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
  },
  djAssignments: {
    type: [DJAssignmentSchema],
    default: [],
  },
  maxDJs: {
    type: Number,
    min: [1, 'Max DJs must be at least 1'],
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
});

const RunOfShowSchema = new Schema<IRunOfShow>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Please provide an event ID'],
      unique: true,
    },
    timeSlots: {
      type: [TimeSlotSchema],
      default: [],
      validate: {
        validator: function (slots: ITimeSlot[]) {
          // Validate no overlapping time slots
          for (let i = 0; i < slots.length; i++) {
            for (let j = i + 1; j < slots.length; j++) {
              const slot1Start = slots[i].startTime;
              const slot1End = slots[i].endTime;
              const slot2Start = slots[j].startTime;
              const slot2End = slots[j].endTime;

              // Check if slots overlap
              if (
                (slot1Start >= slot2Start && slot1Start < slot2End) ||
                (slot2Start >= slot1Start && slot2Start < slot1End)
              ) {
                return false;
              }
            }
          }
          return true;
        },
        message: 'Time slots cannot overlap',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
// Note: eventId already has a unique index from the schema definition
RunOfShowSchema.index({ 'timeSlots.djAssignments.djId': 1 });
RunOfShowSchema.index({ 'timeSlots.djAssignments.status': 1 });

export default mongoose.models.RunOfShow || mongoose.model<IRunOfShow>('RunOfShow', RunOfShowSchema);
