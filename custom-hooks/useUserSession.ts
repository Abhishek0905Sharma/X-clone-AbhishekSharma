import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/SupabaseClient";

export const useUserSession = () => {
  const [session, setSession] = useState<null | Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Only update session on SIGNED_IN and SIGNED_OUT events
    // Ignore TOKEN_REFRESHED and other events that fire null temporarily
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          setSession(session);
          setLoading(false);
        }
        if (event === "SIGNED_OUT") {
          setSession(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { loading, session };
};