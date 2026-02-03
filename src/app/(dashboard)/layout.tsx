'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { initialize, isInitialized, isLoading } = useDataStore();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  // Initialize data store when authenticated
  useEffect(() => {
    if (hasHydrated && isAuthenticated && !isInitialized) {
      initialize();
    }
  }, [hasHydrated, isAuthenticated, isInitialized, initialize]);

  // Show loading state while checking auth
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-500 mb-4">CodersHive</h1>
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6">
          {isLoading && !isInitialized ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading data from Supabase...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
