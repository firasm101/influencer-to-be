import { analyzeUnanalyzedPosts, generateInsightsForUser } from "../analysis";
import { prisma } from "../db";
import * as claude from "../claude";

jest.mock("../db", () => ({
  prisma: {
    post: { findMany: jest.fn() },
    postAnalysis: { create: jest.fn() },
    user: { findUnique: jest.fn() },
    nicheInsight: { deleteMany: jest.fn(), createMany: jest.fn() },
  },
}));

jest.mock("../claude", () => ({
  analyzePost: jest.fn(),
  generateNicheInsights: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockClaude = claude as jest.Mocked<typeof claude>;

describe("Analysis Orchestration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeUnanalyzedPosts", () => {
    it("should find unanalyzed posts and analyze them", async () => {
      const mockPosts = [
        {
          id: "post-1",
          caption: "Great fitness tip!",
          postType: "carousel",
          engagementRate: 5.5,
          platform: "instagram",
          creator: { userId: "user-1" },
        },
        {
          id: "post-2",
          caption: "Check this out!",
          postType: "reel",
          engagementRate: 8.0,
          platform: "instagram",
          creator: { userId: "user-1" },
        },
      ];

      (mockPrisma.post.findMany as jest.Mock).mockResolvedValueOnce(mockPosts);

      const mockAnalysis = {
        hookType: "question",
        contentFormat: "Carousel",
        topic: "Fitness",
        whyItWorked: "Good hook",
        sentiment: "educational",
        keyTakeaways: ["tip1", "tip2"],
      };

      (mockClaude.analyzePost as jest.Mock).mockResolvedValue(mockAnalysis);
      (mockPrisma.postAnalysis.create as jest.Mock).mockResolvedValue({ id: "analysis-1" });

      const results = await analyzeUnanalyzedPosts("user-1");

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { creator: { userId: "user-1" }, analysis: null },
          take: 10,
        })
      );
      expect(mockClaude.analyzePost).toHaveBeenCalledTimes(2);
      expect(mockPrisma.postAnalysis.create).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
    });

    it("should continue analyzing other posts when one fails", async () => {
      const mockPosts = [
        {
          id: "p1",
          caption: "Post 1",
          postType: "reel",
          engagementRate: 3.0,
          platform: "instagram",
          creator: { userId: "u1" },
        },
        {
          id: "p2",
          caption: "Post 2",
          postType: "static",
          engagementRate: 2.0,
          platform: "instagram",
          creator: { userId: "u1" },
        },
      ];

      (mockPrisma.post.findMany as jest.Mock).mockResolvedValueOnce(mockPosts);

      (mockClaude.analyzePost as jest.Mock)
        .mockRejectedValueOnce(new Error("Claude API error"))
        .mockResolvedValueOnce({
          hookType: "story",
          contentFormat: "Image",
          topic: "Life",
          whyItWorked: "Relatable",
          sentiment: "positive",
          keyTakeaways: ["be real"],
        });

      (mockPrisma.postAnalysis.create as jest.Mock).mockResolvedValue({ id: "a1" });

      const results = await analyzeUnanalyzedPosts("u1");

      expect(results).toHaveLength(1); // Only second post succeeded
    });

    it("should return empty array when no unanalyzed posts exist", async () => {
      (mockPrisma.post.findMany as jest.Mock).mockResolvedValueOnce([]);

      const results = await analyzeUnanalyzedPosts("user-1");
      expect(results).toHaveLength(0);
    });
  });

  describe("generateInsightsForUser", () => {
    it("should generate insights and save them to database", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: "Fitness & Health",
      });

      const mockPosts = Array.from({ length: 5 }, (_, i) => ({
        id: `post-${i}`,
        caption: `Post ${i}`,
        postType: "carousel",
        engagementRate: 3 + i,
        platform: "instagram",
        analysis: { hookType: "question" },
      }));

      (mockPrisma.post.findMany as jest.Mock).mockResolvedValueOnce(mockPosts);

      const mockInsights = [
        { insightType: "format", insightText: "Carousels perform best", dataPoints: 5 },
        { insightType: "hook", insightText: "Questions drive engagement", dataPoints: 3 },
      ];

      (mockClaude.generateNicheInsights as jest.Mock).mockResolvedValueOnce(mockInsights);
      (mockPrisma.nicheInsight.deleteMany as jest.Mock).mockResolvedValueOnce({});
      (mockPrisma.nicheInsight.createMany as jest.Mock).mockResolvedValueOnce({ count: 2 });

      const result = await generateInsightsForUser("user-1");

      expect(mockPrisma.nicheInsight.deleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
      expect(mockPrisma.nicheInsight.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: "user-1", insightType: "format" }),
        ]),
      });
      expect(result).toEqual({ count: 2 });
    });

    it("should throw error when user has no niche", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: null,
      });

      await expect(generateInsightsForUser("user-1")).rejects.toThrow("User has no niche set");
    });

    it("should throw error when fewer than 3 analyzed posts", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: "Fitness",
      });

      (mockPrisma.post.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: "p1",
          caption: "Post",
          postType: "reel",
          engagementRate: 5,
          platform: "instagram",
          analysis: {},
        },
      ]);

      await expect(generateInsightsForUser("user-1")).rejects.toThrow(
        "Need at least 3 analyzed posts"
      );
    });
  });
});
