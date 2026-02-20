"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface PostAnalysis {
  hookType: string | null;
  contentFormat: string | null;
  topic: string | null;
  whyItWorked: string | null;
  sentiment: string | null;
  keyTakeaways: string[];
}

interface Post {
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
}

interface Creator {
  id: string;
  handle: string;
  displayName: string | null;
  platform: string;
  followerCount: number;
  posts: Post[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchCreators = useCallback(async () => {
    try {
      const res = await fetch("/api/creators");
      const data = await res.json();
      setCreators(data.creators || []);
    } catch (error) {
      console.error("Failed to fetch creators:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user) {
      const user = session.user as { onboarded?: boolean };
      if (!user.onboarded) {
        router.push("/onboarding");
        return;
      }
      fetchCreators();
    }
  }, [session, status, router, fetchCreators]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await fetch("/api/analyze", { method: "POST" });
      await fetchCreators();
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const allPosts = creators.flatMap((c) =>
    c.posts.map((p) => ({ ...p, creatorHandle: c.handle }))
  );
  const sortedPosts = allPosts.sort(
    (a, b) => b.engagementRate - a.engagementRate
  );
  const analyzedCount = allPosts.filter((p) => p.analysis).length;
  const unanalyzedCount = allPosts.length - analyzedCount;

  const niche = (session?.user as { niche?: string })?.niche;

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {niche && (
          <p className="mt-1 text-muted-foreground">
            Your niche: <Badge variant="secondary">{niche}</Badge>
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Tracked Creators
          </div>
          <p className="mt-2 text-2xl font-bold">{creators.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            Posts Collected
          </div>
          <p className="mt-2 text-2xl font-bold">{allPosts.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Posts Analyzed
          </div>
          <p className="mt-2 text-2xl font-bold">{analyzedCount}</p>
        </div>
      </div>

      {/* Empty State */}
      {creators.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No creators tracked yet</h2>
          <p className="mt-2 text-muted-foreground">
            Head to the Discover page to find top creators in your niche.
          </p>
          <Link href="/discover">
            <Button className="mt-4 gap-2">
              Discover Creators <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Actions */}
      {unanalyzedCount > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            <strong>{unanalyzedCount} posts</strong> haven&apos;t been analyzed
            yet.
          </p>
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            size="sm"
            className="gap-2"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Analyze Now
              </>
            )}
          </Button>
        </div>
      )}

      {/* Feed */}
      {sortedPosts.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            Top Performing Posts
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sortedPosts.slice(0, 10).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                creatorHandle={post.creatorHandle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
