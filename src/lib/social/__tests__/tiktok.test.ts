import axios from "axios";
import { searchTikTokCreators, fetchTikTokPosts } from "../tiktok";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TikTok Scraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAPIDAPI_KEY = "test-api-key";
  });

  describe("searchTikTokCreators", () => {
    it("should search with socialTypes=TT and return mapped creators", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: [
            {
              cid: "TT:55555",
              socialType: "TT",
              screenName: "dance_queen",
              name: "Dance Queen",
              image: "https://example.com/tt-avatar.jpg",
              usersCount: 2000000,
              avgER: 0.08,
              qualityScore: 0.95,
            },
          ],
        },
      });

      const results = await searchTikTokCreators("Comedy & Entertainment");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://instagram-statistics-api.p.rapidapi.com/search",
        expect.objectContaining({
          params: expect.objectContaining({
            socialTypes: "TT",
            tags: "humor-and-fun-and-happiness",
          }),
        })
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        handle: "dance_queen",
        displayName: "Dance Queen",
        platform: "tiktok",
        followerCount: 2000000,
        bio: "",
        avatarUrl: "https://example.com/tt-avatar.jpg",
        cid: "TT:55555",
        avgER: 0.08,
        qualityScore: 0.95,
      });
    });

    it("should return mock creators on API failure", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Timeout"));

      const results = await searchTikTokCreators("Gaming");

      expect(results).toHaveLength(10);
      expect(results[0].platform).toBe("tiktok");
      expect(results[0].bio).toContain("Gaming");
    });

    it("should fallback to query search when tags return no results", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { meta: { code: 200 }, data: [] },
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200 },
          data: [
            {
              cid: "TT:1",
              screenName: "gamer1",
              name: "Gamer One",
              image: "",
              usersCount: 10000,
              avgER: 0.05,
              qualityScore: 0.6,
            },
          ],
        },
      });

      const results = await searchTikTokCreators("Gaming");

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(1);
      expect(results[0].platform).toBe("tiktok");
    });
  });

  describe("fetchTikTokPosts", () => {
    it("should fetch posts with cid and map all fields correctly", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200 },
          data: {
            posts: [
              {
                socialPostID: "tt_post_1",
                postID: "7891011",
                postImage: "https://example.com/thumb.jpg",
                videoLink: "https://example.com/video.mp4",
                text: "Wait for it... #fyp #viral",
                likes: 50000,
                comments: 3000,
                rePosts: 10000,
                videoViews: 500000,
                views: null,
                date: "2024-02-01T12:00:00.000Z",
                type: "video",
                er: 0.126,
              },
            ],
          },
        },
      });

      const posts = await fetchTikTokPosts("dance_queen", "TT:55555");

      expect(posts).toHaveLength(1);
      expect(posts[0]).toMatchObject({
        externalId: "tt_post_1",
        platform: "tiktok",
        postType: "video",
        caption: "Wait for it... #fyp #viral",
        mediaUrl: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/thumb.jpg",
        likes: 50000,
        comments: 3000,
        shares: 10000,
        views: 500000,
        engagementRate: 12.6,
      });
    });

    it("should lookup cid via profile URL for TikTok", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { cid: "TT:77777" } },
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200 },
          data: {
            posts: [
              {
                socialPostID: "p1",
                text: "Hey",
                likes: 10,
                comments: 1,
                rePosts: 0,
                videoViews: 100,
                date: "",
                type: "video",
                er: 0.01,
              },
            ],
          },
        },
      });

      await fetchTikTokPosts("some_tiktoker");

      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        "https://instagram-statistics-api.p.rapidapi.com/community",
        expect.objectContaining({
          params: { url: "https://www.tiktok.com/@some_tiktoker" },
        })
      );
    });

    it("should return mock posts when API returns empty", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { meta: { code: 200 }, data: { posts: [] } },
      });

      const posts = await fetchTikTokPosts("empty_user", "TT:1");

      expect(posts).toHaveLength(8);
      expect(posts[0].externalId).toContain("mock_tt_");
    });

    it("should limit posts to 12 maximum", async () => {
      const manyPosts = Array.from({ length: 30 }, (_, i) => ({
        socialPostID: `p${i}`,
        text: `Post ${i}`,
        likes: i * 100,
        comments: i * 10,
        rePosts: i * 5,
        videoViews: i * 1000,
        date: "2024-01-01T00:00:00.000Z",
        type: "video",
        er: 0.05,
      }));

      mockedAxios.get.mockResolvedValueOnce({
        data: { meta: { code: 200 }, data: { posts: manyPosts } },
      });

      const posts = await fetchTikTokPosts("user", "TT:1");
      expect(posts).toHaveLength(12);
    });
  });
});
