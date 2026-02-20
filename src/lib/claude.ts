import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzePost(caption: string, postType: string, engagementRate: number, platform: string) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze this ${platform} ${postType} post. Return JSON only, no markdown.

Caption: "${caption}"
Engagement Rate: ${engagementRate.toFixed(2)}%
Format: ${postType}

Return this exact JSON structure:
{
  "hookType": "question|bold_statement|story|statistic|controversial|how_to|listicle|behind_the_scenes|other",
  "contentFormat": "description of the content format and style",
  "topic": "main topic/theme",
  "whyItWorked": "2-3 sentence explanation of why this post performed well",
  "sentiment": "positive|negative|neutral|inspirational|educational|entertaining",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"]
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse analysis response");
  }
}

export async function generateNicheInsights(
  niche: string,
  postsData: { caption: string; postType: string; engagementRate: number; hookType?: string; platform: string }[]
) {
  const summary = postsData
    .map(
      (p, i) =>
        `${i + 1}. [${p.platform}/${p.postType}] Hook: ${p.hookType || "unknown"} | ER: ${p.engagementRate.toFixed(2)}% | "${p.caption?.slice(0, 100)}..."`
    )
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a social media analyst. Analyze these ${postsData.length} posts from the "${niche}" niche and generate actionable insights.

Posts:
${summary}

Return a JSON array of insights. Each insight should have:
{
  "insightType": "format|timing|hook|topic|engagement",
  "insightText": "Clear, actionable insight with specific data (e.g., 'Carousel posts get 2.3x more engagement than static posts in your niche')",
  "dataPoints": number_of_posts_supporting_this
}

Generate 5-8 insights. Be specific with numbers and percentages. JSON array only, no markdown.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse insights response");
  }
}
