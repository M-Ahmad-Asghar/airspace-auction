"use client";

import { createContext } from 'react';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
});
