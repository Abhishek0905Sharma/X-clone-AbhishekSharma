import { getSupabaseClient } from "../lib/SupabaseClient";

export const createComment = async (
  userId: string,
  tweetId: string,
  content: string
) => {
  const supabase = getSupabaseClient();
  const { error: insertError } = await supabase.from("comments").insert({
    user_id: userId,
    tweet_id: tweetId,
    content,
  });

  if (insertError) {
    console.log("commentInsertError:", insertError.message);
    return;
  }

  return true;
};

export const getComments = async (tweetId: string) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*,profiles (id,name,username,avatar_url)")
    .eq("tweet_id", tweetId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("fetchCommentsError:", error.message);
    return;
  }

  return data ?? [];
};

export const deleteComment = async (commentId: string) => {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getCommentsCount = async (tweetId: string) => {
  const supabase = getSupabaseClient();
  const {error,count} = await supabase
    .from("comments")
    .select("id", { head: true, count: "exact" })
    .eq("tweet_id", tweetId);

    if(error){
        console.log("commentsCountError:",error.message);
    }

    return count ?? 0;
};

type ToggleLike = {
  userId: string | undefined;
  tweetId: string;
  hasLiked: boolean;
};

export const toggleLike = async ({ userId, tweetId, hasLiked }: ToggleLike) => {
  const supabase = getSupabaseClient();
  if (hasLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("tweet_id", tweetId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("likes").insert({
      tweet_id: tweetId,
      user_id: userId,
    });

    if (error) throw new Error(error.message);
  }
};

export const getUserLike = async (
  userId: string | undefined,
  tweetId: string
) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("tweet_id", tweetId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return !!data;
};

export const getLikesCount = async (tweetId:string) => {
  const supabase = getSupabaseClient();
    const {count,error} = await supabase.from("likes").select("id",{head:true,count:"exact"}).eq("tweet_id",tweetId);

    if (error) throw new Error(error.message);

    return count ?? 0;
}