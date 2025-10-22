import mongoose, { Schema, Document, Types } from 'mongoose';

export enum EventStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IEvent extends Document {
  _id: string;
  name: string;
  venueId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  status: EventStatus;
  imageUrl?: string;
  ticketUrl?: string;
  isImported: boolean;
  importSource?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, 'Please provide an event name'],
      maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Please provide a venue ID'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide an event date'],
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
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    imageUrl: {
      type: String,
    },
    ticketUrl: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    isImported: {
      type: Boolean,
      default: false,
    },
    importSource: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
EventSchema.index({ venueId: 1, date: 1 });
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ isImported: 1, importSource: 1 });

const Event = (mongoose.models.Event as mongoose.Model<IEvent>) || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
