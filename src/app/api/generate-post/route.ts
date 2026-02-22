import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePost } from "@/lib/claude";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const posts = await prisma.generatedPost.findMany({
    where: { userId },
    orderBy: { generatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { platform, contentFormat, topic } = body;

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });
    }

    // Get user niche
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { niche: true },
    });

    if (!user?.niche) {
      return NextResponse.json(
        { error: "Please set your niche in Settings first" },
        { status: 400 }
      );
    }

    // Fetch insights for this user
    const insights = await prisma.nicheInsight.findMany({
      where: { userId },
      orderBy: { generatedAt: "desc" },
      take: 10,
    });

    if (insights.length === 0) {
      return NextResponse.json(
        { error: "No insights available. Generate insights first by analyzing posts." },
        { status: 400 }
      );
    }

    // Generate post using Claude
    const result = await generatePost(
      user.niche,
      platform,
      insights.map((i) => ({
        insightType: i.insightType,
        insightText: i.insightText,
      })),
      { contentFormat, topic }
    );

    // Save to database
    const saved = await prisma.generatedPost.create({
      data: {
        userId,
        platform,
        contentFormat: result.suggestedFormat || contentFormat,
        caption: result.caption,
        hashtags: result.hashtags,
        formatTips: result.formatTips,
        postingTips: result.postingTips,
        topic: topic || null,
      },
    });

    return NextResponse.json({ post: { ...result, id: saved.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate post";
    console.error("Generate post error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
