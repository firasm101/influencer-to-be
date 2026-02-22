/**
 * API Route Tests
 * Tests authentication guards, request/response handling, and business logic
 * for all API endpoints.
 */

// Mock NextResponse and NextRequest before any route imports
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(body),
      headers: new Map(),
    }),
  },
  NextRequest: class {
    body: unknown;
    url: string;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.url = url;
      this.body = init?.body ? JSON.parse(init.body) : {};
    }
    json() {
      return Promise.resolve(this.body);
    }
  },
}));

// Mock dependencies before imports
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

jest.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    trackedCreator: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: { upsert: jest.fn() },
    nicheInsight: { findMany: jest.fn() },
    generatedPost: { findMany: jest.fn(), create: jest.fn() },
  },
}));

jest.mock("@/lib/social/instagram", () => ({
  searchInstagramCreators: jest.fn(),
  fetchInstagramPosts: jest.fn(),
}));

jest.mock("@/lib/social/tiktok", () => ({
  searchTikTokCreators: jest.fn(),
  fetchTikTokPosts: jest.fn(),
}));

jest.mock("@/lib/analysis", () => ({
  analyzeUnanalyzedPosts: jest.fn(),
  generateInsightsForUser: jest.fn(),
}));

jest.mock("@/lib/claude", () => ({
  generatePost: jest.fn(),
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { searchInstagramCreators } from "@/lib/social/instagram";
import { searchTikTokCreators } from "@/lib/social/tiktok";
import { fetchInstagramPosts } from "@/lib/social/instagram";
import { analyzeUnanalyzedPosts } from "@/lib/analysis";
import { generateInsightsForUser } from "@/lib/analysis";
import { generatePost } from "@/lib/claude";

const mockGetSession = getServerSession as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Helper to create mock Request
function mockRequest(body?: Record<string, unknown>, url?: string) {
  return {
    json: () => Promise.resolve(body || {}),
    url: url || "http://localhost:3000/api/test",
  } as unknown as Request;
}

describe("API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // DISCOVER ROUTE
  // ============================================================
  describe("GET /api/discover", () => {
    let handler: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

    beforeAll(async () => {
      const mod = await import("@/app/api/discover/route");
      handler = mod.GET as typeof handler;
    });

    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const response = await handler();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 400 when user has no niche", async () => {
      mockGetSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: null,
        platforms: [],
      });

      const response = await handler();
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No niche set");
    });

    it("should search Instagram creators when platform includes instagram", async () => {
      mockGetSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: "Fitness & Health",
        platforms: ["instagram"],
      });
      (searchInstagramCreators as jest.Mock).mockResolvedValueOnce([
        { handle: "fit_pro", platform: "instagram", followerCount: 100000 },
      ]);

      const response = await handler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect((data.creators as unknown[]).length).toBe(1);
      expect(searchInstagramCreators).toHaveBeenCalledWith("Fitness & Health");
    });

    it("should search both platforms when user has both", async () => {
      mockGetSession.mockResolvedValueOnce({
        user: { id: "user-1" },
      });
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: "Gaming",
        platforms: ["instagram", "tiktok"],
      });
      (searchInstagramCreators as jest.Mock).mockResolvedValueOnce([
        { handle: "ig_gamer", platform: "instagram" },
      ]);
      (searchTikTokCreators as jest.Mock).mockResolvedValueOnce([
        { handle: "tt_gamer", platform: "tiktok" },
      ]);

      const response = await handler();
      const data = await response.json();

      expect((data.creators as unknown[]).length).toBe(2);
      expect(searchInstagramCreators).toHaveBeenCalled();
      expect(searchTikTokCreators).toHaveBeenCalled();
    });
  });

  // ============================================================
  // CREATORS ROUTE
  // ============================================================
  describe("/api/creators", () => {
    let GET: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;
    let POST: (
      req: Request
    ) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;
    let DELETE: (
      req: Request
    ) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

    beforeAll(async () => {
      const mod = await import("@/app/api/creators/route");
      GET = mod.GET as typeof GET;
      POST = mod.POST as typeof POST;
      DELETE = mod.DELETE as typeof DELETE;
    });

    describe("GET", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await GET();
        expect(response.status).toBe(401);
      });

      it("should return tracked creators with posts", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.trackedCreator.findMany as jest.Mock).mockResolvedValueOnce([
          { id: "c1", handle: "creator1", platform: "instagram", posts: [] },
        ]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect((data.creators as unknown[]).length).toBe(1);
      });
    });

    describe("POST", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await POST(mockRequest({}));
        expect(response.status).toBe(401);
      });

      it("should create tracked creator and fetch posts", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.trackedCreator.upsert as jest.Mock).mockResolvedValueOnce({
          id: "creator-1",
        });
        (fetchInstagramPosts as jest.Mock).mockResolvedValueOnce([
          {
            externalId: "post1",
            platform: "instagram",
            postType: "reel",
            caption: "Test",
            mediaUrl: "",
            thumbnailUrl: "",
            likes: 1000,
            comments: 100,
            shares: 50,
            views: 10000,
            postedAt: "2024-01-01T00:00:00.000Z",
            engagementRate: 5.0,
          },
        ]);
        (mockPrisma.post.upsert as jest.Mock).mockResolvedValue({});
        (mockPrisma.trackedCreator.update as jest.Mock).mockResolvedValue({});

        const response = await POST(
          mockRequest({
            handle: "test_creator",
            platform: "instagram",
            displayName: "Test Creator",
            followerCount: 50000,
            bio: "Test bio",
            avatarUrl: "https://example.com/avatar.jpg",
            cid: "INST:12345",
          })
        );

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.postsAdded).toBe(1);
        expect(fetchInstagramPosts).toHaveBeenCalledWith("test_creator", "INST:12345");
      });

      it("should calculate engagement rate from follower count", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.trackedCreator.upsert as jest.Mock).mockResolvedValueOnce({ id: "c1" });
        (fetchInstagramPosts as jest.Mock).mockResolvedValueOnce([
          {
            externalId: "p1",
            platform: "instagram",
            postType: "static",
            caption: "",
            mediaUrl: "",
            thumbnailUrl: "",
            likes: 500,
            comments: 50,
            shares: 25,
            views: 0,
            postedAt: null,
            engagementRate: 0,
          },
        ]);
        (mockPrisma.post.upsert as jest.Mock).mockResolvedValue({});
        (mockPrisma.trackedCreator.update as jest.Mock).mockResolvedValue({});

        await POST(
          mockRequest({
            handle: "test",
            platform: "instagram",
            followerCount: 10000,
          })
        );

        // (500 + 50 + 25) / 10000 * 100 = 5.75%
        expect(mockPrisma.post.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({
              engagementRate: 5.75,
            }),
          })
        );
      });
    });

    describe("DELETE", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await DELETE(mockRequest());
        expect(response.status).toBe(401);
      });

      it("should return 400 when no id provided", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        const response = await DELETE(mockRequest({}, "http://localhost:3000/api/creators"));
        const data = await response.json();
        expect(response.status).toBe(400);
        expect(data.error).toBe("Missing id");
      });

      it("should delete creator by id", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.trackedCreator.delete as jest.Mock).mockResolvedValueOnce({});

        const response = await DELETE(
          mockRequest({}, "http://localhost:3000/api/creators?id=creator-1")
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockPrisma.trackedCreator.delete).toHaveBeenCalledWith({
          where: { id: "creator-1" },
        });
      });
    });
  });

  // ============================================================
  // ONBOARDING ROUTE
  // ============================================================
  describe("POST /api/onboarding", () => {
    let handler: (
      req: Request
    ) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

    beforeAll(async () => {
      const mod = await import("@/app/api/onboarding/route");
      handler = mod.POST as typeof handler;
    });

    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const response = await handler(mockRequest());
      expect(response.status).toBe(401);
    });

    it("should update user with onboarding data", async () => {
      mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
      (mockPrisma.user.update as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        niche: "Fitness & Health",
        platforms: ["instagram", "tiktok"],
        onboarded: true,
      });

      const response = await handler(
        mockRequest({
          niche: "Fitness & Health",
          platforms: ["instagram", "tiktok"],
          socialHandle: "@myhandle",
        })
      );

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: {
          niche: "Fitness & Health",
          platforms: ["instagram", "tiktok"],
          socialHandle: "@myhandle",
          onboarded: true,
        },
      });
    });
  });

  // ============================================================
  // ANALYZE ROUTE
  // ============================================================
  describe("POST /api/analyze", () => {
    let handler: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

    beforeAll(async () => {
      const mod = await import("@/app/api/analyze/route");
      handler = mod.POST as typeof handler;
    });

    it("should return 401 when not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const response = await handler();
      expect(response.status).toBe(401);
    });

    it("should analyze posts and return count", async () => {
      mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
      (analyzeUnanalyzedPosts as jest.Mock).mockResolvedValueOnce([{}, {}, {}]);

      const response = await handler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analyzed).toBe(3);
    });

    it("should return 500 when analysis fails", async () => {
      mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
      (analyzeUnanalyzedPosts as jest.Mock).mockRejectedValueOnce(new Error("Claude API down"));

      const response = await handler();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Analysis failed");
    });
  });

  // ============================================================
  // INSIGHTS ROUTE
  // ============================================================
  describe("/api/insights", () => {
    let GET: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;
    let POST: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

    beforeAll(async () => {
      const mod = await import("@/app/api/insights/route");
      GET = mod.GET as typeof GET;
      POST = mod.POST as typeof POST;
    });

    describe("GET", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await GET();
        expect(response.status).toBe(401);
      });

      it("should return user insights", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.nicheInsight.findMany as jest.Mock).mockResolvedValueOnce([
          { insightType: "format", insightText: "Carousels work best", dataPoints: 10 },
        ]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect((data.insights as unknown[]).length).toBe(1);
      });
    });

    describe("POST", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await POST();
        expect(response.status).toBe(401);
      });

      it("should generate and return insight count", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (generateInsightsForUser as jest.Mock).mockResolvedValueOnce({ count: 5 });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.generated).toBe(5);
      });

      it("should return 500 with error message on failure", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (generateInsightsForUser as jest.Mock).mockRejectedValueOnce(
          new Error("Need at least 3 analyzed posts to generate insights")
        );

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Need at least 3 analyzed posts to generate insights");
      });
    });
  });

  // ============================================================
  // GENERATE-POST ROUTE
  // ============================================================
  describe("/api/generate-post", () => {
    let GET: () => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;
    let POST: (
      req: unknown
    ) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>;

    beforeAll(async () => {
      const mod = await import("@/app/api/generate-post/route");
      GET = mod.GET as typeof GET;
      POST = mod.POST as typeof POST;
    });

    describe("GET", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await GET();
        expect(response.status).toBe(401);
      });

      it("should return generated posts", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.generatedPost.findMany as jest.Mock).mockResolvedValueOnce([
          { id: "gp1", caption: "Test post", hashtags: ["test"] },
        ]);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect((data.posts as unknown[]).length).toBe(1);
      });
    });

    describe("POST", () => {
      it("should return 401 when not authenticated", async () => {
        mockGetSession.mockResolvedValueOnce(null);
        const response = await POST(mockRequest({ platform: "instagram" }));
        expect(response.status).toBe(401);
      });

      it("should return 400 when platform is missing", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        const response = await POST(mockRequest({}));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Platform is required");
      });

      it("should return 400 when user has no niche", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ niche: null });

        const response = await POST(mockRequest({ platform: "instagram" }));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe("Please set your niche in Settings first");
      });

      it("should return 400 when no insights available", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
          niche: "Fitness & Health",
        });
        (mockPrisma.nicheInsight.findMany as jest.Mock).mockResolvedValueOnce([]);

        const response = await POST(mockRequest({ platform: "instagram" }));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(
          "No insights available. Generate insights first by analyzing posts."
        );
      });

      it("should generate post and save to database", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
          niche: "Fitness & Health",
        });
        (mockPrisma.nicheInsight.findMany as jest.Mock).mockResolvedValueOnce([
          { insightType: "format", insightText: "Carousels work best" },
          { insightType: "hook", insightText: "Questions get 2x engagement" },
        ]);
        (generatePost as jest.Mock).mockResolvedValueOnce({
          caption: "Test caption with hook",
          hashtags: ["fitness", "health"],
          formatTips: "Use carousel slides",
          postingTips: "Post at 9am",
          suggestedFormat: "carousel",
        });
        (mockPrisma.generatedPost.create as jest.Mock).mockResolvedValueOnce({
          id: "gp-1",
        });

        const response = await POST(
          mockRequest({ platform: "instagram", topic: "morning routine" })
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect((data.post as { caption: string }).caption).toBe("Test caption with hook");
        expect((data.post as { id: string }).id).toBe("gp-1");
        expect(generatePost).toHaveBeenCalledWith(
          "Fitness & Health",
          "instagram",
          [
            { insightType: "format", insightText: "Carousels work best" },
            { insightType: "hook", insightText: "Questions get 2x engagement" },
          ],
          { contentFormat: undefined, topic: "morning routine" }
        );
        expect(mockPrisma.generatedPost.create).toHaveBeenCalled();
      });

      it("should return 500 when generation fails", async () => {
        mockGetSession.mockResolvedValueOnce({ user: { id: "user-1" } });
        (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
          niche: "Fitness & Health",
        });
        (mockPrisma.nicheInsight.findMany as jest.Mock).mockResolvedValueOnce([
          { insightType: "format", insightText: "test insight" },
        ]);
        (generatePost as jest.Mock).mockRejectedValueOnce(new Error("Claude API error"));

        const response = await POST(mockRequest({ platform: "instagram" }));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe("Claude API error");
      });
    });
  });
});
