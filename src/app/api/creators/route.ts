import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchInstagramPosts } from "@/lib/social/instagram";
import { fetchTikTokPosts } from "@/lib/social/tiktok";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const creators = await prisma.trackedCreator.findMany({
    where: { userId },
    include: {
      posts: {
        include: { analysis: true },
        orderBy: { engagementRate: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ creators });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { handle, platform, displayName, followerCount, bio, avatarUrl } =
    await req.json();

  // Create or update tracked creator
  const creator = await prisma.trackedCreator.upsert({
    where: {
      userId_platform_handle: { userId, platform, handle },
    },
    update: { displayName, followerCount, bio, avatarUrl },
    create: {
      userId,
      platform,
      handle,
      displayName,
      followerCount,
      bio,
      avatarUrl,
    },
  });

  // Fetch posts for this creator
  const posts =
    platform === "instagram"
      ? await fetchInstagramPosts(handle)
      : await fetchTikTokPosts(handle);

  // Calculate engagement rate based on follower count
  const enrichedPosts = posts.map((p) => ({
    ...p,
    engagementRate:
      followerCount > 0
        ? ((p.likes + p.comments + p.shares) / followerCount) * 100
        : p.engagementRate,
  }));

  // Save posts
  for (const post of enrichedPosts) {
    await prisma.post.upsert({
      where: {
        platform_externalId: {
          platform: post.platform,
          externalId: post.externalId,
        },
      },
      update: {
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        engagementRate: post.engagementRate,
      },
      create: {
        creatorId: creator.id,
        platform: post.platform,
        postType: post.postType,
        caption: post.caption,
        mediaUrl: post.mediaUrl,
        thumbnailUrl: post.thumbnailUrl,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        postedAt: post.postedAt ? new Date(post.postedAt) : null,
        engagementRate: post.engagementRate,
        externalId: post.externalId,
      },
    });
  }

  // Update lastSynced
  await prisma.trackedCreator.update({
    where: { id: creator.id },
    data: { lastSynced: new Date() },
  });

  return NextResponse.json({ creator, postsAdded: enrichedPosts.length });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("id");
  if (!creatorId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.trackedCreator.delete({ where: { id: creatorId } });
  return NextResponse.json({ success: true });
}
