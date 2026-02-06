'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial load from cache (client-side only to avoid hydration mismatch)
    const cached = localStorage.getItem('auth_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setUser(parsed);
        setLoading(false);
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }

    // 2. Refresh session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('auth_user');
      }
    });

    // 3. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        localStorage.setItem('auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('auth_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
