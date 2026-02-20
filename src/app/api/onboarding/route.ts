import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { niche, platforms, socialHandle } = await req.json();
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      niche,
      platforms,
      socialHandle: socialHandle || null,
      onboarded: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
