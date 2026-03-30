// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/SupabaseClient";
import { useGetUser } from "../../../custom-hooks/useGetUser";
import { Tweet } from "../../../types/types";
import moment from "moment";
import { SpinnerCircularFixed } from "spinners-react";
import { GoArrowLeft } from "react-icons/go";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { profile, loading, gettingSession } = useGetUser();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "replies" | "likes">("posts");
  const router = useRouter();

  useEffect(() => {
    if (!profile?.id) return;
    const fetchUserTweets = async () => {
      const supabase = getSupabaseClient();
      setTweetsLoading(true);
      const { data, error } = await supabase
        .from("tweets")
        .select("*, profiles(id, username, avatar_url, name)")
        .eq("user_id", profile.id)
        .is("scheduled_at", null)
        .order("created_at", { ascending: false });
      if (!error && data) setTweets(data);
      setTweetsLoading(false);
    };
    fetchUserTweets();
  }, [profile?.id]);

  if (loading || gettingSession)
    return <div className="flex justify-center items-center h-screen"><SpinnerCircularFixed size={35} color="#1DA1F2" /></div>;

  if (!profile) return null;

  return (
    <div className="text-white">
      <div className="flex items-center gap-4 px-4 py-3 sticky top-0 bg-black/80 backdrop-blur z-10 border-b border-border">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-hover cursor-pointer">
          <GoArrowLeft size={20} />
        </button>
        <div>
          <p className="font-bold text-lg">{profile.name}</p>
          <p className="text-secondary-text text-sm">{tweets.length} posts</p>
        </div>
      </div>

      <div className="h-32 bg-gray-700 w-full" />

      <div className="px-4 pb-4 border-b border-border">
        <div className="flex justify-between items-start -mt-10 mb-3">
          <Image src={profile.avatar_url} alt="avatar" width={200} height={200}
            className="w-20 h-20 rounded-full border-4 border-black object-cover" />
          <button className="border border-border rounded-full px-4 py-1 text-sm font-semibold hover:bg-hover mt-2">
            Edit profile
          </button>
        </div>
        <p className="font-bold text-xl">{profile.name}</p>
        <p className="text-secondary-text">@{profile.username}</p>
        <div className="flex gap-4 mt-3 text-sm">
          <span><strong>0</strong> <span className="text-secondary-text">Following</span></span>
          <span><strong>0</strong> <span className="text-secondary-text">Followers</span></span>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border">
        {(["posts", "replies", "likes"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`py-4 text-sm font-semibold capitalize hover:bg-hover cursor-pointer ${activeTab === tab ? "border-b-2 border-blue-500 text-white" : "text-secondary-text"}`}>
            {tab}
          </button>
        ))}
      </div>

      {tweetsLoading ? (
        <div className="flex justify-center py-8"><SpinnerCircularFixed size={30} color="#1DA1F2" /></div>
      ) : tweets.length === 0 ? (
        <p className="text-center text-secondary-text py-10">No posts yet</p>
      ) : (
        tweets.map((tweet) => (
          <div key={tweet.id} onClick={() => router.push(`/home/post/${tweet.id}`)}
            className="flex gap-3 px-4 py-3 border-b border-border hover:bg-hover cursor-pointer">
            <Image src={tweet.profiles.avatar_url} alt="avatar" width={40} height={40}
              className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div className="w-full">
              <div className="flex items-center gap-1 text-sm">
                <span className="font-bold">{tweet.profiles.name}</span>
                <span className="text-secondary-text">@{tweet.profiles.username}</span>
                <span className="text-secondary-text">· {moment(tweet.created_at).fromNow()}</span>
              </div>
              {tweet.content && <p className="mt-1">{tweet.content}</p>}
              {tweet.image_url && (
                <Image src={tweet.image_url} alt="tweet" width={500} height={300}
                  className="mt-2 rounded-xl border border-border w-full object-cover max-h-64" />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}