import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';
import Link from 'next/link';
import { ShaderBackground } from '@/components/ShaderBackground';
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
    <div className="relative min-h-screen">
      <ShaderBackground />
      <nav className="relative z-10 bg-card/30 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition duration-200"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/admin/venues/new"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition duration-200"
            >
              Add New Venue
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Manage Venues</h1>
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Auto Import
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {serializedVenues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No venues found. Add your first venue to get started.
                    </td>
                  </tr>
                ) : (
                  serializedVenues.map((venue) => (
                    <tr key={venue._id} className="hover:bg-slate-700/30 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {venue.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {venue.city}, {venue.state}
                        </div>
                        <div className="text-sm text-slate-400">{venue.zipCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{venue.contactEmail}</div>
                        {venue.contactPhone && (
                          <div className="text-sm text-slate-400">{venue.contactPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {venue.capacity ? venue.capacity.toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            venue.autoImportEnabled
                              ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700'
                              : 'bg-slate-700 text-slate-300 border border-slate-600'
                          }`}
                        >
                          {venue.autoImportEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            venue.isActive
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-red-900/50 text-red-300 border border-red-700'
                          }`}
                        >
                          {venue.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/venues/${venue._id}/edit`}
                          className="text-cyan-400 hover:text-cyan-300 transition duration-200"
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
      </main>
    </div>
  );
}
