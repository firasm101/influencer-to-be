"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Instagram,
  Linkedin,
  Lightbulb,
  FileText,
  Clock,
} from "lucide-react";
import type { GeneratedPostData } from "@/types";

interface PostBuilderProps {
  hasInsights: boolean;
}

export function PostBuilder({ hasInsights }: PostBuilderProps) {
  const [platform, setPlatform] = useState("");
  const [contentFormat, setContentFormat] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPostData | null>(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!platform) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          contentFormat: contentFormat || undefined,
          topic: topic || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.post);
      setEditedCaption(data.post.caption);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate post");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const hashtagStr = result.hashtags.map((h) => `#${h}`).join(" ");
    const fullText = `${editedCaption}\n\n${hashtagStr}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate a Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform *</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <span className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" /> Instagram
                    </span>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
                      </svg>{" "}
                      TikTok
                    </span>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <span className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Content Format</Label>
              <Select value={contentFormat} onValueChange={setContentFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Any format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reel">Reel / Short Video</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="static">Static Image</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="article">Article / Long Post</SelectItem>
                  <SelectItem value="document">Document / PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Angle</Label>
              <Input
                id="topic"
                placeholder="e.g. morning routine"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleGenerate}
            disabled={!platform || !hasInsights || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Post
              </>
            )}
          </Button>

          {!hasInsights && (
            <p className="text-sm text-muted-foreground">
              You need to generate insights first. Go to the Insights page to analyze posts in your
              niche.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Caption - takes 2 cols */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Caption</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy All
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="min-h-[200px] resize-y"
              />
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips - right column */}
          <div className="space-y-4">
            {result.suggestedFormat && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <FileText className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium">Suggested Format</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {result.suggestedFormat}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result.formatTips && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <Lightbulb className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-sm font-medium">Format Tips</p>
                    <p className="text-sm text-muted-foreground">{result.formatTips}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {result.postingTips && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <Clock className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium">Posting Tips</p>
                    <p className="text-sm text-muted-foreground">{result.postingTips}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
