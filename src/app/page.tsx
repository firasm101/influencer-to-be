"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Instagram,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">InfluencerToBe</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Crack the Algorithm.
            <br />
            <span className="text-primary">Grow Smarter.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            See what top creators in your niche are doing, understand WHY it
            works, and use AI-powered insights to beat the algorithm with
            intelligence — not guesswork.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href={session ? "/dashboard" : "/login"}>
              <Button size="lg" className="gap-2">
                Start Analyzing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Instagram className="h-4 w-4" /> Instagram
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15z" />
              </svg>{" "}
              TikTok
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need to grow
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Discover Top Creators"
              description="Find the best-performing creators in your niche. See who's winning and learn from their strategy."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="AI Content Analysis"
              description="Every post gets analyzed by AI — hook type, format, topic, and a clear explanation of why it performed well."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Actionable Insights"
              description="Get data-driven insights like 'Carousels get 2.3x more engagement in your niche' — backed by real numbers."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            Ready to stop guessing and start growing?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of aspiring creators using data to grow faster.
          </p>
          <Link href={session ? "/dashboard" : "/login"}>
            <Button size="lg" className="mt-8 gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} InfluencerToBe. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
