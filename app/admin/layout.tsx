import type { ReactNode } from 'react';

import { ShaderBackground } from '@/components/ShaderBackground';
import { DashboardHeader } from '@/components/DashboardHeader';
import { getCurrentUser } from '@/lib/auth';

const adminNavItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/djs", label: "DJs" },
  { href: "/admin/venues", label: "Venues" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  const initials =
    (user?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
      user?.email?.slice(0, 2)?.toUpperCase() ||
      'AD');

  return (
    <div className="relative min-h-screen">
      <ShaderBackground />
      <DashboardHeader
        homeHref="/admin"
        title="Deckly"
        subtitle="Admin"
        navItems={adminNavItems}
        userInitials={initials}
        showSettings={true}
        settingsHref="/admin/settings"
      />

      <div className="relative z-10 px-4 pt-28 pb-8 sm:px-6 lg:px-8 lg:pt-32">
        {children}
      </div>
    </div>
  );
}
