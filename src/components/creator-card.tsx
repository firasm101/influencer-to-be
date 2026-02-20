"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Instagram, UserPlus, UserMinus, Users } from "lucide-react";

interface CreatorCardProps {
  creator: {
    handle: string;
    displayName?: string | null;
    platform: string;
    followerCount: number;
    bio?: string | null;
    avatarUrl?: string | null;
  };
  tracked?: boolean;
  onTrack?: () => void;
  onUntrack?: () => void;
  loading?: boolean;
}

function formatFollowers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function CreatorCard({
  creator,
  tracked,
  onTrack,
  onUntrack,
  loading,
}: CreatorCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={creator.avatarUrl || ""} />
          <AvatarFallback>
            {creator.handle[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {creator.displayName || creator.handle}
            </span>
            {creator.platform === "instagram" ? (
              <Instagram className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <svg
                className="h-3.5 w-3.5 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{creator.handle}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            {formatFollowers(creator.followerCount)} followers
          </div>
          {creator.bio && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
              {creator.bio}
            </p>
          )}
        </div>
        <div>
          {tracked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onUntrack}
              disabled={loading}
              className="gap-1"
            >
              <UserMinus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Untrack</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onTrack}
              disabled={loading}
              className="gap-1"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Track</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
