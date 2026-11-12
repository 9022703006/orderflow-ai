import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import App from "./App";

describe("OrderFlow AI Token Authentication & Route Protection", () => {
  beforeEach(() => {
    localStorage.clear();
    window.alert = jest.fn();
    window.history.pushState({}, "", "/login");
    global.fetch = jest.fn();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  test("Direct access without authToken redirects to /login", () => {
    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Welcome to OrderFlow AI/i })).not.toBeInTheDocument();
  });

  test("Security Check: Setting localStorage.isAuthenticated='true' without authToken fails and redirects to /login", () => {
    // Attempting to bypass auth with localStorage.isAuthenticated = "true"
    localStorage.setItem("isAuthenticated", "true");
    window.history.pushState({}, "", "/dashboard");
    render(<App />);

    // Must still redirect to login because authToken is missing
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Welcome to OrderFlow AI/i })).not.toBeInTheDocument();
  });

  test("Direct access to /create-order and /orders without authToken redirects to /login", () => {
    window.history.pushState({}, "", "/create-order");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();

    cleanup();
    window.history.pushState({}, "", "/orders");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
  });

  test("Verify 1: Correct OTP stores session token and authorizes dashboard access", async () => {
    render(<App />);

    // Mock Login response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: "true", message: "OTP sent successfully" }),
    });

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "rahul@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Verify OTP/i })).toBeInTheDocument();
    });

    // Mock Verify OTP success response with session token
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: "true",
        message: "OTP verified successfully",
        token: "secure-session-token-999",
      }),
    });

    const otpInput = screen.getByPlaceholderText(/Enter 6-digit OTP/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("OTP verified successfully");
    });

    // Verify session token is saved in localStorage and user is navigated to dashboard
    expect(localStorage.getItem("authToken")).toBe("secure-session-token-999");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Welcome to OrderFlow AI/i })).toBeInTheDocument();
    });
  });

  test("Verify 2: Incorrect OTP does NOT generate or store a token and user stays on OTP page", async () => {
    render(<App />);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: "true", message: "OTP sent successfully" }),
    });

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "rahul@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Verify OTP/i })).toBeInTheDocument();
    });

    // Mock Verify OTP failure response for incorrect OTP (400 Bad Request)
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: "false", message: "Invalid OTP" }),
    });

    const otpInput = screen.getByPlaceholderText(/Enter 6-digit OTP/i);
    fireEvent.change(otpInput, { target: { value: "256354" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid OTP");
    });

    // Token must be null and user must remain on Verify OTP page
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(screen.getByRole("heading", { name: /Verify OTP/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Welcome to OrderFlow AI/i })).not.toBeInTheDocument();
  });

  test("Verify 7: Logout calls backend logout API, clears token, and redirects to /login", async () => {
    localStorage.setItem("authToken", "active-token-123");
    window.history.pushState({}, "", "/dashboard");

    // Mock backend logout endpoint
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: "true", message: "Logged out successfully" }),
    });

    render(<App />);

    expect(screen.getByRole("heading", { name: /Welcome to OrderFlow AI/i })).toBeInTheDocument();

    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutBtn);

    // Verify token was sent in authorization header during logout
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/logout"),
      expect.objectContaining({
        headers: { Authorization: "Bearer active-token-123" },
      })
    );

    // Verify token is removed from localStorage and user redirected to /login
    await waitFor(() => {
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();
    });
  });
});
