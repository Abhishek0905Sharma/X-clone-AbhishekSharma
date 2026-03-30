import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/SupabaseClient";

export const useUserSession = () => {
  const [session, setSession] = useState<null | Session>(null);
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

  return { loading, session };
};