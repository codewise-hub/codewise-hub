import type { User } from '@shared/schema';

export interface AuthResponse {
  user: User;
  sessionToken: string;
}

const API_BASE = '/api/auth';

// Sign up user
export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  ageGroup?: string;
  childName?: string;
  schoolName?: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Sign up failed');
  }

  return response.json();
}

// Sign in user
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Sign in failed');
  }

  return response.json();
}

// Sign out user
export async function signOut(): Promise<void> {
  const response = await fetch(`${API_BASE}/signout`, {
    method: 'POST',
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Sign out failed');
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}