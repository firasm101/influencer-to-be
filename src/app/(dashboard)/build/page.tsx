"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightCard } from "@/components/insight-card";
import { PostBuilder } from "@/components/post-builder";
import { Lightbulb, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Insight {
  id: string;
  insightType: string;
  insightText: string;
  dataPoints: number;
  generatedAt: string;
}

export default function BuildPage() {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchInsights();
    }
  }, [session, fetchInsights]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" />
          Post Builder
        </h1>
        <p className="mt-1 text-muted-foreground">
          Generate AI-powered posts based on what&apos;s working in your niche.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-24" />
        </div>
      ) : insights.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No insights yet</h2>
          <p className="mt-2 text-muted-foreground">
            The Post Builder uses your niche insights to create optimized content.
            Generate insights first by tracking creators and analyzing their posts.
          </p>
          <Link href="/insights">
            <Button className="mt-4 gap-2">
              <Lightbulb className="h-4 w-4" /> Go to Insights
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Insights summary */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Your Niche Insights ({insights.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {insights.slice(0, 4).map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
            {insights.length > 4 && (
              <p className="mt-2 text-sm text-muted-foreground">
                + {insights.length - 4} more insights powering your content
              </p>
            )}
          </div>

          {/* Post Builder */}
          <PostBuilder hasInsights={true} />
        </>
      )}
    </div>
  );
}
