import { getSupabaseClient } from "../lib/SupabaseClient";

export const createTweet = async (
  userId: string,
  content: string | null,
  tweetImage: File | null,
  scheduledAt: string | null = null
) => {
  const supabase = getSupabaseClient(); // ✅
  let imageURL: null | string = null;
  let imagePath: null | string = null;

  if (tweetImage) {
    const timestamp = Date.now();
    const path = `${timestamp}_${tweetImage.name}`;

    const { error: imgError } = await supabase.storage
      .from("tweet-images")
      .upload(path, tweetImage);

    if (imgError) {
      console.log("TweetImageUploadError:", imgError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("tweet-images")
      .getPublicUrl(path);

    imageURL = publicUrl;
    imagePath = path;
  }

  const { error: insertError } = await supabase.from("tweets").insert({
    user_id: userId,
    content: content ? content : null,
    image_url: imageURL,
    image_path: imagePath,
    scheduled_at: scheduledAt,
  });

  if (insertError) {
    console.log("TweetInsertError:", insertError.message);
    return;
  }

  return true;
};

export const getTweets = async () => {
  const supabase = getSupabaseClient(); // ✅
  const { error, data } = await supabase
    .from("tweets")
    .select(`*,profiles(id,username,name,avatar_url)`)
    .is("scheduled_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("fetchTweetsError:", error.message);
  }

  return data;
};

export const deleteTweet = async (tweetId: string, imagePath?: string) => {
  const supabase = getSupabaseClient(); // ✅
  const { error: deleteError } = await supabase
    .from("tweets")
    .delete()
    .eq("id", tweetId);

  if (deleteError) {
    console.log("DeleteTweetError", deleteError.message);
    return;
  }

  if (imagePath) {
    const { error: imageError } = await supabase.storage
      .from("tweet-images")
      .remove([imagePath]);

    if (imageError) {
      console.log("ImageDeleteError", imageError.message);
    }
  }
};