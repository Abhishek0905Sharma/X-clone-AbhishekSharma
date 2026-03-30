"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/SupabaseClient";

const SessionContext = createContext<{ session: Session | null; loading: boolean }>({
  session: null,
  loading: true,
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setSession(null);
          setLoading(false);
        } else if (event !== "INITIAL_SESSION" && session) {
          setSession(session);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSessionContext = () => useContext(SessionContext);