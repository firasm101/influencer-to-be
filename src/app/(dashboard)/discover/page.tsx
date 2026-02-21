"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatorCard } from "@/components/creator-card";
import { Search, RefreshCw } from "lucide-react";

interface Creator {
  handle: string;
  displayName: string;
  platform: string;
  followerCount: number;
  bio: string;
  avatarUrl: string;
  cid?: string;
  avgER?: number;
  qualityScore?: number;
}

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [trackedHandles, setTrackedHandles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<string | null>(null);

  const fetchDiscovery = useCallback(async () => {
    setLoading(true);
    try {
      const [discoverRes, creatorsRes] = await Promise.all([
        fetch("/api/discover"),
        fetch("/api/creators"),
      ]);
      const discoverData = await discoverRes.json();
      const creatorsData = await creatorsRes.json();

      setCreators(discoverData.creators || []);
      const tracked = new Set(
        (creatorsData.creators || []).map(
          (c: { platform: string; handle: string }) =>
            `${c.platform}:${c.handle}`
        )
      );
      setTrackedHandles(tracked as Set<string>);
    } catch (error) {
      console.error("Discovery failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchDiscovery();
    }
  }, [session, fetchDiscovery]);

  const handleTrack = async (creator: Creator) => {
    const key = `${creator.platform}:${creator.handle}`;
    setTracking(key);
    try {
      await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creator),
      });
      setTrackedHandles((prev) => new Set([...prev, key]));
    } catch (error) {
      console.error("Track failed:", error);
    } finally {
      setTracking(null);
    }
  };

  const handleUntrack = async (creator: Creator) => {
    const key = `${creator.platform}:${creator.handle}`;
    setTracking(key);
    try {
      // We'd need the ID for deletion — for now just remove from UI
      setTrackedHandles((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } finally {
      setTracking(null);
    }
  };

  const niche = (session?.user as { niche?: string })?.niche;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discover Creators</h1>
          <p className="mt-1 text-muted-foreground">
            Top creators in {niche || "your niche"} — track them to analyze
            their content.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDiscovery}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No creators found</h2>
          <p className="mt-2 text-muted-foreground">
            Try refreshing or updating your niche in settings.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {creators.map((creator) => {
            const key = `${creator.platform}:${creator.handle}`;
            return (
              <CreatorCard
                key={key}
                creator={creator}
                tracked={trackedHandles.has(key)}
                onTrack={() => handleTrack(creator)}
                onUntrack={() => handleUntrack(creator)}
                loading={tracking === key}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
