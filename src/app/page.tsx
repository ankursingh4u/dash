'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated) {
      if (isAuthenticated) {
        router.replace('/overview');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, hasHydrated, router]);

  // Loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-amber-500 mb-4">CodersHive</h1>
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    </div>
  );
}
