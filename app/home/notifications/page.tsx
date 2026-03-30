// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/SupabaseClient";
import { useGetUser } from "../../../custom-hooks/useGetUser";
import { SpinnerCircularFixed } from "spinners-react";
import moment from "moment";
import { BiBell } from "react-icons/bi";
import { FaHeart, FaRetweet } from "react-icons/fa";
import { BiComment } from "react-icons/bi";

export default function NotificationsPage() {
  const { profile, loading } = useGetUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");

  useEffect(() => {
    if (!profile?.id) return;
    const fetch = async () => {
      const supabase = getSupabaseClient();
      setNotifLoading(true);
      const [{ data: likes }, { data: retweets }, { data: comments }] = await Promise.all([
        supabase.from("likes").select("id, created_at, profiles(id, name, username, avatar_url), tweets(id, content, user_id)").neq("user_id", profile.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("retweets").select("id, created_at, profiles(id, name, username, avatar_url), tweets(id, content, user_id)").neq("user_id", profile.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("comments").select("id, created_at, profiles(id, name, username, avatar_url), tweets(id, content, user_id)").neq("user_id", profile.id).order("created_at", { ascending: false }).limit(10),
      ]);

      const all = [
        ...(likes || []).filter((l: any) => l.tweets?.user_id === profile.id).map((l: any) => ({ ...l, type: "like" })),
        ...(retweets || []).filter((r: any) => r.tweets?.user_id === profile.id).map((r: any) => ({ ...r, type: "retweet" })),
        ...(comments || []).filter((c: any) => c.tweets?.user_id === profile.id).map((c: any) => ({ ...c, type: "comment" })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(all);
      setNotifLoading(false);
    };
    fetch();
  }, [profile?.id]);

  if (loading) return <div className="flex justify-center py-8"><SpinnerCircularFixed size={30} color="#1DA1F2" /></div>;

  return (
    <div className="text-white">
      <div className="sticky top-0 bg-black/80 backdrop-blur z-10 px-4 py-4 border-b border-border">
        <p className="font-bold text-xl">Notifications</p>
      </div>

      <div className="grid grid-cols-2 border-b border-border">
        {(["all", "mentions"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`py-4 text-sm font-semibold capitalize hover:bg-hover cursor-pointer ${activeTab === tab ? "border-b-2 border-blue-500 text-white" : "text-secondary-text"}`}>
            {tab}
          </button>
        ))}
      </div>

      {notifLoading ? (
        <div className="flex justify-center py-8"><SpinnerCircularFixed size={30} color="#1DA1F2" /></div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <BiBell size={40} className="text-secondary-text" />
          <p className="text-secondary-text">No notifications yet</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="flex gap-3 px-4 py-3 border-b border-border hover:bg-hover cursor-pointer">
            <div className="flex flex-col items-center gap-1">
              {n.type === "like" && <FaHeart className="text-pink-500" size={18} />}
              {n.type === "retweet" && <FaRetweet className="text-green-500" size={18} />}
              {n.type === "comment" && <BiComment className="text-blue-400" size={18} />}
              <Image src={n.profiles.avatar_url} alt="avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <strong>{n.profiles.name}</strong>
                {n.type === "like" && " liked your post"}
                {n.type === "retweet" && " reposted your post"}
                {n.type === "comment" && " replied to your post"}
              </p>
              {n.tweets?.content && <p className="text-secondary-text text-sm mt-1 truncate">{n.tweets.content}</p>}
              <p className="text-secondary-text text-xs mt-1">{moment(n.created_at).fromNow()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}