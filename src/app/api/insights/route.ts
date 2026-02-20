import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateInsightsForUser } from "@/lib/analysis";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const insights = await prisma.nicheInsight.findMany({
    where: { userId },
    orderBy: { generatedAt: "desc" },
  });

  return NextResponse.json({ insights });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const result = await generateInsightsForUser(userId);
    return NextResponse.json({ generated: result.count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate insights";
    console.error("Insights error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
