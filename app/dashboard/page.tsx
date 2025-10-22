'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/components/LoadingScreen';

export default function DashboardRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Redirect based on user role
      if (session.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard/dj');
      }
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, session, router]);

  return <LoadingScreen />;
}
