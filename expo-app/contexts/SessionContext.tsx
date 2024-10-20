// contexts/SessionContext.tsx

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    PropsWithChildren,
  } from 'react';
  import { supabase } from '../utils/supabase'; // Ensure correct path
  import { Session, User } from '@supabase/supabase-js';
  
  interface SessionContextType {
    session: Session | null;
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoading: boolean;
  }
  
  const SessionContext = createContext<SessionContextType | undefined>(undefined);
  
  export const SessionContextProvider = ({ children }: PropsWithChildren) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      // Fetch active session and user
      const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      };
  
      getSession();
  
      // Listen for authentication state changes
      const { data: listener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
        }
      );
  
      return () => {
        listener.subscription.unsubscribe();
      };
    }, []);
  
    const signIn = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    };
  
    const signOut = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    };
  
    return (
      <SessionContext.Provider
        value={{ session, user, signIn, signOut, isLoading }}
      >
        {children}
      </SessionContext.Provider>
    );
  };
  
  export const useSessionContext = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error('useSessionContext must be used within a SessionContextProvider.');
    }
    return context;
  };
  
  export const useSupabaseClient = () => {
    // Since supabase is imported from utils/supabase, you can return it directly
    return supabase;
  };
  
  export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error('useSession must be used within a SessionContextProvider.');
    }
    return context.session;
  };
  
  export const useUser = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
      throw new Error('useUser must be used within a SessionContextProvider.');
    }
    return context.user;
  };
  