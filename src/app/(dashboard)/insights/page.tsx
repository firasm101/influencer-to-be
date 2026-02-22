"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InsightCard } from "@/components/insight-card";
import { Lightbulb, RefreshCw, Sparkles } from "lucide-react";

interface Insight {
  id: string;
  insightType: string;
  insightText: string;
  dataPoints: number;
  generatedAt: string;
}

export default function InsightsPage() {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      if (res.ok) {
        await fetchInsights();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to generate insights");
      }
    } catch (error) {
      console.error("Generate failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const niche = (session?.user as { niche?: string })?.niche;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Niche Insights</h1>
          <p className="mt-1 text-muted-foreground">
            AI-powered insights for {niche || "your niche"} — backed by real data from tracked
            creators.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Insights
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No insights yet</h2>
          <p className="mt-2 text-muted-foreground">
            Track some creators, analyze their posts, then generate insights to see what&apos;s
            working in your niche.
          </p>
          <Button className="mt-4 gap-2" onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" /> Generate Insights
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
