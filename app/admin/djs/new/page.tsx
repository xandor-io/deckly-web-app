'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DJGenre } from '@/types/dj';
import { MagneticButton } from '@/components/MagneticButton';

export default function NewDJPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    genres: [] as string[],
    isActive: true,
  });

  const allGenres = Object.values(DJGenre);

  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/djs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create DJ');
      }

      router.push('/admin/djs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/djs"
          className="text-sm text-foreground/70 transition hover:text-foreground"
        >
          ← Back to DJs
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add New DJ</h1>
      </div>

      <div className="rounded-3xl border border-foreground/20 bg-foreground/15 p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive backdrop-blur-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground/80">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              placeholder="DJ Name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground/80">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              placeholder="dj@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground/80">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium text-foreground/80">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              placeholder="Tell us about this DJ..."
              maxLength={500}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/80">
              Genres * (select at least one)
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {allGenres.map((genre) => (
                <label
                  key={genre}
                  className={`flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all backdrop-blur-sm ${
                    formData.genres.includes(genre)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/30 hover:border-border/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <span className="ml-2 text-sm text-foreground">
                    {genre.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center rounded-lg border border-border bg-background/30 p-3 backdrop-blur-sm">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              <span className="ml-2 text-sm text-foreground">
                Active (available for bookings)
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <MagneticButton
              type="submit"
              disabled={loading || formData.genres.length === 0}
              variant="primary"
              className="flex-1 text-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create DJ'}
            </MagneticButton>
            <MagneticButton href="/admin/djs" variant="secondary" className="flex-1 text-center">
              Cancel
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
}
