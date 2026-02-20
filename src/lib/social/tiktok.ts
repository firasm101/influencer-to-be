import axios from "axios";
import type { CreatorResult, PostResult } from "@/types";

const RAPIDAPI_HOST = "tiktok-scraper7.p.rapidapi.com";

function getHeaders() {
  return {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

export async function searchTikTokCreators(niche: string): Promise<CreatorResult[]> {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/user/search`,
      {
        params: { keywords: niche, count: 20 },
        headers: getHeaders(),
      }
    );

    const users = data?.data?.user_list || [];
    return users.slice(0, 20).map((item: Record<string, unknown>) => {
      const user = (item.user_info as Record<string, unknown>) || item;
      return {
        handle: (user.unique_id as string) || (user.uniqueId as string) || "",
        displayName: (user.nickname as string) || "",
        platform: "tiktok" as const,
        followerCount: (user.follower_count as number) || (user.followerCount as number) || 0,
        bio: (user.signature as string) || "",
        avatarUrl: ((user.avatar_thumb as Record<string, unknown>)?.url_list as string[])?.[0] || (user.avatarThumb as string) || "",
      };
    });
  } catch (error) {
    console.error("TikTok search error:", error);
    return getMockTikTokCreators(niche);
  }
}

export async function fetchTikTokPosts(handle: string): Promise<PostResult[]> {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/user/posts`,
      {
        params: { unique_id: handle, count: 12 },
        headers: getHeaders(),
      }
    );

    const videos = data?.data?.videos || [];
    return videos.slice(0, 12).map((video: Record<string, unknown>) => {
      const stats = (video.statistics as Record<string, number>) || (video.stats as Record<string, number>) || {};
      return {
        externalId: (video.video_id as string) || (video.id as string) || "",
        platform: "tiktok" as const,
        postType: "video",
        caption: (video.title as string) || (video.desc as string) || "",
        mediaUrl: (video.play as string) || "",
        thumbnailUrl: (video.cover as string) || (video.origin_cover as string) || "",
        likes: stats.digg_count || stats.diggCount || 0,
        comments: stats.comment_count || stats.commentCount || 0,
        shares: stats.share_count || stats.shareCount || 0,
        views: stats.play_count || stats.playCount || 0,
        postedAt: new Date((video.create_time as number) * 1000).toISOString(),
        engagementRate: 0,
      };
    });
  } catch (error) {
    console.error("TikTok posts fetch error:", error);
    return getMockTikTokPosts(handle);
  }
}

function getMockTikTokCreators(niche: string): CreatorResult[] {
  const mockNames = [
    "trending_tips", "viral_vibes", "content_king", "niche_master", "growth_hacker",
    "daily_inspo", "creator_life", "trend_setter", "viral_coach", "social_spark",
  ];
  return mockNames.slice(0, 10).map((name, i) => ({
    handle: `${name}_${niche.toLowerCase().replace(/\s+/g, "")}`.slice(0, 25),
    displayName: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    platform: "tiktok" as const,
    followerCount: Math.floor(Math.random() * 1000000) + 50000,
    bio: `${niche} creator | Going viral one video at a time`,
    avatarUrl: "",
  }));
}

function getMockTikTokPosts(handle: string): PostResult[] {
  const captions = [
    "Wait for it... this hack changed my life! #fyp #viral",
    "I can't believe this actually works. Try it yourself! #lifehack",
    "Replying to @user here's exactly how I did it step by step",
    "Day 30 of posting until I go viral. Today's the day?",
    "POV: when you finally crack the code. Stitch this!",
    "3 secrets nobody tells you about this. Number 2 is wild",
    "Tell me you're into this without telling me. I'll go first",
    "This trend but make it educational. You're welcome!",
  ];
  return Array.from({ length: 8 }, (_, i) => ({
    externalId: `mock_tt_${handle}_${i}`,
    platform: "tiktok" as const,
    postType: "video" as const,
    caption: captions[i % captions.length],
    mediaUrl: "",
    thumbnailUrl: "",
    likes: Math.floor(Math.random() * 100000) + 1000,
    comments: Math.floor(Math.random() * 5000) + 100,
    shares: Math.floor(Math.random() * 3000) + 50,
    views: Math.floor(Math.random() * 500000) + 10000,
    postedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    engagementRate: Math.random() * 12 + 2,
  }));
}
