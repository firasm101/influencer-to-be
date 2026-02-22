export type Platform = "instagram" | "tiktok";

export type PostType = "reel" | "carousel" | "static" | "story" | "video";

export type HookType =
  | "question"
  | "bold_statement"
  | "story"
  | "statistic"
  | "controversial"
  | "how_to"
  | "listicle"
  | "behind_the_scenes"
  | "other";

export interface CreatorResult {
  handle: string;
  displayName: string;
  platform: Platform;
  followerCount: number;
  bio: string;
  avatarUrl: string;
  cid?: string; // Instagram Statistics API creator ID (e.g., "INST:12345" or "TT:12345")
  avgER?: number;
  qualityScore?: number;
}

export interface PostResult {
  externalId: string;
  platform: Platform;
  postType: PostType;
  caption: string;
  mediaUrl: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  postedAt: string;
  engagementRate: number;
}

export interface AnalysisResult {
  hookType: HookType;
  contentFormat: string;
  topic: string;
  whyItWorked: string;
  sentiment: string;
  keyTakeaways: string[];
}

export interface NicheInsightData {
  insightType: string;
  insightText: string;
  dataPoints: number;
}

export interface GeneratedPostData {
  caption: string;
  hashtags: string[];
  formatTips: string;
  postingTips: string;
  suggestedFormat: string;
}

export const NICHES = [
  "Fitness & Health",
  "Cooking & Food",
  "Tech Reviews",
  "Fashion & Style",
  "Beauty & Skincare",
  "Travel",
  "Personal Finance",
  "Gaming",
  "Photography",
  "Lifestyle",
  "Education",
  "Comedy & Entertainment",
  "Music",
  "Art & Design",
  "Parenting",
  "Pets & Animals",
  "Sports",
  "DIY & Crafts",
  "Business & Entrepreneurship",
  "Motivation & Self-Help",
] as const;
