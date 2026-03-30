"use client";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { FaRegFaceSmile } from "react-icons/fa6";
import { IoLocationOutline } from "react-icons/io5";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { TbPhoto } from "react-icons/tb";
import { useGetUser } from "../../custom-hooks/useGetUser";
import { usePostTweet } from "../../custom-hooks/useTweet";
import { SpinnerCircularFixed } from "spinners-react";

export default function CreatePost() {
  const [post, setPost] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tweetImage, setTweetImage] = useState<null | File>(null);
  const fileref = useRef<HTMLInputElement | null>(null);
  const isDisabled = post.trim() === "" && !imagePreview;
  const { loading, session, profile, gettingSession } = useGetUser();
  const { mutate, isPending } = usePostTweet();
  const [location, setLocation] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
const [showScheduler, setShowScheduler] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setTweetImage(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileref.current) fileref.current.value = "";
    setTweetImage(null);
  };

  const onEmojiClick = (emojidata: EmojiClickData) => {
    setPost((prev) => prev + emojidata.emoji);
  };
  const handleLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        window.open(mapsUrl, "_blank");
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      () => {
        window.open("https://www.google.com/maps", "_blank");
      }
    );
  } else {
    window.open("https://www.google.com/maps", "_blank");
  }
};

  const PostTweet = () => {
    if (!post.trim() && !tweetImage) {
      return;
    }

    if (!session?.user.id) return;

    mutate(
      {
        userId: session.user.id,
        content: post || null,
        tweetImage: tweetImage || null,
        scheduledAt: scheduledAt || null,
      },
      {
        onSuccess: () => {
          setPost("");
          setImagePreview(null);
          setTweetImage(null);
          setScheduledAt(null);
setShowScheduler(false);
        },
        onError: (error) => {
          console.log("Failed to post tweet", error.message);
        },
      }
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-4">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  if (gettingSession)
    return (
      <div className="flex justify-center items-center py-4">
        <SpinnerCircularFixed size={25} color="#1DA1F2" />
      </div>
    );
  if (!session) return null;
  if (!profile) return null;
  return (
    <div
      className={`flex gap-4 p-4 border border-border ${
        isPending ? "opacity-30" : ""
      }`}
    >
      {profile?.avatar_url && (
        <Image
          src={profile.avatar_url}
          alt="profile-pic"
          width={500}
          height={500}
          className="w-10 h-10 object-cover rounded-full shrink-0"
        />
      )}
      <div className="w-full">
        <textarea
          placeholder="what's happening?"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="w-full placeholder:text-secondary-text outline-none text-xl resize-none text-white"
        ></textarea>
        {imagePreview && (
          <div className="h-60 md:h-100 rounded-lg overflow-hidden border border-border mb-10 relative">
            <Image
              src={imagePreview}
              width={500}
              height={500}
              className="h-full w-full object-cover"
              alt="preview-image"
            />
            <button
              className="absolute top-5 right-5 bg-gray-600 w-10 h-10 text-2xl rounded-full opacity-50 cursor-pointer grid place-items-center"
              onClick={removeImage}
            >
              <RxCross2 />
            </button>
          </div>
        )}
        {location && (
  <div className="flex items-center gap-1 text-blue-400 text-sm mb-2">
    <IoLocationOutline size={14} />
    <span>{location}</span>
    <button
      onClick={() => setLocation(null)}
      className="ml-1 text-secondary-text hover:text-white"
    >
      ✕
    </button>
  </div>
)}
{scheduledAt && (
  <div className="flex items-center gap-1 text-blue-400 text-sm mb-2">
    <RiCalendarScheduleLine size={14} />
    <span>Scheduled: {new Date(scheduledAt).toLocaleString()}</span>
    <button onClick={() => setScheduledAt(null)} className="ml-1 text-secondary-text hover:text-white">✕</button>
  </div>
)}
        <div className="flex justify-between py-4 items-center border-t border-border">
          <div className="flex gap-3">
            <div
              className="text-primary cursor-pointer"
              onClick={() => fileref.current?.click()}
            >
              <TbPhoto size={20} />
            </div>
            <div
              className="text-primary cursor-pointer"
              onClick={() => setShowPicker(!showPicker)}
            >
              <FaRegFaceSmile size={20} />
            </div>
            <div
  className={`cursor-pointer ${location ? "text-blue-400" : "text-primary"}`}
  onClick={handleLocation}
  title="Add location"
>
  <IoLocationOutline size={20} />
</div>
            <div className="relative">
  <div
    className={`cursor-pointer ${scheduledAt ? "text-blue-400" : "text-primary"}`}
    onClick={() => setShowScheduler(!showScheduler)}
  >
    <RiCalendarScheduleLine size={20} />
  </div>
  {showScheduler && (
    <div className="absolute bottom-10 left-0 bg-[#1e2732] border border-border rounded-xl p-4 z-20 w-72 shadow-xl">
      <p className="text-white font-bold mb-3">Schedule post</p>
      <input
        type="datetime-local"
        min={new Date().toISOString().slice(0, 16)}
        value={scheduledAt || ""}
        onChange={(e) => setScheduledAt(e.target.value)}
        className="w-full bg-black text-white border border-border rounded-lg p-2 text-sm outline-none"
      />
      <div className="flex gap-2 mt-3">
        <button onClick={() => { setScheduledAt(null); setShowScheduler(false); }}
          className="flex-1 border border-border text-white py-1 rounded-full text-sm">Clear</button>
        <button onClick={() => setShowScheduler(false)}
          className="flex-1 bg-[#1d9bf0] text-white py-1 rounded-full text-sm font-bold">Confirm</button>
      </div>
    </div>
  )}
</div>
          </div>
          {isDisabled ? (
            <button className="text-black bg-secondary-text py-2 px-5 font-semibold cursor-pointer rounded-full">
              Post
            </button>
          ) : (
            <button
              onClick={PostTweet}
              className="text-black bg-white py-2 px-5 font-semibold cursor-pointer rounded-full"
            >
              Post
            </button>
          )}
          {showPicker && (
            <div className="fixed z-10 top-50 left-1/2 w-[90%] max-w-2xl -translate-x-1/2">
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={onEmojiClick}
                style={{
                  width: "100%",
                  background: "black",
                }}
              />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileref}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}