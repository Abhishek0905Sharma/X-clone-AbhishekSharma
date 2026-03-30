import { useSessionContext } from "../providers/AuthProvider";

export const useUserSession = () => {
  const { session, loading } = useSessionContext();
  return { session, loading, gettingSession: loading };
};