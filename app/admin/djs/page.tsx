import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import dbConnect from '@/lib/db';
import DJ from '@/models/DJ';
import Link from 'next/link';
import { ShaderBackground } from '@/components/ShaderBackground';
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
              href="/admin/djs/new"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg transition duration-200"
            >
              Add New DJ
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Manage DJs</h1>
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Genres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Bookings
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
                {serializedDJs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No DJs found. Add your first DJ to get started.
                    </td>
                  </tr>
                ) : (
                  serializedDJs.map((dj) => (
                    <tr key={dj._id} className="hover:bg-slate-700/30 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {dj.name}
                            </div>
                            {dj.phone && (
                              <div className="text-sm text-slate-400">{dj.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{dj.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {dj.genres.slice(0, 3).map((genre: string) => (
                            <span
                              key={genre}
                              className="px-2 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-700 rounded-full text-xs font-medium"
                            >
                              {genre.replace('_', ' ')}
                            </span>
                          ))}
                          {dj.genres.length > 3 && (
                            <span className="px-2 py-1 bg-slate-700 text-slate-300 border border-slate-600 rounded-full text-xs font-medium">
                              +{dj.genres.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {dj.bookingCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            dj.isActive
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-red-900/50 text-red-300 border border-red-700'
                          }`}
                        >
                          {dj.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/djs/${dj._id}/edit`}
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
