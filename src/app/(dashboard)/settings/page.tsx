"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NICHES } from "@/types";
import { Check, LogOut, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [socialHandle, setSocialHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const user = session.user as {
        niche?: string;
        platforms?: string[];
        socialHandle?: string;
      };
      const userNiche = user.niche || "";
      if (NICHES.includes(userNiche as (typeof NICHES)[number])) {
        setNiche(userNiche);
      } else if (userNiche) {
        setNiche("Other");
        setCustomNiche(userNiche);
      }
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche === "Other" ? customNiche : niche,
          platforms,
          socialHandle,
        }),
      });
      if (res.ok) {
        await update();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your niche and platform preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Niche</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <Badge
                  key={n}
                  variant={niche === n ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 text-xs"
                  onClick={() => setNiche(n)}
                >
                  {niche === n && <Check className="mr-1 h-3 w-3" />}
                  {n}
                </Badge>
              ))}
              <Badge
                variant={niche === "Other" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-xs"
                onClick={() => setNiche("Other")}
              >
                Other
              </Badge>
            </div>
            {niche === "Other" && (
              <Input
                className="mt-2"
                placeholder="Enter your niche..."
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Platforms</Label>
            <div className="mt-2 flex gap-3">
              {["instagram", "tiktok"].map((p) => (
                <Button
                  key={p}
                  variant={platforms.includes(p) ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePlatform(p)}
                  className="capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Social Handle</Label>
            <Input
              className="mt-2"
              placeholder="@yourusername"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !niche}
            className="gap-2"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Saved
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
