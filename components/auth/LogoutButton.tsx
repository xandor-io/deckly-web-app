'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton({ className }: { className?: string }) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleLogout}
      className={className || 'text-sm text-gray-600 hover:text-gray-900'}
    >
      Logout
    </button>
  );
}
