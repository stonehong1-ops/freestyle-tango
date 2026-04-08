'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps>({ 
  currentUser: null, 
  loading: true,
  error: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial check and anonymous sign-in if needed
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("[Auth] User authenticated:", user.uid);
        setCurrentUser(user);
        setLoading(false);
      } else {
        console.log("[Auth] No user found, signing in anonymously...");
        try {
          await signInAnonymously(auth);
        } catch (err: any) {
          console.error("[Auth] Anonymous sign-in failed:", err);
          setError(err.message || "Authentication failed");
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
