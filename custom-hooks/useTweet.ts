import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTweet, deleteTweet, getTweets } from "../services/tweet";
import { getSupabaseClient } from "../lib/SupabaseClient"; 
export const usePostTweet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
  userId,
  content,
  tweetImage,
  scheduledAt,
}: {
  userId: string;
  content: string | null;
  tweetImage: File | null;
  scheduledAt: string | null;
}) => createTweet(userId, content, tweetImage, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });
};

export const useGetTweets = () => {
  return useQuery({
    queryKey: ["tweets"],
    queryFn: async () => {
      const supabase = getSupabaseClient(); // ✅ add this line
      const { data: tweets, error: tweetsError } = await supabase
        .from("tweets")
        .select("*, profiles(id, username, avatar_url, name)")
        .is("scheduled_at", null)
        .order("created_at", { ascending: false });
      if (tweetsError) throw tweetsError;

      const { data: retweets, error: retweetsError } = await supabase
        .from("retweets")
        .select("*, profiles(id, username, avatar_url, name), tweets(*, profiles(id, username, avatar_url, name))")
        .order("created_at", { ascending: false });
      if (retweetsError) throw retweetsError;

      const retweetedPosts = retweets?.map((rt) => ({
        ...rt.tweets,
        isRetweet: true,
        retweetedBy: rt.profiles,
        retweetedAt: rt.created_at,
      })) || [];

      const merged = [...tweets, ...retweetedPosts].sort(
        (a, b) => new Date(b.retweetedAt || b.created_at).getTime() - new Date(a.retweetedAt || a.created_at).getTime()
      );
      return merged;
    },
  });
};  

export const useDeleteTweet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tweetId,
      imagePath,
    }: {
      tweetId: string;
      imagePath?: string;
    }) => deleteTweet(tweetId, imagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets"] });
    },
  });
};