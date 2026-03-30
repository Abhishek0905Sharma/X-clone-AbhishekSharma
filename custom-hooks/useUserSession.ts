import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/SupabaseClient";

export const useUserSession = () => {
  const [session, setSession] = useState<null | Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { loading, session };
};