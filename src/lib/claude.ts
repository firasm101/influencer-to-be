import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedPostData } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzePost(
  caption: string,
  postType: string,
  engagementRate: number,
  platform: string
) {
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
  postsData: {
    caption: string;
    postType: string;
    engagementRate: number;
    hookType?: string;
    platform: string;
  }[]
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

export async function generatePost(
  niche: string,
  platform: string,
  insights: { insightType: string; insightText: string }[],
  preferences?: { contentFormat?: string; topic?: string }
): Promise<GeneratedPostData> {
  const insightsSummary = insights
    .map((ins, i) => `${i + 1}. [${ins.insightType}] ${ins.insightText}`)
    .join("\n");

  const formatHint = preferences?.contentFormat
    ? `\nPreferred content format: ${preferences.contentFormat}`
    : "";
  const topicHint = preferences?.topic
    ? `\nTopic/angle the user wants to cover: ${preferences.topic}`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an expert social media content creator. Generate a high-performing ${platform} post for the "${niche}" niche.

Use these data-driven insights about what works in this niche:
${insightsSummary}
${formatHint}${topicHint}

Return JSON only, no markdown. Use this exact structure:
{
  "caption": "The full post caption including a strong hook in the first line. Use line breaks for readability. Include a call-to-action at the end.",
  "hashtags": ["hashtag1", "hashtag2", "...up to 15 relevant hashtags without the # symbol"],
  "formatTips": "Specific tips for how to format/present this post visually (e.g., carousel slide breakdown, reel structure, image composition)",
  "postingTips": "Best practices for posting this content (timing, engagement strategy, stories cross-promotion)",
  "suggestedFormat": "reel|carousel|static|story|video"
}

Make the caption authentic, engaging, and optimized for the ${platform} algorithm. The hook should stop the scroll.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse generated post response");
  }
}
