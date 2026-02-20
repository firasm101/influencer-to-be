import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { searchInstagramCreators } from "@/lib/social/instagram";
import { searchTikTokCreators } from "@/lib/social/tiktok";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.niche) {
    return NextResponse.json({ error: "No niche set" }, { status: 400 });
  }

  const results = [];

  if (user.platforms.includes("instagram")) {
    const igCreators = await searchInstagramCreators(user.niche);
    results.push(...igCreators);
  }

  if (user.platforms.includes("tiktok")) {
    const ttCreators = await searchTikTokCreators(user.niche);
    results.push(...ttCreators);
  }

  return NextResponse.json({ creators: results });
}
