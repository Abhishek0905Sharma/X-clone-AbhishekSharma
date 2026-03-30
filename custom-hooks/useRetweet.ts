import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "../lib/SupabaseClient";

export function useRetweets(tweetId: string) {
  return useQuery({
    queryKey: ["retweets", tweetId],
    queryFn: async () => {
  const supabase = getSupabaseClient(); // ✅ add this
  const { data, error } = await supabase
        .from("retweets")
        .select("*")
        .eq("tweet_id", tweetId);
      if (error) throw error;
      return data;
    },
  });
}

export function useToggleRetweet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tweetId,
      userId,
      retweeted,
    }: {
      tweetId: string;
      userId: string;
      retweeted: boolean;
    }) => {
      const supabase = getSupabaseClient();
      if (retweeted) {
        await supabase
          .from("retweets")
          .delete()
          .eq("tweet_id", tweetId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("retweets")
          .insert({ tweet_id: tweetId, user_id: userId });
      }
    },
    onSuccess: (_d, { tweetId }) =>
      queryClient.invalidateQueries({ queryKey: ["retweets", tweetId] }),
  });
}