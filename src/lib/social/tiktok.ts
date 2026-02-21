import axios from "axios";
import type { CreatorResult, PostResult } from "@/types";

// Uses the same Instagram Statistics API which also covers TikTok
const RAPIDAPI_HOST = "instagram-statistics-api.p.rapidapi.com";

function getHeaders() {
  return {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

// Map niche names to API-compatible tag slugs
function nicheToTag(niche: string): string {
  const tagMap: Record<string, string> = {
    "Fitness & Health": "fitness",
    "Cooking & Food": "food-and-cooking",
    "Tech Reviews": "technology-and-science",
    "Fashion & Style": "fashion",
    "Beauty & Skincare": "beauty",
    "Travel": "travel",
    "Personal Finance": "finance-and-economics",
    "Gaming": "gaming",
    "Photography": "photography",
    "Lifestyle": "lifestyle",
    "Education": "education",
    "Comedy & Entertainment": "humor-and-fun-and-happiness",
    "Music": "music",
    "Art & Design": "art-and-artists",
    "Parenting": "family",
    "Pets & Animals": "animals",
    "Sports": "sports-with-a-ball",
    "DIY & Crafts": "diy-and-design",
    "Business & Entrepreneurship": "business-and-careers",
    "Motivation & Self-Help": "shows",
  };
  return tagMap[niche] || niche.toLowerCase().replace(/\s+&?\s*/g, "-");
}

export async function searchTikTokCreators(niche: string): Promise<CreatorResult[]> {
  try {
    const tag = nicheToTag(niche);
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/search`,
      {
        params: {
          page: 1,
          perPage: 20,
          sort: "-avgER",
          socialTypes: "TT",
          tags: tag,
          trackTotal: true,
        },
        headers: getHeaders(),
      }
    );

    if (data?.meta?.code !== 200 || !data?.data?.length) {
      console.warn("TikTok search via Statistics API returned no results, trying query search...");
      const { data: queryData } = await axios.get(
        `https://${RAPIDAPI_HOST}/search`,
        {
          params: {
            page: 1,
            perPage: 20,
            sort: "-avgER",
            socialTypes: "TT",
            q: niche,
            trackTotal: true,
          },
          headers: getHeaders(),
        }
      );

      if (queryData?.meta?.code !== 200 || !queryData?.data?.length) {
        return getMockTikTokCreators(niche);
      }

      return mapCreatorResults(queryData.data);
    }

    return mapCreatorResults(data.data);
  } catch (error) {
    console.error("TikTok search error:", error);
    return getMockTikTokCreators(niche);
  }
}

function mapCreatorResults(creators: Record<string, unknown>[]): CreatorResult[] {
  return creators.map((creator) => ({
    handle: (creator.screenName as string) || "",
    displayName: (creator.name as string) || (creator.screenName as string) || "",
    platform: "tiktok" as const,
    followerCount: (creator.usersCount as number) || 0,
    bio: "",
    avatarUrl: (creator.image as string) || "",
    cid: (creator.cid as string) || "",
    avgER: (creator.avgER as number) || 0,
    qualityScore: (creator.qualityScore as number) || 0,
  }));
}

export async function fetchTikTokPosts(handle: string, cid?: string): Promise<PostResult[]> {
  try {
    // If we don't have a cid, look it up via Profile by URL
    let creatorCid = cid;
    if (!creatorCid) {
      const profileUrl = `https://www.tiktok.com/@${handle}`;
      const { data: profileData } = await axios.get(
        `https://${RAPIDAPI_HOST}/community`,
        {
          params: { url: profileUrl },
          headers: getHeaders(),
        }
      );
      creatorCid = profileData?.data?.cid || profileData?.cid;
      if (!creatorCid) {
        console.error("Could not resolve TikTok cid for handle:", handle);
        return getMockTikTokPosts(handle);
      }
    }

    // Fetch posts for the last 90 days
    const now = new Date();
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/posts`,
      {
        params: {
          cid: creatorCid,
          from: formatDate(from),
          to: formatDate(now),
          type: "posts",
          sort: "date",
        },
        headers: getHeaders(),
      }
    );

    if (data?.meta?.code !== 200 || !data?.data?.posts?.length) {
      return getMockTikTokPosts(handle);
    }

    const posts = data.data.posts as Record<string, unknown>[];
    return posts.slice(0, 12).map((post) => ({
      externalId: (post.socialPostID as string) || (post.postID as string) || "",
      platform: "tiktok" as const,
      postType: "video" as const,
      caption: (post.text as string) || "",
      mediaUrl: (post.videoLink as string) || (post.postImage as string) || "",
      thumbnailUrl: (post.postImage as string) || "",
      likes: (post.likes as number) || 0,
      comments: (post.comments as number) || 0,
      shares: (post.rePosts as number) || 0,
      views: (post.videoViews as number) || (post.views as number) || 0,
      postedAt: (post.date as string) || new Date().toISOString(),
      engagementRate: (post.er as number) ? (post.er as number) * 100 : 0,
    }));
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
  return mockNames.slice(0, 10).map((name) => ({
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
