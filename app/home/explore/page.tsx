"use client";
import Image from "next/image";
import { useState } from "react";
import { getSupabaseClient } from "../../../lib/SupabaseClient";
import { IoSearchOutline } from "react-icons/io5";
import { SpinnerCircularFixed } from "spinners-react";
import { useRouter } from "next/navigation";
import moment from "moment";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"top" | "people" | "latest">("top");
  const router = useRouter();

  const search = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setUsers([]); setTweets([]); return; }
    setLoading(true);
    const supabase = getSupabaseClient();
    const [{ data: u }, { data: t }] = await Promise.all([
      supabase.from("profiles").select("*").ilike("username", `%${q}%`).limit(5),
      supabase.from("tweets").select("*, profiles(id, name, username, avatar_url)")
        .ilike("content", `%${q}%`).is("scheduled_at", null).limit(10),
    ]);
    setUsers(u || []);
    setTweets(t || []);
    setLoading(false);
  };

  return (
    <div className="text-white">
      <div className="sticky top-0 bg-black/80 backdrop-blur z-10 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 bg-hover rounded-full px-4 py-2">
          <IoSearchOutline size={20} className="text-secondary-text" />
          <input value={query} onChange={(e) => search(e.target.value)}
            placeholder="Search Twitter Clone"
            className="bg-transparent outline-none text-white placeholder-secondary-text w-full" />
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-border">
        {(["top", "people", "latest"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`py-4 text-sm font-semibold capitalize hover:bg-hover cursor-pointer ${activeTab === tab ? "border-b-2 border-blue-500 text-white" : "text-secondary-text"}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><SpinnerCircularFixed size={30} color="#1DA1F2" /></div>
      ) : !query ? (
        <p className="text-center text-secondary-text py-10">Search for people or tweets</p>
      ) : (
        <>
          {(activeTab === "top" || activeTab === "people") && users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-hover cursor-pointer">
              <Image src={u.avatar_url} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold">{u.name}</p>
                <p className="text-secondary-text text-sm">@{u.username}</p>
              </div>
              <button className="ml-auto border border-border rounded-full px-4 py-1 text-sm font-semibold hover:bg-hover">Follow</button>
            </div>
          ))}
          {(activeTab === "top" || activeTab === "latest") && tweets.map((t) => (
            <div key={t.id} onClick={() => router.push(`/home/post/${t.id}`)}
              className="flex gap-3 px-4 py-3 border-b border-border hover:bg-hover cursor-pointer">
              <Image src={t.profiles.avatar_url} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="w-full">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-bold">{t.profiles.name}</span>
                  <span className="text-secondary-text">@{t.profiles.username}</span>
                  <span className="text-secondary-text">· {moment(t.created_at).fromNow()}</span>
                </div>
                {t.content && <p className="mt-1">{t.content}</p>}
                {t.image_url && <Image src={t.image_url} alt="tweet" width={500} height={300} className="mt-2 rounded-xl border border-border w-full object-cover max-h-64" />}
              </div>
            </div>
          ))}
          {users.length === 0 && tweets.length === 0 && (
            <p className="text-center text-secondary-text py-10">No results for "{query}"</p>
          )}
        </>
      )}
    </div>
  );
}