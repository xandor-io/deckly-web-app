'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { MagneticButton } from '@/components/MagneticButton';
import LoadingScreen from '@/components/LoadingScreen';

export default function EditVenuePage() {
  const router = useRouter();
  const params = useParams();
  const venueId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capacity: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    eventSourceUrl: '',
    autoImportEnabled: false,
    isActive: true,
  });

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(`/api/admin/venues/${venueId}`);
        if (!response.ok) throw new Error('Failed to fetch venue');

        const data = await response.json();
        setFormData({
          name: data.venue.name,
          address: data.venue.address,
          city: data.venue.city,
          state: data.venue.state,
          zipCode: data.venue.zipCode,
          capacity: data.venue.capacity ? data.venue.capacity.toString() : '',
          description: data.venue.description || '',
          contactEmail: data.venue.contactEmail,
          contactPhone: data.venue.contactPhone || '',
          eventSourceUrl: data.venue.eventSourceUrl || '',
          autoImportEnabled: data.venue.autoImportEnabled,
          isActive: data.venue.isActive,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
      };

      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update venue');
      }

      router.push('/admin/venues');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/venues"
          className="text-sm text-foreground/70 transition hover:text-foreground"
        >
          ← Back to Venues
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Venue</h1>
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
              Venue Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-foreground/80">
              Address *
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="city" className="mb-2 block text-sm font-medium text-foreground/80">
                City *
              </label>
              <input
                type="text"
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="state" className="mb-2 block text-sm font-medium text-foreground/80">
                State *
              </label>
              <input
                type="text"
                id="state"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
                maxLength={2}
              />
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="mb-2 block text-sm font-medium text-foreground/80"
              >
                Zip Code *
              </label>
              <input
                type="text"
                id="zipCode"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="capacity" className="mb-2 block text-sm font-medium text-foreground/80">
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-foreground/80"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              maxLength={1000}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="contactEmail"
                className="mb-2 block text-sm font-medium text-foreground/80"
              >
                Contact Email *
              </label>
              <input
                type="email"
                id="contactEmail"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="contactPhone"
                className="mb-2 block text-sm font-medium text-foreground/80"
              >
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="eventSourceUrl"
              className="mb-2 block text-sm font-medium text-foreground/80"
            >
              Events Source URL
            </label>
            <input
              type="url"
              id="eventSourceUrl"
              value={formData.eventSourceUrl}
              onChange={(e) => setFormData({ ...formData, eventSourceUrl: e.target.value })}
              className="w-full rounded-lg border border-input bg-background/50 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none transition duration-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Used for automatic event imports if enabled.
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-border bg-background/30 p-3 backdrop-blur-sm">
              <span className="text-sm text-foreground">
                Enable Automatic Event Imports
              </span>
              <input
                type="checkbox"
                checked={formData.autoImportEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, autoImportEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-border bg-background/30 p-3 backdrop-blur-sm">
              <span className="text-sm text-foreground">Active (visible to bookers)</span>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <MagneticButton
              type="submit"
              disabled={saving}
              variant="primary"
              className="flex-1 text-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </MagneticButton>
            <MagneticButton href="/admin/venues" variant="secondary" className="flex-1 text-center">
              Cancel
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
}
