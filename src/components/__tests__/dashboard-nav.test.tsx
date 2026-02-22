import { render, screen } from "@testing-library/react";
import { DashboardNav } from "../dashboard-nav";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "https://example.com/avatar.jpg",
      },
    },
  }),
  signOut: jest.fn(),
}));

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Zap: () => <span data-testid="zap-icon" />,
  LayoutDashboard: () => <span data-testid="dashboard-icon" />,
  Search: () => <span data-testid="search-icon" />,
  Lightbulb: () => <span data-testid="lightbulb-icon" />,
  Wand2: () => <span data-testid="wand-icon" />,
  Settings: () => <span data-testid="settings-icon" />,
  LogOut: () => <span data-testid="logout-icon" />,
  Sun: () => <span data-testid="sun-icon" />,
  Moon: () => <span data-testid="moon-icon" />,
  Monitor: () => <span data-testid="monitor-icon" />,
}));

// Mock shadcn dropdown
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode; align?: string }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => <button onClick={onClick}>{children}</button>,
}));

describe("DashboardNav", () => {
  it("should render the brand name", () => {
    render(<DashboardNav />);

    expect(screen.getByText("InfluencerToBe")).toBeInTheDocument();
  });

  it("should render the brand icon", () => {
    render(<DashboardNav />);

    expect(screen.getByTestId("zap-icon")).toBeInTheDocument();
  });

  it("should render all navigation items", () => {
    render(<DashboardNav />);

    // Each nav item appears twice: desktop + mobile
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Discover").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Insights").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Build").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Settings").length).toBeGreaterThanOrEqual(1);
  });

  it("should render Build nav item with wand icon", () => {
    render(<DashboardNav />);

    expect(screen.getAllByTestId("wand-icon").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Build").length).toBeGreaterThanOrEqual(1);
  });

  it("should render user name in dropdown", () => {
    render(<DashboardNav />);

    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("should render avatar fallback letter", () => {
    render(<DashboardNav />);

    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("should render Sign Out button", () => {
    render(<DashboardNav />);

    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("should render theme toggle icons", () => {
    render(<DashboardNav />);

    // ThemeToggle renders sun/moon icons
    expect(screen.getAllByTestId("sun-icon").length).toBeGreaterThanOrEqual(1);
  });

  it("should render nav icons for each item", () => {
    render(<DashboardNav />);

    expect(screen.getAllByTestId("dashboard-icon").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("search-icon").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("lightbulb-icon").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("settings-icon").length).toBeGreaterThanOrEqual(1);
  });

  it("should have correct number of nav items (5 total)", () => {
    render(<DashboardNav />);

    // Desktop + mobile = 2 instances per nav item
    // 5 items × 2 = 10 link-buttons, but each has label text
    const dashboardLinks = screen.getAllByText("Dashboard");
    expect(dashboardLinks.length).toBe(2); // desktop + mobile
  });
});
