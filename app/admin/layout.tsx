import type { ReactNode } from 'react';

import { ShaderBackground } from '@/components/ShaderBackground';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getCurrentUser } from '@/lib/auth';

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
      undefined);

  return (
    <div className="relative min-h-screen">
      <ShaderBackground />
      <AdminHeader userInitials={initials} />

      <div className="relative z-10 px-4 pt-28 pb-8 sm:px-6 lg:px-8 lg:pt-32">
        {children}
      </div>
    </div>
  );
}
