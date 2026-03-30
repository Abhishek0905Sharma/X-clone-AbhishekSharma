export type Tweet = {
  id: string;
  user_id: string;
  content: string;
  image_url: string;
  created_at: string;
  image_Path: string;
  retweetedAt?: string;
  isRetweet?: boolean;
  retweetedBy?: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
  };
  profiles: {
    id: string;
    avatar_url: string;
    name: string;
    username: string;
  };
};

export type Comment = {
  id:string,
  user_id:string,
  tweet_id:string,
  content:string,
  created_at:string,
   profiles: {
    id: string;
    avatar_url: string;
    name: string;
    username: string;
  };
}