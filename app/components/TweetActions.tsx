"use client";
import React, { useState } from "react";
import {
  FaRegBookmark,
  FaRegComment,  
  FaTrash,
} from "react-icons/fa6";
import { FiRepeat, FiShare } from "react-icons/fi";
import { IoIosStats } from "react-icons/io";
import { useUserSession } from "../../custom-hooks/useUserSession";
import { useDeleteTweet } from "../../custom-hooks/useTweet";
import { useRouter } from "next/navigation";
import { useCommentsCount } from "../../custom-hooks/useComment";
import LikeButton from "./LikeButton";
import { useRetweets, useToggleRetweet } from "../../custom-hooks/useRetweet";

type TweetActionsProp = {
  creatorId: string;
  tweetId: string;
  imagePath: string;
  isTweetPostViewPage: boolean;
};

export default function TweetActions({
  creatorId,
  tweetId,
  imagePath,
  isTweetPostViewPage,
}: TweetActionsProp) {
  const { mutate } = useDeleteTweet();
  const { session } = useUserSession();
  const {data:commentsCount} = useCommentsCount(tweetId);
  const userId = session?.user.id;
  const router = useRouter();
  const { data: retweets } = useRetweets(tweetId);
const { mutate: toggleRetweet } = useToggleRetweet();
const retweeted = retweets?.some((r) => r.user_id === userId);

const handleRetweet = () => {
  if (!session || !userId) return alert("Login to retweet");
  toggleRetweet({ tweetId, userId, retweeted: !!retweeted });
};
  const handleComment = () => {
  router.push(`/home/post/${tweetId}`);
};

  const handleDeleteTweet = () => {
    mutate(
      {
        tweetId,
        imagePath: imagePath || undefined,
      },
      {
        onSuccess: () => {
          if (isTweetPostViewPage) {
            router.replace("/home");
          }
        },
      }
    );
  };
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/home/post/${tweetId}`;
    if (navigator.share) {
      try { await navigator.share({ url: postUrl }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", postUrl);
    }
  };
  return (
    <div className="flex justify-between my-4 relative">
      <div 
  onClick={handleComment}
  className="text-secondary-text flex items-center gap-1 hover:text-blue-400 cursor-pointer">
  <FaRegComment />
  <span className="text-sm">{commentsCount}</span>
</div>
      {creatorId === userId ? (
        <button
          onClick={handleDeleteTweet}
          className="text-red-700 flex items-center gap-1 cursor-pointer"
        >
          <FaTrash />
        </button>
      ) : (
        <button
  onClick={handleRetweet}
  style={{ color: retweeted ? "#00ba7c" : "#71767b" }}
  className="flex items-center gap-1 cursor-pointer transition-colors hover:text-green-400"
>
  <FiRepeat />
  <span className="text-sm">{retweets?.length ?? 0}</span>
</button>
      )}
      <LikeButton tweetId={tweetId}userId={userId}session={session}/>
      <div className="text-secondary-text flex items-center gap-1 hover:text-blue-400 cursor-pointer">
        <IoIosStats />
        <span className="text-sm">5k</span>
      </div>
      <div className="text-secondary-text flex items-center gap-1 hover:text-blue-400 cursor-pointer">
        <FaRegBookmark size={20} />
      </div>
      <button onClick={handleShare} title="Share post"
        className="text-secondary-text flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors">
        <FiShare size={18} />
      </button>

      {/* Copied Toast */}
      {copied && (
        <span className="absolute -top-8 right-0 bg-[#1d9bf0] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
          Link copied!
        </span>
      )}
    </div>
  );
}