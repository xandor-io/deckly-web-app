import mongoose, { Schema, Document } from 'mongoose';

export enum DJGenre {
  OPEN_FORMAT = 'open_format',
  HOUSE = 'house',
  TECH = 'tech',
  AFROHOUSE = 'afrohouse',
  TECHNO = 'techno',
  PROGRESSIVE = 'progressive',
  DEEP_HOUSE = 'deep_house',
  BASS = 'bass',
  HIP_HOP = 'hip_hop',
  RNB = 'rnb',
}

export interface IDJ extends Document {
  _id: string;
  name: string;
  email: string;
  auth0Id?: string;
  genres: DJGenre[];
  bio?: string;
  phone?: string;
  bookingCount: number;
  isActive: boolean;
  rating?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DJSchema = new Schema<IDJ>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for this DJ'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    auth0Id: {
      type: String,
      unique: true,
      sparse: true,
    },
    genres: {
      type: [String],
      enum: Object.values(DJGenre),
      required: [true, 'Please specify at least one genre'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'DJ must have at least one genre',
      },
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    phone: {
      type: String,
      match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number'],
    },
    bookingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
DJSchema.index({ genres: 1, bookingCount: 1 });
DJSchema.index({ email: 1 });
DJSchema.index({ auth0Id: 1 });

export default mongoose.models.DJ || mongoose.model<IDJ>('DJ', DJSchema);
