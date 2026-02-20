import axios from "axios";
import type { CreatorResult, PostResult } from "@/types";

const RAPIDAPI_HOST = "instagram-scraper-api2.p.rapidapi.com";

function getHeaders() {
  return {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

export async function searchInstagramCreators(niche: string): Promise<CreatorResult[]> {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/v1/hashtag`,
      {
        params: { hashtag: niche.toLowerCase().replace(/\s+/g, "") },
        headers: getHeaders(),
      }
    );

    const users = data?.data?.top?.users || data?.data?.users || [];
    return users.slice(0, 20).map((user: Record<string, unknown>) => ({
      handle: (user.username as string) || "",
      displayName: (user.full_name as string) || (user.username as string) || "",
      platform: "instagram" as const,
      followerCount: (user.follower_count as number) || 0,
      bio: (user.biography as string) || "",
      avatarUrl: (user.profile_pic_url as string) || "",
    }));
  } catch (error) {
    console.error("Instagram search error:", error);
    return getMockInstagramCreators(niche);
  }
}

export async function fetchInstagramPosts(handle: string): Promise<PostResult[]> {
  try {
    const { data } = await axios.get(
      `https://${RAPIDAPI_HOST}/v1.2/posts`,
      {
        params: { username_or_id_or_url: handle },
        headers: getHeaders(),
      }
    );

    const items = data?.data?.items || [];
    return items.slice(0, 12).map((item: Record<string, unknown>) => {
      const likeCount = (item.like_count as number) || 0;
      const commentCount = (item.comment_count as number) || 0;
      const mediaType = item.media_type as number;
      let postType = "static";
      if (mediaType === 2) postType = "reel";
      else if (mediaType === 8) postType = "carousel";

      return {
        externalId: (item.code as string) || (item.id as string) || "",
        platform: "instagram" as const,
        postType,
        caption: ((item.caption as Record<string, unknown>)?.text as string) || "",
        mediaUrl: ((item.image_versions2 as Record<string, unknown>)?.candidates as Record<string, unknown>[])?.[0]?.url as string || "",
        thumbnailUrl: ((item.image_versions2 as Record<string, unknown>)?.candidates as Record<string, unknown>[])?.[0]?.url as string || "",
        likes: likeCount,
        comments: commentCount,
        shares: 0,
        views: (item.play_count as number) || 0,
        postedAt: new Date((item.taken_at as number) * 1000).toISOString(),
        engagementRate: 0,
      };
    });
  } catch (error) {
    console.error("Instagram posts fetch error:", error);
    return getMockInstagramPosts(handle);
  }
}

function getMockInstagramCreators(niche: string): CreatorResult[] {
  const mockNames = [
    "fitness_guru", "healthy_habits", "workout_daily", "mindful_moves", "strength_lab",
    "clean_eats", "yoga_flow", "run_wild", "lift_heavy", "wellness_warrior",
  ];
  return mockNames.slice(0, 10).map((name, i) => ({
    handle: `${name}_${niche.toLowerCase().replace(/\s+/g, "")}`.slice(0, 25),
    displayName: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    platform: "instagram" as const,
    followerCount: Math.floor(Math.random() * 500000) + 10000,
    bio: `${niche} content creator | Sharing tips & inspiration`,
    avatarUrl: "",
  }));
}

function getMockInstagramPosts(handle: string): PostResult[] {
  const types = ["reel", "carousel", "static", "reel", "carousel"] as const;
  const captions = [
    "5 things I wish I knew when starting out! Which one surprises you the most? Drop a comment below",
    "This changed everything for me. Here's the exact process I follow every single day",
    "POV: You finally figure out what works. Save this for later!",
    "Stop doing this ONE thing and watch your results transform. Swipe to see the difference",
    "Behind the scenes of my morning routine. It's not what you think...",
    "The algorithm doesn't want you to see this. Share before it gets taken down!",
    "I asked 100 people what their biggest struggle is. Here's what they said",
    "Unpopular opinion: most advice in this space is completely wrong. Here's why",
  ];
  return Array.from({ length: 8 }, (_, i) => ({
    externalId: `mock_${handle}_${i}`,
    platform: "instagram" as const,
    postType: types[i % types.length],
    caption: captions[i % captions.length],
    mediaUrl: "",
    thumbnailUrl: "",
    likes: Math.floor(Math.random() * 50000) + 500,
    comments: Math.floor(Math.random() * 2000) + 50,
    shares: Math.floor(Math.random() * 1000) + 10,
    views: Math.floor(Math.random() * 200000) + 5000,
    postedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    engagementRate: Math.random() * 8 + 1,
  }));
}
