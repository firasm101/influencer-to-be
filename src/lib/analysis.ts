import { prisma } from "./db";
import { analyzePost, generateNicheInsights } from "./claude";

export async function analyzeUnanalyzedPosts(userId: string) {
  const posts = await prisma.post.findMany({
    where: {
      creator: { userId },
      analysis: null,
    },
    include: { creator: true },
    take: 10,
  });

  const results = [];
  for (const post of posts) {
    try {
      const analysis = await analyzePost(
        post.caption || "",
        post.postType,
        post.engagementRate,
        post.platform
      );

      const saved = await prisma.postAnalysis.create({
        data: {
          postId: post.id,
          hookType: analysis.hookType,
          contentFormat: analysis.contentFormat,
          topic: analysis.topic,
          whyItWorked: analysis.whyItWorked,
          sentiment: analysis.sentiment,
          keyTakeaways: analysis.keyTakeaways || [],
        },
      });
      results.push(saved);
    } catch (error) {
      console.error(`Failed to analyze post ${post.id}:`, error);
    }
  }

  return results;
}

export async function generateInsightsForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.niche) throw new Error("User has no niche set");

  const posts = await prisma.post.findMany({
    where: {
      creator: { userId },
      analysis: { isNot: null },
    },
    include: { analysis: true },
    orderBy: { engagementRate: "desc" },
    take: 50,
  });

  if (posts.length < 3) {
    throw new Error("Need at least 3 analyzed posts to generate insights");
  }

  const postsData = posts.map((p) => ({
    caption: p.caption || "",
    postType: p.postType,
    engagementRate: p.engagementRate,
    hookType: p.analysis?.hookType || undefined,
    platform: p.platform,
  }));

  const insights = await generateNicheInsights(user.niche, postsData);

  // Clear old insights
  await prisma.nicheInsight.deleteMany({ where: { userId } });

  // Save new insights
  const saved = await prisma.nicheInsight.createMany({
    data: insights.map(
      (insight: { insightType: string; insightText: string; dataPoints: number }) => ({
        userId,
        insightType: insight.insightType,
        insightText: insight.insightText,
        dataPoints: insight.dataPoints || 0,
      })
    ),
  });

  return saved;
}
