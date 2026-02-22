import axios from "axios";
import type { CreatorResult, PostResult } from "@/types";

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
    Travel: "travel",
    "Personal Finance": "finance-and-economics",
    Gaming: "gaming",
    Photography: "photography",
    Lifestyle: "lifestyle",
    Education: "education",
    "Comedy & Entertainment": "humor-and-fun-and-happiness",
    Music: "music",
    "Art & Design": "art-and-artists",
    Parenting: "family",
    "Pets & Animals": "animals",
    Sports: "sports-with-a-ball",
    "DIY & Crafts": "diy-and-design",
    "Business & Entrepreneurship": "business-and-careers",
    "Motivation & Self-Help": "shows",
  };
  return tagMap[niche] || niche.toLowerCase().replace(/\s+&?\s*/g, "-");
}

export async function searchInstagramCreators(niche: string): Promise<CreatorResult[]> {
  try {
    const tag = nicheToTag(niche);
    const { data } = await axios.get(`https://${RAPIDAPI_HOST}/search`, {
      params: {
        page: 1,
        perPage: 20,
        sort: "-avgER",
        socialTypes: "INST",
        tags: tag,
        trackTotal: true,
      },
      headers: getHeaders(),
    });

    if (data?.meta?.code !== 200 || !data?.data?.length) {
      console.warn("Instagram Statistics API returned no results, trying query search...");
      // Fallback: try searching by query instead of tags
      const { data: queryData } = await axios.get(`https://${RAPIDAPI_HOST}/search`, {
        params: {
          page: 1,
          perPage: 20,
          sort: "-avgER",
          socialTypes: "INST",
          q: niche,
          trackTotal: true,
        },
        headers: getHeaders(),
      });

      if (queryData?.meta?.code !== 200 || !queryData?.data?.length) {
        return getMockInstagramCreators(niche);
      }

      return mapCreatorResults(queryData.data, "instagram");
    }

    return mapCreatorResults(data.data, "instagram");
  } catch (error) {
    console.error("Instagram search error:", error);
    return getMockInstagramCreators(niche);
  }
}

function mapCreatorResults(
  creators: Record<string, unknown>[],
  platform: "instagram" | "tiktok"
): CreatorResult[] {
  return creators.map((creator) => ({
    handle: (creator.screenName as string) || "",
    displayName: (creator.name as string) || (creator.screenName as string) || "",
    platform,
    followerCount: (creator.usersCount as number) || 0,
    bio: "",
    avatarUrl: (creator.image as string) || "",
    cid: (creator.cid as string) || "",
    avgER: (creator.avgER as number) || 0,
    qualityScore: (creator.qualityScore as number) || 0,
  }));
}

export async function fetchInstagramPosts(handle: string, cid?: string): Promise<PostResult[]> {
  try {
    // If we don't have a cid, look it up via Profile by URL
    let creatorCid = cid;
    if (!creatorCid) {
      const profileUrl = `https://instagram.com/${handle}`;
      const { data: profileData } = await axios.get(`https://${RAPIDAPI_HOST}/community`, {
        params: { url: profileUrl },
        headers: getHeaders(),
      });
      creatorCid = profileData?.data?.cid || profileData?.cid;
      if (!creatorCid) {
        console.error("Could not resolve cid for handle:", handle);
        return getMockInstagramPosts(handle);
      }
    }

    // Fetch posts for the last 90 days
    const now = new Date();
    const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

    const { data } = await axios.get(`https://${RAPIDAPI_HOST}/posts`, {
      params: {
        cid: creatorCid,
        from: formatDate(from),
        to: formatDate(now),
        type: "posts",
        sort: "date",
      },
      headers: getHeaders(),
    });

    if (data?.meta?.code !== 200 || !data?.data?.posts?.length) {
      return getMockInstagramPosts(handle);
    }

    const posts = data.data.posts as Record<string, unknown>[];
    return posts.slice(0, 12).map((post) => {
      const postType = mapPostType((post.type as string) || "");
      return {
        externalId: (post.socialPostID as string) || (post.postID as string) || "",
        platform: "instagram" as const,
        postType,
        caption: (post.text as string) || "",
        mediaUrl: (post.postImage as string) || "",
        thumbnailUrl: (post.postImage as string) || "",
        likes: (post.likes as number) || 0,
        comments: (post.comments as number) || 0,
        shares: (post.rePosts as number) || 0,
        views: (post.videoViews as number) || (post.views as number) || 0,
        postedAt: (post.date as string) || new Date().toISOString(),
        engagementRate: (post.er as number) ? (post.er as number) * 100 : 0,
      };
    });
  } catch (error) {
    console.error("Instagram posts fetch error:", error);
    return getMockInstagramPosts(handle);
  }
}

function mapPostType(apiType: string): "reel" | "carousel" | "static" | "video" | "story" {
  const type = apiType.toLowerCase();
  if (type.includes("reel") || type.includes("video")) return "reel";
  if (type.includes("carousel") || type.includes("album")) return "carousel";
  if (type.includes("story") || type.includes("stories")) return "story";
  return "static";
}

function getMockInstagramCreators(niche: string): CreatorResult[] {
  const mockNames = [
    "fitness_guru",
    "healthy_habits",
    "workout_daily",
    "mindful_moves",
    "strength_lab",
    "clean_eats",
    "yoga_flow",
    "run_wild",
    "lift_heavy",
    "wellness_warrior",
  ];
  return mockNames.slice(0, 10).map((name) => ({
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
