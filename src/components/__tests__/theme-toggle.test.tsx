import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "../theme-toggle";

// Mock next-themes
const mockSetTheme = jest.fn();
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Sun: () => <span data-testid="sun-icon" />,
  Moon: () => <span data-testid="moon-icon" />,
  Monitor: () => <span data-testid="monitor-icon" />,
}));

// Mock shadcn dropdown
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => (
    <div data-testid="dropdown-trigger" data-aschild={asChild}>
      {children}
    </div>
  ),
  DropdownMenuContent: ({
    children,
  }: {
    children: React.ReactNode;
    align?: string;
  }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock shadcn button
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }) => <button {...props}>{children}</button>,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("should render the toggle button with sun and moon icons", () => {
    render(<ThemeToggle />);

    // Sun icon appears in trigger button + Light menu item
    expect(screen.getAllByTestId("sun-icon").length).toBe(2);
    // Moon icon appears in trigger button + Dark menu item
    expect(screen.getAllByTestId("moon-icon").length).toBe(2);
  });

  it("should render screen reader text", () => {
    render(<ThemeToggle />);

    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });

  it("should render three theme options", () => {
    render(<ThemeToggle />);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("should call setTheme with 'light' when Light is clicked", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByText("Light"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should call setTheme with 'dark' when Dark is clicked", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByText("Dark"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'system' when System is clicked", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByText("System"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("should render icons for each theme option", () => {
    render(<ThemeToggle />);

    const icons = screen.getAllByTestId("sun-icon");
    expect(icons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("monitor-icon")).toBeInTheDocument();
  });
});
