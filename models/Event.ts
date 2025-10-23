import mongoose, { Schema, Document, Types } from 'mongoose';

export enum EventStatus {
  // Initial states
  DRAFT = 'draft',
  IMPORTED = 'imported',

  // Run of Show states
  ROS_DRAFT = 'ros_draft',
  ROS_COMPLETE = 'ros_complete',

  // Confirmation states
  PENDING_CONFIRMATION = 'pending_confirmation',
  CONFIRMED = 'confirmed',

  // Final states
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

  // External sync tracking
  externalIds?: {
    ticketmaster?: string;
    posh?: string;
  };
  externalSource?: 'manual' | 'ticketmaster' | 'posh';
  externalUrl?: string;
  lastSyncedAt?: Date;

  // Ticketmaster-specific data
  ticketmasterData?: {
    status?: string;
    priceRanges?: Array<{
      type: string;
      currency: string;
      min: number;
      max: number;
    }>;
    salesDates?: {
      public?: {
        startDateTime: Date;
        endDateTime: Date;
      };
      presales?: Array<{
        name: string;
        startDateTime: Date;
        endDateTime: Date;
      }>;
    };
    images?: Array<{
      url: string;
      width: number;
      height: number;
      ratio: string;
    }>;
    genre?: {
      id: string;
      name: string;
    };
    subGenre?: {
      id: string;
      name: string;
    };
    promoter?: {
      id: string;
      name: string;
    };
    ageRestrictions?: string;
    accessibility?: {
      info?: string;
    };
    seatmap?: {
      staticUrl?: string;
    };
  };

  // Legacy fields for backwards compatibility
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
    externalIds: {
      ticketmaster: String,
      posh: String,
    },
    externalSource: {
      type: String,
      enum: ['manual', 'ticketmaster', 'posh'],
      default: 'manual',
    },
    externalUrl: {
      type: String,
    },
    lastSyncedAt: {
      type: Date,
    },
    ticketmasterData: {
      status: String,
      priceRanges: [
        {
          type: String,
          currency: String,
          min: Number,
          max: Number,
        },
      ],
      salesDates: {
        public: {
          startDateTime: Date,
          endDateTime: Date,
        },
        presales: [
          {
            name: String,
            startDateTime: Date,
            endDateTime: Date,
          },
        ],
      },
      images: [
        {
          url: String,
          width: Number,
          height: Number,
          ratio: String,
        },
      ],
      genre: {
        id: String,
        name: String,
      },
      subGenre: {
        id: String,
        name: String,
      },
      promoter: {
        id: String,
        name: String,
      },
      ageRestrictions: String,
      accessibility: {
        info: String,
      },
      seatmap: {
        staticUrl: String,
      },
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
EventSchema.index({ 'externalIds.ticketmaster': 1 });
EventSchema.index({ externalSource: 1 });
EventSchema.index({ lastSyncedAt: 1 });

const Event = (mongoose.models.Event as mongoose.Model<IEvent>) || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
