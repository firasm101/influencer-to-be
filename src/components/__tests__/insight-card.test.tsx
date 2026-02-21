import { render, screen } from "@testing-library/react";
import { InsightCard } from "../insight-card";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  TrendingUp: () => <span data-testid="trending-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
  MessageSquare: () => <span data-testid="message-icon" />,
  BarChart3: () => <span data-testid="barchart-icon" />,
  Lightbulb: () => <span data-testid="lightbulb-icon" />,
}));

const baseInsight = {
  id: "insight-1",
  insightType: "format",
  insightText: "Carousel posts get 2.3x more engagement than static posts in your niche.",
  dataPoints: 15,
  generatedAt: "2024-01-20T10:00:00.000Z",
};

describe("InsightCard", () => {
  it("should render insight text", () => {
    render(<InsightCard insight={baseInsight} />);

    expect(
      screen.getByText(
        "Carousel posts get 2.3x more engagement than static posts in your niche."
      )
    ).toBeInTheDocument();
  });

  it("should render insight type badge", () => {
    render(<InsightCard insight={baseInsight} />);

    expect(screen.getByText("format")).toBeInTheDocument();
  });

  it("should render data points count", () => {
    render(<InsightCard insight={baseInsight} />);

    expect(
      screen.getByText("Based on 15 data points")
    ).toBeInTheDocument();
  });

  it("should show barchart icon for format insight type", () => {
    render(<InsightCard insight={baseInsight} />);

    expect(screen.getByTestId("barchart-icon")).toBeInTheDocument();
  });

  it("should show clock icon for timing insight type", () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, insightType: "timing" }}
      />
    );

    expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
  });

  it("should show message icon for hook insight type", () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, insightType: "hook" }}
      />
    );

    expect(screen.getByTestId("message-icon")).toBeInTheDocument();
  });

  it("should show lightbulb icon for topic insight type", () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, insightType: "topic" }}
      />
    );

    expect(screen.getByTestId("lightbulb-icon")).toBeInTheDocument();
  });

  it("should show trending icon for engagement insight type", () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, insightType: "engagement" }}
      />
    );

    expect(screen.getByTestId("trending-icon")).toBeInTheDocument();
  });

  it("should show lightbulb icon as fallback for unknown insight type", () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, insightType: "unknown_type" }}
      />
    );

    expect(screen.getByTestId("lightbulb-icon")).toBeInTheDocument();
  });

  it("should show correct data points count for different values", () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, dataPoints: 42 }}
      />
    );

    expect(
      screen.getByText("Based on 42 data points")
    ).toBeInTheDocument();
  });
});
