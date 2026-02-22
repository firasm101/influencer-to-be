import { render, screen, fireEvent } from "@testing-library/react";
import { PostBuilder } from "../post-builder";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Wand2: () => <span data-testid="wand-icon" />,
  Copy: () => <span data-testid="copy-icon" />,
  Check: () => <span data-testid="check-icon" />,
  RefreshCw: () => <span data-testid="refresh-icon" />,
  Instagram: () => <span data-testid="instagram-icon" />,
  Linkedin: () => <span data-testid="linkedin-icon" />,
  Lightbulb: () => <span data-testid="lightbulb-icon" />,
  FileText: () => <span data-testid="filetext-icon" />,
  Clock: () => <span data-testid="clock-icon" />,
}));

// Mock shadcn Select components (Radix-based, don't work in jsdom)
jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <button data-testid={`select-trigger-${id || "default"}`}>{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("PostBuilder", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should render the form title", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Generate a Post")).toBeInTheDocument();
  });

  it("should render platform selector label", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Platform *")).toBeInTheDocument();
  });

  it("should render content format selector label", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Content Format")).toBeInTheDocument();
  });

  it("should render topic input field", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Topic / Angle")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. morning routine")).toBeInTheDocument();
  });

  it("should render Generate Post button", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Generate Post")).toBeInTheDocument();
  });

  it("should disable Generate button when no insights", () => {
    render(<PostBuilder hasInsights={false} />);

    const btn = screen.getByText("Generate Post").closest("button");
    expect(btn).toBeDisabled();
  });

  it("should show message when no insights available", () => {
    render(<PostBuilder hasInsights={false} />);

    expect(
      screen.getByText(
        "You need to generate insights first. Go to the Insights page to analyze posts in your niche."
      )
    ).toBeInTheDocument();
  });

  it("should not show no-insights message when insights exist", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.queryByText(/You need to generate insights first/)).not.toBeInTheDocument();
  });

  it("should allow typing in the topic field", () => {
    render(<PostBuilder hasInsights={true} />);

    const topicInput = screen.getByPlaceholderText("e.g. morning routine");
    fireEvent.change(topicInput, { target: { value: "productivity tips" } });

    expect(topicInput).toHaveValue("productivity tips");
  });

  it("should not render result section initially", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.queryByText("Caption")).not.toBeInTheDocument();
    expect(screen.queryByText("Copy All")).not.toBeInTheDocument();
    expect(screen.queryByText("Regenerate")).not.toBeInTheDocument();
  });

  it("should render wand icon in title and button", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getAllByTestId("wand-icon").length).toBeGreaterThanOrEqual(1);
  });

  it("should render all platform options", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByTestId("select-item-instagram")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-tiktok")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-linkedin")).toBeInTheDocument();
  });

  it("should render all content format options", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Reel / Short Video")).toBeInTheDocument();
    expect(screen.getByText("Carousel")).toBeInTheDocument();
    expect(screen.getByText("Static Image")).toBeInTheDocument();
    expect(screen.getByText("Story")).toBeInTheDocument();
    expect(screen.getByText("Article / Long Post")).toBeInTheDocument();
    expect(screen.getByText("Document / PDF")).toBeInTheDocument();
  });

  it("should render platform names in select items", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.getByText("TikTok")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("should render platform icons", () => {
    render(<PostBuilder hasInsights={true} />);

    expect(screen.getByTestId("instagram-icon")).toBeInTheDocument();
    expect(screen.getByTestId("linkedin-icon")).toBeInTheDocument();
  });
});
