import axios from "axios";
import { searchInstagramCreators, fetchInstagramPosts } from "../instagram";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Instagram Scraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RAPIDAPI_KEY = "test-api-key";
  });

  describe("searchInstagramCreators", () => {
    it("should return mapped creators from API search by tags", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: [
            {
              cid: "INST:12345",
              socialType: "INST",
              screenName: "fitness_pro",
              name: "Fitness Pro",
              image: "https://example.com/avatar.jpg",
              usersCount: 150000,
              avgER: 0.035,
              qualityScore: 0.82,
            },
            {
              cid: "INST:67890",
              socialType: "INST",
              screenName: "health_guru",
              name: "Health Guru",
              image: "https://example.com/avatar2.jpg",
              usersCount: 85000,
              avgER: 0.045,
              qualityScore: 0.91,
            },
          ],
        },
      });

      const results = await searchInstagramCreators("Fitness & Health");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://instagram-statistics-api.p.rapidapi.com/search",
        expect.objectContaining({
          params: expect.objectContaining({
            socialTypes: "INST",
            tags: "fitness",
            sort: "-avgER",
          }),
        })
      );

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        handle: "fitness_pro",
        displayName: "Fitness Pro",
        platform: "instagram",
        followerCount: 150000,
        bio: "",
        avatarUrl: "https://example.com/avatar.jpg",
        cid: "INST:12345",
        avgER: 0.035,
        qualityScore: 0.82,
      });
    });

    it("should fallback to query search when tag search returns empty", async () => {
      // First call (tag search) returns empty
      mockedAxios.get.mockResolvedValueOnce({
        data: { meta: { code: 200, message: "OK" }, data: [] },
      });
      // Second call (query search) returns results
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: [
            {
              cid: "INST:111",
              screenName: "travel_world",
              name: "Travel World",
              image: "",
              usersCount: 50000,
              avgER: 0.02,
              qualityScore: 0.7,
            },
          ],
        },
      });

      const results = await searchInstagramCreators("Travel");

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(1);
      expect(results[0].handle).toBe("travel_world");
    });

    it("should return mock creators when API fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      const results = await searchInstagramCreators("Fitness & Health");

      expect(results).toHaveLength(10);
      expect(results[0].platform).toBe("instagram");
      expect(results[0].handle).toBeTruthy();
      expect(results[0].followerCount).toBeGreaterThan(0);
    });

    it("should map niche names to correct API tags", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { meta: { code: 200, message: "OK" }, data: [] },
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: { meta: { code: 200, message: "OK" }, data: [] },
      });

      await searchInstagramCreators("Business & Entrepreneurship");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            tags: "business-and-careers",
          }),
        })
      );
    });
  });

  describe("fetchInstagramPosts", () => {
    it("should fetch posts using cid directly when provided", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: {
            posts: [
              {
                socialPostID: "post_123",
                postID: "456",
                postImage: "https://example.com/post.jpg",
                text: "Amazing fitness tip! #fitness #health",
                likes: 5000,
                comments: 200,
                rePosts: 50,
                videoViews: null,
                views: null,
                date: "2024-01-15T10:00:00.000Z",
                type: "carousel_album",
                er: 0.034,
              },
              {
                socialPostID: "post_789",
                postID: "012",
                postImage: "https://example.com/reel.jpg",
                videoLink: "https://example.com/reel.mp4",
                text: "Watch this reel! #fyp",
                likes: 15000,
                comments: 800,
                rePosts: 300,
                videoViews: 100000,
                views: null,
                date: "2024-01-14T08:00:00.000Z",
                type: "reel",
                er: 0.105,
              },
            ],
          },
        },
      });

      const posts = await fetchInstagramPosts("fitness_pro", "INST:12345");

      // Should NOT call profile lookup since cid was provided
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://instagram-statistics-api.p.rapidapi.com/posts",
        expect.objectContaining({
          params: expect.objectContaining({
            cid: "INST:12345",
            type: "posts",
            sort: "date",
          }),
        })
      );

      expect(posts).toHaveLength(2);
      expect(posts[0]).toMatchObject({
        externalId: "post_123",
        platform: "instagram",
        postType: "carousel",
        caption: "Amazing fitness tip! #fitness #health",
        likes: 5000,
        comments: 200,
        shares: 50,
      });
      expect(posts[1].postType).toBe("reel");
      expect(posts[1].views).toBe(100000);
    });

    it("should lookup cid via profile when not provided", async () => {
      // Profile lookup
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { cid: "INST:99999" } },
      });
      // Posts fetch
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: {
            posts: [
              {
                socialPostID: "p1",
                text: "Hello",
                likes: 100,
                comments: 10,
                rePosts: 5,
                date: "2024-01-01T00:00:00.000Z",
                type: "image",
                er: 0.01,
              },
            ],
          },
        },
      });

      const posts = await fetchInstagramPosts("some_user");

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        "https://instagram-statistics-api.p.rapidapi.com/community",
        expect.objectContaining({
          params: { url: "https://instagram.com/some_user" },
        })
      );
      expect(posts).toHaveLength(1);
    });

    it("should return mock posts when profile lookup fails", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: {} }, // No cid
      });

      const posts = await fetchInstagramPosts("unknown_user");

      expect(posts).toHaveLength(8); // Mock data
      expect(posts[0].platform).toBe("instagram");
    });

    it("should return mock posts on API error", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

      const posts = await fetchInstagramPosts("error_user");

      expect(posts).toHaveLength(8);
      expect(posts[0].externalId).toContain("mock_");
    });

    it("should correctly map post types", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: {
            posts: [
              {
                socialPostID: "1",
                type: "carousel_album",
                text: "",
                likes: 0,
                comments: 0,
                rePosts: 0,
                date: "",
                er: 0,
              },
              {
                socialPostID: "2",
                type: "reel",
                text: "",
                likes: 0,
                comments: 0,
                rePosts: 0,
                date: "",
                er: 0,
              },
              {
                socialPostID: "3",
                type: "video",
                text: "",
                likes: 0,
                comments: 0,
                rePosts: 0,
                date: "",
                er: 0,
              },
              {
                socialPostID: "4",
                type: "image",
                text: "",
                likes: 0,
                comments: 0,
                rePosts: 0,
                date: "",
                er: 0,
              },
              {
                socialPostID: "5",
                type: "story",
                text: "",
                likes: 0,
                comments: 0,
                rePosts: 0,
                date: "",
                er: 0,
              },
            ],
          },
        },
      });

      const posts = await fetchInstagramPosts("user", "INST:1");

      expect(posts[0].postType).toBe("carousel");
      expect(posts[1].postType).toBe("reel");
      expect(posts[2].postType).toBe("reel"); // video maps to reel
      expect(posts[3].postType).toBe("static");
      expect(posts[4].postType).toBe("story");
    });

    it("should calculate engagement rate from API er value", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          meta: { code: 200, message: "OK" },
          data: {
            posts: [
              {
                socialPostID: "1",
                type: "image",
                text: "",
                likes: 100,
                comments: 10,
                rePosts: 0,
                date: "",
                er: 0.05,
              },
            ],
          },
        },
      });

      const posts = await fetchInstagramPosts("user", "INST:1");
      expect(posts[0].engagementRate).toBe(5); // 0.05 * 100
    });
  });
});
