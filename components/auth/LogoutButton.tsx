'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

export default function LogoutButton({ className }: { className?: string }) {
  const { status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: '/' });
  };

  // Only show loading screen if user is authenticated (on dashboard/protected routes)
  if (isLoggingOut && status === 'authenticated') {
    return <LoadingScreen />;
  }

  return (
    <button
      onClick={handleLogout}
      className={className || 'text-sm text-gray-600 hover:text-gray-900'}
    >
      Logout
    </button>
  );
}
