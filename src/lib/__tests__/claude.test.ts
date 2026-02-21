// The mockCreate fn must be declared before jest.mock so it gets hoisted
const mockCreate = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
  };
});

import { analyzePost, generateNicheInsights } from "../claude";

describe("Claude AI Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  describe("analyzePost", () => {
    it("should parse valid JSON response from Claude", async () => {
      const mockAnalysis = {
        hookType: "question",
        contentFormat: "Carousel with text overlays",
        topic: "Fitness tips",
        whyItWorked: "The question hook drives engagement. The listicle format is easy to consume.",
        sentiment: "educational",
        keyTakeaways: ["Use question hooks", "Keep tips actionable", "Use carousel format"],
      };

      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(mockAnalysis) }],
      });

      const result = await analyzePost(
        "5 things I wish I knew about fitness",
        "carousel",
        4.5,
        "instagram"
      );

      expect(result).toEqual(mockAnalysis);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
        })
      );
    });

    it("should extract JSON from markdown-wrapped response", async () => {
      const mockAnalysis = {
        hookType: "bold_statement",
        contentFormat: "Short-form video",
        topic: "Morning routine",
        whyItWorked: "Bold claims generate curiosity.",
        sentiment: "inspirational",
        keyTakeaways: ["Be bold", "Show results"],
      };

      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "```json\n" + JSON.stringify(mockAnalysis) + "\n```" }],
      });

      const result = await analyzePost("This changed my life", "reel", 8.2, "instagram");

      expect(result.hookType).toBe("bold_statement");
    });

    it("should throw error when response is not parseable", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "This is not JSON at all" }],
      });

      await expect(
        analyzePost("Some caption", "static", 2.0, "instagram")
      ).rejects.toThrow("Failed to parse analysis response");
    });

    it("should include platform and post type in prompt", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: '{"hookType":"other","contentFormat":"","topic":"","whyItWorked":"","sentiment":"neutral","keyTakeaways":[]}' }],
      });

      await analyzePost("Test caption", "video", 3.0, "tiktok");

      const callArgs = mockCreate.mock.calls[0][0];
      const prompt = callArgs.messages[0].content;
      expect(prompt).toContain("tiktok");
      expect(prompt).toContain("video");
      expect(prompt).toContain("3.00%");
    });
  });

  describe("generateNicheInsights", () => {
    it("should generate insights from posts data", async () => {
      const mockInsights = [
        { insightType: "format", insightText: "Carousel posts get 2.3x more engagement", dataPoints: 15 },
        { insightType: "hook", insightText: "Question hooks outperform statements by 40%", dataPoints: 8 },
        { insightType: "timing", insightText: "Posts between 8-10am get highest engagement", dataPoints: 20 },
      ];

      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: JSON.stringify(mockInsights) }],
      });

      const postsData = [
        { caption: "Post 1", postType: "carousel", engagementRate: 5.0, hookType: "question", platform: "instagram" },
        { caption: "Post 2", postType: "reel", engagementRate: 8.0, hookType: "bold_statement", platform: "instagram" },
        { caption: "Post 3", postType: "static", engagementRate: 2.0, hookType: "story", platform: "instagram" },
      ];

      const result = await generateNicheInsights("Fitness & Health", postsData);

      expect(result).toHaveLength(3);
      expect(result[0].insightType).toBe("format");
      expect(result[0].dataPoints).toBe(15);
    });

    it("should include niche name and post count in prompt", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "[]" }],
      });

      const postsData = [
        { caption: "Test", postType: "reel", engagementRate: 5.0, platform: "tiktok" },
      ];

      await generateNicheInsights("Gaming", postsData);

      const callArgs = mockCreate.mock.calls[0][0];
      const prompt = callArgs.messages[0].content;
      expect(prompt).toContain("Gaming");
      expect(prompt).toContain("1 posts");
    });

    it("should throw error when response is not parseable", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Not valid JSON array" }],
      });

      await expect(
        generateNicheInsights("Travel", [
          { caption: "Test", postType: "reel", engagementRate: 5.0, platform: "instagram" },
        ])
      ).rejects.toThrow("Failed to parse insights response");
    });
  });
});
