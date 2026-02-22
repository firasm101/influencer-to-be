"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Instagram,
  Linkedin,
  Sparkles,
} from "lucide-react";

interface PostAnalysis {
  hookType: string | null;
  contentFormat: string | null;
  topic: string | null;
  whyItWorked: string | null;
  sentiment: string | null;
  keyTakeaways: string[];
}

interface PostCardProps {
  post: {
    id: string;
    platform: string;
    postType: string;
    caption: string | null;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagementRate: number;
    postedAt: string | null;
    analysis: PostAnalysis | null;
  };
  creatorHandle?: string;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

const hookColors: Record<string, string> = {
  question: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  bold_statement: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  story: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  statistic: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  controversial: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  how_to: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  listicle: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  behind_the_scenes: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

export function PostCard({ post, creatorHandle }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.platform === "instagram" ? (
              <Instagram className="h-4 w-4" />
            ) : post.platform === "linkedin" ? (
              <Linkedin className="h-4 w-4" />
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
              </svg>
            )}
            {creatorHandle && (
              <span className="text-sm font-medium">@{creatorHandle}</span>
            )}
            <Badge variant="outline" className="text-xs capitalize">
              {post.postType}
            </Badge>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-bold"
          >
            {post.engagementRate.toFixed(1)}% ER
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Caption */}
        {post.caption && (
          <p className="text-sm leading-relaxed line-clamp-3">{post.caption}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> {formatNumber(post.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />{" "}
            {formatNumber(post.comments)}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3.5 w-3.5" /> {formatNumber(post.shares)}
          </span>
          {post.views > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {formatNumber(post.views)}
            </span>
          )}
        </div>

        {/* Analysis */}
        {post.analysis && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Analysis</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.analysis.hookType && (
                <Badge
                  className={`text-xs ${hookColors[post.analysis.hookType] || "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300"}`}
                >
                  {post.analysis.hookType.replace(/_/g, " ")}
                </Badge>
              )}
              {post.analysis.topic && (
                <Badge variant="outline" className="text-xs">
                  {post.analysis.topic}
                </Badge>
              )}
              {post.analysis.sentiment && (
                <Badge variant="outline" className="text-xs capitalize">
                  {post.analysis.sentiment}
                </Badge>
              )}
            </div>
            {post.analysis.whyItWorked && (
              <p className="text-sm text-muted-foreground">
                {post.analysis.whyItWorked}
              </p>
            )}
            {post.analysis.keyTakeaways?.length > 0 && (
              <ul className="space-y-1">
                {post.analysis.keyTakeaways.map((t, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    &bull; {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
