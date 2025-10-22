import mongoose, { Schema, Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  DJ = 'dj',
}

export interface IUser extends Document {
  _id: string;
  email: string;
  auth0Id: string;
  role: UserRole;
  djId?: Types.ObjectId; // Reference to DJ profile if role is DJ
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    auth0Id: {
      type: String,
      required: [true, 'Please provide an Auth0 ID'],
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: [true, 'Please specify a user role'],
      default: UserRole.DJ,
    },
    djId: {
      type: Schema.Types.ObjectId,
      ref: 'DJ',
    },
    name: {
      type: String,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
// Note: email and auth0Id already have unique indexes from the schema definition
UserSchema.index({ role: 1 });
UserSchema.index({ djId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
