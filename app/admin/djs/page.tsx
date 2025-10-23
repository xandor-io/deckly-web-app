import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DJ from '@/models/DJ';
import Link from 'next/link';
import { MagneticButton } from '@/components/MagneticButton';
import { Types } from 'mongoose';

interface DJLean {
  _id: Types.ObjectId;
  name: string;
  email: string;
  genres: string[];
  phone?: string;
  bookingCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default async function ManageDJsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect('/dashboard/dj');
  }

  await dbConnect();

  const djs = await DJ.find({}).sort({ name: 1 }).lean<DJLean[]>();

  const serializedDJs = djs.map((dj) => ({
    ...dj,
    _id: dj._id.toString(),
    createdAt: dj.createdAt.toISOString(),
    updatedAt: dj.updatedAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage DJs</h1>
          <p className="mt-1 text-sm text-foreground/70">
            View and manage your roster of performers.
          </p>
        </div>
        <MagneticButton href="/admin/djs/new" variant="primary">
          Add New DJ
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Genres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Bookings
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
              {serializedDJs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No DJs found. Add your first DJ to get started.
                  </td>
                </tr>
              ) : (
                serializedDJs.map((dj) => (
                  <tr
                    key={dj._id}
                    className="transition duration-150 hover:bg-foreground/5 backdrop-blur-sm"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {dj.name}
                          </div>
                          {dj.phone && (
                            <div className="text-sm text-muted-foreground">
                              {dj.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-foreground">{dj.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {dj.genres.slice(0, 3).map((genre: string) => (
                          <span
                            key={genre}
                            className="rounded-full border border-primary/30 bg-primary/20 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm"
                          >
                            {genre.replace('_', ' ')}
                          </span>
                        ))}
                        {dj.genres.length > 3 && (
                          <span className="rounded-full border border-foreground/20 bg-foreground/10 px-2 py-1 text-xs font-medium text-foreground/80 backdrop-blur-sm">
                            +{dj.genres.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {dj.bookingCount}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                          dj.isActive
                            ? 'border-green-500/30 bg-green-500/20 text-green-400'
                            : 'border-red-500/30 bg-red-500/20 text-red-400'
                        }`}
                      >
                        {dj.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link
                        href={`/admin/djs/${dj._id}/edit`}
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
