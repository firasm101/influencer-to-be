"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, ArrowLeft, Instagram, Check } from "lucide-react";
import { NICHES } from "@/types";

type Platform = "instagram" | "tiktok";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [socialHandle, setSocialHandle] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
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
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Set Up Your Profile</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  What&apos;s your niche?
                </Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Pick the category that best describes your content.
                </p>
                <div className="flex flex-wrap gap-2">
                  {NICHES.map((n) => (
                    <Badge
                      key={n}
                      variant={niche === n ? "default" : "outline"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => setNiche(n)}
                    >
                      {niche === n && <Check className="mr-1 h-3 w-3" />}
                      {n}
                    </Badge>
                  ))}
                  <Badge
                    variant={niche === "Other" ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => setNiche("Other")}
                  >
                    {niche === "Other" && <Check className="mr-1 h-3 w-3" />}
                    Other
                  </Badge>
                </div>
                {niche === "Other" && (
                  <Input
                    className="mt-3"
                    placeholder="Enter your niche..."
                    value={customNiche}
                    onChange={(e) => setCustomNiche(e.target.value)}
                  />
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!niche || (niche === "Other" && !customNiche)}
                  className="gap-2"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  Which platforms do you want to analyze?
                </Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  Select one or both platforms.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => togglePlatform("instagram")}
                    className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-colors ${
                      platforms.includes("instagram")
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Instagram className="h-10 w-10" />
                    <span className="font-medium">Instagram</span>
                  </button>
                  <button
                    onClick={() => togglePlatform("tiktok")}
                    className={`flex flex-col items-center gap-3 rounded-lg border-2 p-6 transition-colors ${
                      platforms.includes("tiktok")
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <svg
                      className="h-10 w-10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
                    </svg>
                    <span className="font-medium">TikTok</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={platforms.length === 0}
                  className="gap-2"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">
                  Your social media handle (optional)
                </Label>
                <p className="mb-4 text-sm text-muted-foreground">
                  We&apos;ll use this to personalize your experience. You can
                  skip this step.
                </p>
                <Input
                  placeholder="@yourusername"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                />
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">Your selections:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {niche === "Other" ? customNiche : niche}
                  </Badge>
                  {platforms.map((p) => (
                    <Badge key={p} variant="secondary" className="capitalize">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? "Setting up..." : "Start Analyzing"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
