import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({ user: null, session: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Auth session error:', error.message);
          if (mounted) setLoading(false);
          return;
        }
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Auth getSession failed:', err);
        if (mounted) setLoading(false);
      });

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      });
      subscription = data.subscription;
    } catch (err) {
      console.warn('Auth state change failed:', err);
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
      try { subscription?.unsubscribe(); } catch {}
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
