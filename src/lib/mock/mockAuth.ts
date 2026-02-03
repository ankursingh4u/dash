// Mock authentication for development

import { User } from '@/types';
import { mockUsers } from './mockData';

interface MockCredentials {
  email: string;
  password: string;
}

// Hardcoded users for mock authentication
const validCredentials: { [email: string]: { password: string; userId: string } } = {
  'admin@codershive.com': { password: 'admin123', userId: '1' },
  'user@codershive.com': { password: 'user123', userId: '2' },
  'viewer@codershive.com': { password: 'viewer123', userId: '3' },
};

export function mockLogin(credentials: MockCredentials): { user: User; token: string } | null {
  const userCred = validCredentials[credentials.email];

  if (!userCred || userCred.password !== credentials.password) {
    return null;
  }

  const user = mockUsers.find(u => u.id === userCred.userId);
  if (!user) {
    return null;
  }

  // Generate a simple mock token
  const token = `mock_token_${user.id}_${Date.now()}`;

  return { user, token };
}

export function mockValidateToken(token: string): User | null {
  // Extract user ID from mock token
  const match = token.match(/^mock_token_(\d+)_/);
  if (!match) {
    return null;
  }

  const userId = match[1];
  return mockUsers.find(u => u.id === userId) || null;
}

export function mockLogout(): void {
  // In mock mode, just clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export function getStoredAuth(): { user: User; token: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem('auth_token');
  const userJson = localStorage.getItem('auth_user');

  if (!token || !userJson) {
    return null;
  }

  try {
    const user = JSON.parse(userJson) as User;
    // Validate the token is still valid
    if (mockValidateToken(token)) {
      return { user, token };
    }
  } catch {
    // Invalid JSON, clear storage
    mockLogout();
  }

  return null;
}

export function storeAuth(user: User, token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}
