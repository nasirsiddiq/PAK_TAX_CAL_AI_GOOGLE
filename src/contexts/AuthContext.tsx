import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase fires an INITIAL_SESSION event synchronously on subscribe with
    // whatever session is in local storage, then SIGNED_IN / SIGNED_OUT /
    // TOKEN_REFRESHED as they happen. Relying on this single listener (instead
    // of also kicking off a separate getUser() network call on mount) avoids a
    // race where that slower network call could resolve *after* a fresh
    // sign-in and stomp the just-set user back to null, which showed up as
    // the page briefly loading after sign-in and then bouncing back to the
    // "Sign In Required" screen.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    return await signUp(email, password, fullName);
  };

  const handleSignIn = async (email: string, password: string) => {
    return await signIn(email, password);
  };

  const handleSignOut = async () => {
    return await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
