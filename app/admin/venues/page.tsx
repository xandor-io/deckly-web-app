import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';
import Link from 'next/link';
import { MagneticButton } from '@/components/MagneticButton';
import { Types } from 'mongoose';

interface VenueLean {
  _id: Types.ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  capacity?: number;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  autoImportEnabled: boolean;
  lastImportDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default async function ManageVenuesPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  const venues = await Venue.find({}).sort({ name: 1 }).lean<VenueLean[]>();

  const serializedVenues = venues.map((venue) => ({
    ...venue,
    _id: venue._id.toString(),
    createdAt: venue.createdAt.toISOString(),
    updatedAt: venue.updatedAt.toISOString(),
    lastImportDate: venue.lastImportDate ? venue.lastImportDate.toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Venues</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Keep venue information up to date across your network.
          </p>
        </div>
        <MagneticButton href="/admin/venues/new" variant="primary">
          Add New Venue
        </MagneticButton>
      </div>

      <div className="overflow-hidden rounded-3xl border border-foreground/20 bg-foreground/15 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/50">
            <thead className="bg-background/30 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Auto Import
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {serializedVenues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No venues found. Add your first venue to get started.
                  </td>
                </tr>
              ) : (
                serializedVenues.map((venue) => (
                  <tr
                    key={venue._id}
                    className="transition duration-150 hover:bg-foreground/5 backdrop-blur-sm"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {venue.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-foreground">
                        {venue.city}, {venue.state}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {venue.zipCode}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-foreground">
                        {venue.contactEmail}
                      </div>
                      {venue.contactPhone && (
                        <div className="text-sm text-muted-foreground">
                          {venue.contactPhone}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-foreground">
                        {venue.capacity ? venue.capacity.toLocaleString() : 'N/A'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                          venue.autoImportEnabled
                            ? 'border-primary/30 bg-primary/20 text-primary'
                            : 'border-foreground/20 bg-foreground/10 text-foreground/80'
                        }`}
                      >
                        {venue.autoImportEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                          venue.isActive
                            ? 'border-green-500/30 bg-green-500/20 text-green-400'
                            : 'border-red-500/30 bg-red-500/20 text-red-400'
                        }`}
                      >
                        {venue.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link
                        href={`/admin/venues/${venue._id}/edit`}
                        className="text-accent transition duration-200 hover:text-accent/80"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
