import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DecklyLogo from '@/components/DecklyLogo';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <DecklyLogo />
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            The All-in-One
            <span className="block bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Event Scheduling Platform
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Built for DJs, artists, and club owners.
            Manage your entire run of show, bookings, and schedules in one powerful platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-900 font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-6 py-3 rounded-lg border-2 border-slate-700 text-white font-semibold hover:border-slate-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 max-w-4xl mx-auto">
          {/* DJ & Artist Feature */}
          <div className="bg-slate-800/50 border-2 border-transparent hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-400 mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">For DJs & Artists</h3>
            <p className="text-slate-400">
              View your bookings, manage your schedule, and track upcoming gigs all in one place.
            </p>
          </div>

          {/* Club Owners Feature */}
          <div className="bg-slate-800/50 border-2 border-transparent hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-200">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-400 mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">For Club Owners</h3>
            <p className="text-slate-400">
              Manage your venues, create run of shows, and coordinate DJ bookings effortlessly.
            </p>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need to run your events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 border border-cyan-400/30 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Run of Show Management</h3>
              <p className="text-slate-400">
                Create detailed timelines with DJ assignments, time slots, and event flow.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 border border-cyan-400/30 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Calendar</h3>
              <p className="text-slate-400">
                Visual calendar view of all your events, bookings, and availability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 border border-cyan-400/30 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Artist Management</h3>
              <p className="text-slate-400">
                Manage DJ profiles, genres, availability, and booking history.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="bg-gradient-to-r from-cyan-400/10 to-indigo-400/10 border border-cyan-400/20 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to streamline your event scheduling?
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Join DJs, artists, and club owners who trust Deckly to manage their schedules.
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-400 text-slate-900 font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-slate-500">
            <p>&copy; 2024 Deckly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
