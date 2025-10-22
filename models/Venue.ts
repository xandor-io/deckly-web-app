import mongoose, { Schema, Document } from 'mongoose';

export interface IVenue extends Document {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity?: number;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  imageUrl?: string;
  isActive: boolean;
  // Event automation fields
  eventSourceUrl?: string;
  autoImportEnabled: boolean;
  lastImportDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VenueSchema = new Schema<IVenue>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a venue name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      maxlength: [200, 'Address cannot be more than 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      maxlength: [100, 'City cannot be more than 100 characters'],
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
      maxlength: [50, 'State cannot be more than 50 characters'],
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide a zip code'],
      match: [/^\d{5}(-\d{4})?$/, 'Please provide a valid zip code'],
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide a contact email'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    contactPhone: {
      type: String,
      match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number'],
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Event automation fields - can be Ticketmaster, Posh, or any other platform
    eventSourceUrl: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    autoImportEnabled: {
      type: Boolean,
      default: false,
    },
    lastImportDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
VenueSchema.index({ city: 1, state: 1 });
VenueSchema.index({ isActive: 1 });
VenueSchema.index({ autoImportEnabled: 1, lastImportDate: 1 });

export default mongoose.models.Venue || mongoose.model<IVenue>('Venue', VenueSchema);
