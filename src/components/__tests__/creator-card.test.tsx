import { render, screen, fireEvent } from "@testing-library/react";
import { CreatorCard } from "../creator-card";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Instagram: () => <span data-testid="instagram-icon" />,
  UserPlus: () => <span data-testid="user-plus-icon" />,
  UserMinus: () => <span data-testid="user-minus-icon" />,
  Users: () => <span data-testid="users-icon" />,
  TrendingUp: () => <span data-testid="trending-icon" />,
  Star: () => <span data-testid="star-icon" />,
}));

const baseCreator = {
  handle: "fitness_pro",
  displayName: "Fitness Pro",
  platform: "instagram",
  followerCount: 150000,
  bio: "Fitness tips and workouts",
  avatarUrl: "https://example.com/avatar.jpg",
};

describe("CreatorCard", () => {
  it("should render creator display name and handle", () => {
    render(<CreatorCard creator={baseCreator} />);

    expect(screen.getByText("Fitness Pro")).toBeInTheDocument();
    expect(screen.getByText("@fitness_pro")).toBeInTheDocument();
  });

  it("should render handle when displayName is null", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, displayName: null }}
      />
    );

    // Should show handle as fallback for display name
    expect(screen.getByText("@fitness_pro")).toBeInTheDocument();
  });

  it("should format large follower counts with K suffix", () => {
    render(<CreatorCard creator={baseCreator} />);

    expect(screen.getByText("150.0K")).toBeInTheDocument();
  });

  it("should format million follower counts with M suffix", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, followerCount: 2500000 }}
      />
    );

    expect(screen.getByText("2.5M")).toBeInTheDocument();
  });

  it("should show small follower counts as-is", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, followerCount: 500 }}
      />
    );

    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("should render bio text", () => {
    render(<CreatorCard creator={baseCreator} />);

    expect(
      screen.getByText("Fitness tips and workouts")
    ).toBeInTheDocument();
  });

  it("should not render bio when null", () => {
    render(
      <CreatorCard creator={{ ...baseCreator, bio: null }} />
    );

    expect(
      screen.queryByText("Fitness tips and workouts")
    ).not.toBeInTheDocument();
  });

  it("should show Instagram icon for instagram platform", () => {
    render(<CreatorCard creator={baseCreator} />);

    expect(screen.getByTestId("instagram-icon")).toBeInTheDocument();
  });

  it("should show TikTok SVG for tiktok platform", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, platform: "tiktok" }}
      />
    );

    expect(screen.queryByTestId("instagram-icon")).not.toBeInTheDocument();
  });

  it("should show Track button when not tracked", () => {
    const onTrack = jest.fn();
    render(
      <CreatorCard
        creator={baseCreator}
        tracked={false}
        onTrack={onTrack}
      />
    );

    const trackBtn = screen.getByText("Track");
    expect(trackBtn).toBeInTheDocument();
    fireEvent.click(trackBtn);
    expect(onTrack).toHaveBeenCalledTimes(1);
  });

  it("should show Untrack button when tracked", () => {
    const onUntrack = jest.fn();
    render(
      <CreatorCard
        creator={baseCreator}
        tracked={true}
        onUntrack={onUntrack}
      />
    );

    const untrackBtn = screen.getByText("Untrack");
    expect(untrackBtn).toBeInTheDocument();
    fireEvent.click(untrackBtn);
    expect(onUntrack).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when loading", () => {
    render(
      <CreatorCard
        creator={baseCreator}
        tracked={false}
        onTrack={jest.fn()}
        loading={true}
      />
    );

    const trackBtn = screen.getByText("Track").closest("button");
    expect(trackBtn).toBeDisabled();
  });

  it("should show engagement rate when avgER is provided", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, avgER: 0.045 }}
      />
    );

    expect(screen.getByText("4.50% ER")).toBeInTheDocument();
    expect(screen.getByTestId("trending-icon")).toBeInTheDocument();
  });

  it("should not show engagement rate when avgER is 0", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, avgER: 0 }}
      />
    );

    expect(screen.queryByText(/% ER/)).not.toBeInTheDocument();
  });

  it("should show quality score when provided", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, qualityScore: 0.85 }}
      />
    );

    expect(screen.getByText("85% Quality")).toBeInTheDocument();
    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
  });

  it("should not show quality score when 0", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, qualityScore: 0 }}
      />
    );

    expect(screen.queryByText(/% Quality/)).not.toBeInTheDocument();
  });

  it("should render avatar component with image", () => {
    const { container } = render(<CreatorCard creator={baseCreator} />);

    // Radix Avatar renders with data-slot="avatar"
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it("should show first letter of handle as avatar fallback", () => {
    render(
      <CreatorCard
        creator={{ ...baseCreator, avatarUrl: null }}
      />
    );

    expect(screen.getByText("F")).toBeInTheDocument();
  });
});
