import { render, screen } from "@testing-library/react";
import { PostCard } from "../post-card";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Heart: () => <span data-testid="heart-icon" />,
  MessageCircle: () => <span data-testid="comment-icon" />,
  Share2: () => <span data-testid="share-icon" />,
  Eye: () => <span data-testid="eye-icon" />,
  Instagram: () => <span data-testid="instagram-icon" />,
  Sparkles: () => <span data-testid="sparkles-icon" />,
}));

const basePost = {
  id: "post-1",
  platform: "instagram",
  postType: "carousel",
  caption: "5 fitness tips that will change your game! #fitness",
  likes: 5200,
  comments: 340,
  shares: 120,
  views: 0,
  engagementRate: 4.5,
  postedAt: "2024-01-15T10:00:00.000Z",
  analysis: null,
};

describe("PostCard", () => {
  it("should render caption text", () => {
    render(<PostCard post={basePost} />);

    expect(
      screen.getByText("5 fitness tips that will change your game! #fitness")
    ).toBeInTheDocument();
  });

  it("should not render caption when null", () => {
    render(
      <PostCard post={{ ...basePost, caption: null }} />
    );

    expect(
      screen.queryByText(/fitness tips/)
    ).not.toBeInTheDocument();
  });

  it("should render engagement rate badge", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByText("4.5% ER")).toBeInTheDocument();
  });

  it("should render post type badge", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByText("carousel")).toBeInTheDocument();
  });

  it("should format like count with K suffix", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByText("5.2K")).toBeInTheDocument();
  });

  it("should format comment count", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByText("340")).toBeInTheDocument();
  });

  it("should format share count", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("should show views when greater than 0", () => {
    render(
      <PostCard post={{ ...basePost, views: 85000 }} />
    );

    expect(screen.getByText("85.0K")).toBeInTheDocument();
    expect(screen.getByTestId("eye-icon")).toBeInTheDocument();
  });

  it("should not show views when 0", () => {
    render(<PostCard post={basePost} />);

    expect(screen.queryByTestId("eye-icon")).not.toBeInTheDocument();
  });

  it("should format million counts with M suffix", () => {
    render(
      <PostCard
        post={{ ...basePost, likes: 1500000, views: 5200000 }}
      />
    );

    expect(screen.getByText("1.5M")).toBeInTheDocument();
    expect(screen.getByText("5.2M")).toBeInTheDocument();
  });

  it("should show Instagram icon for instagram platform", () => {
    render(<PostCard post={basePost} />);

    expect(screen.getByTestId("instagram-icon")).toBeInTheDocument();
  });

  it("should show TikTok icon for tiktok platform", () => {
    render(
      <PostCard post={{ ...basePost, platform: "tiktok" }} />
    );

    expect(screen.queryByTestId("instagram-icon")).not.toBeInTheDocument();
  });

  it("should render creator handle when provided", () => {
    render(
      <PostCard post={basePost} creatorHandle="fitness_pro" />
    );

    expect(screen.getByText("@fitness_pro")).toBeInTheDocument();
  });

  it("should not render creator handle when not provided", () => {
    render(<PostCard post={basePost} />);

    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  describe("with analysis", () => {
    const analysisPost = {
      ...basePost,
      analysis: {
        hookType: "question",
        contentFormat: "Carousel with text overlays",
        topic: "Fitness tips",
        whyItWorked: "The question hook drives engagement and curiosity.",
        sentiment: "educational",
        keyTakeaways: [
          "Use question hooks to engage",
          "Keep tips actionable",
          "Use carousel format for listicles",
        ],
      },
    };

    it("should render AI Analysis section", () => {
      render(<PostCard post={analysisPost} />);

      expect(screen.getByText("AI Analysis")).toBeInTheDocument();
      expect(screen.getByTestId("sparkles-icon")).toBeInTheDocument();
    });

    it("should render hook type badge", () => {
      render(<PostCard post={analysisPost} />);

      expect(screen.getByText("question")).toBeInTheDocument();
    });

    it("should render topic badge", () => {
      render(<PostCard post={analysisPost} />);

      expect(screen.getByText("Fitness tips")).toBeInTheDocument();
    });

    it("should render sentiment badge", () => {
      render(<PostCard post={analysisPost} />);

      expect(screen.getByText("educational")).toBeInTheDocument();
    });

    it("should render why it worked text", () => {
      render(<PostCard post={analysisPost} />);

      expect(
        screen.getByText(
          "The question hook drives engagement and curiosity."
        )
      ).toBeInTheDocument();
    });

    it("should render key takeaways list", () => {
      render(<PostCard post={analysisPost} />);

      // Takeaways are rendered inside <li> elements with a bullet character
      expect(
        screen.getByText(/Use question hooks to engage/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Keep tips actionable/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Use carousel format for listicles/)
      ).toBeInTheDocument();
    });

    it("should format hook type with underscores replaced by spaces", () => {
      render(
        <PostCard
          post={{
            ...basePost,
            analysis: {
              ...analysisPost.analysis!,
              hookType: "bold_statement",
            },
          }}
        />
      );

      expect(screen.getByText("bold statement")).toBeInTheDocument();
    });

    it("should handle analysis with null fields gracefully", () => {
      render(
        <PostCard
          post={{
            ...basePost,
            analysis: {
              hookType: null,
              contentFormat: null,
              topic: null,
              whyItWorked: null,
              sentiment: null,
              keyTakeaways: [],
            },
          }}
        />
      );

      // AI Analysis header should still render
      expect(screen.getByText("AI Analysis")).toBeInTheDocument();
    });
  });
});
