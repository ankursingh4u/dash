'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user, data.token);
        router.push('/overview');
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    setSetupMessage('Setting up database...');
    try {
      const response = await fetch('/api/setup', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setSetupMessage(`Database setup complete! Admin credentials: ${data.admin.email} / ${data.admin.password}`);
      } else {
        setSetupMessage(`Setup failed: ${data.error}`);
      }
    } catch (err) {
      setSetupMessage('Setup failed. Check console for details.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1f2e] rounded-xl p-8 border border-gray-700 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-amber-500">CodersHive</h1>
            <p className="text-gray-400 text-sm mt-1">Operations Dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@codershive.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Admin Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 mb-3">Admin Credentials:</p>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between bg-gray-800/50 rounded px-3 py-2">
                <span>Email:</span>
                <span className="text-gray-300">admin@codershive.com</span>
              </div>
              <div className="flex justify-between bg-gray-800/50 rounded px-3 py-2">
                <span>Password:</span>
                <span className="text-gray-300">Admin@123</span>
              </div>
            </div>

            {/* Database Setup Button */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                onClick={handleSetupDatabase}
              >
                Setup Database (First Time Only)
              </Button>
              {setupMessage && (
                <p className="text-xs text-amber-400 mt-2 text-center">{setupMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
