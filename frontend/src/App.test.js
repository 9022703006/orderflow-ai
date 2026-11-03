import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

describe("OrderFlow AI Frontend Flows", () => {
  beforeEach(() => {
    window.alert = jest.fn();
    window.history.pushState({}, "", "/login");
  });

  test("Flow 1: Login -> Verify OTP 123456 -> Dashboard -> Create Order -> Orders", () => {
    render(<App />);

    // 1. Initial page is Login
    expect(screen.getByRole("heading", { name: /Sign In/i })).toBeInTheDocument();

    // Try submit without email -> alert triggered
    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));
    expect(window.alert).toHaveBeenCalledWith("Please enter email");

    // Enter email and submit
    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "test@orderflow.ai" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));

    // 2. Arrive at Verify OTP page
    expect(screen.getByRole("heading", { name: /Verify OTP/i })).toBeInTheDocument();
    expect(screen.getByText(/test@orderflow.ai/i)).toBeInTheDocument();

    // Test Resend OTP button
    fireEvent.click(screen.getByRole("button", { name: /Resend OTP/i }));
    expect(window.alert).toHaveBeenCalledWith("OTP sent again");

    // Test Invalid OTP
    const otpInput = screen.getByPlaceholderText(/Enter 123456/i);
    fireEvent.change(otpInput, { target: { value: "999999" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));
    expect(window.alert).toHaveBeenCalledWith("Invalid OTP");

    // Enter valid OTP: 123456
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    // 3. Arrive at Dashboard
    expect(screen.getByRole("heading", { name: /Welcome to OrderFlow AI/i })).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // 4. Click Create Order button on Dashboard
    const createOrderBtn = screen.getByRole("button", { name: /Create Order/i });
    fireEvent.click(createOrderBtn);

    // 5. Arrive at Create Order page
    expect(screen.getByRole("heading", { name: /Create Order/i })).toBeInTheDocument();

    // Test order calculation
    const qtyInput = screen.getByLabelText(/Quantity/i);
    const priceInput = screen.getByLabelText(/Price/i);
    fireEvent.change(qtyInput, { target: { value: "2" } });
    fireEvent.change(priceInput, { target: { value: "450000" } });
    expect(screen.getByText(/₹9,00,000/i)).toBeInTheDocument();

    // Fill customer name & product
    fireEvent.change(screen.getByLabelText(/Customer Name/i), {
      target: { value: "Rahul" },
    });
    fireEvent.change(screen.getByLabelText(/Product/i), {
      target: { value: "Tractor" },
    });

    // Submit Create Order
    fireEvent.click(screen.getByRole("button", { name: "Create Order" }));
    expect(window.alert).toHaveBeenCalledWith("Order created successfully");

    // Test AI section
    const aiTextArea = screen.getByPlaceholderText(/Create an order for Rahul, 2 tractors at 450000 each/i);
    fireEvent.change(aiTextArea, {
      target: { value: "Create order for Amit, 1 tractor" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Process with AI/i }));
    expect(window.alert).toHaveBeenCalledWith("AI processing started");

    // 6. Navigate to Orders page via Navbar
    fireEvent.click(screen.getByRole("link", { name: "Orders" }));

    // Verify Orders table content
    expect(screen.getByRole("heading", { name: /Orders List/i })).toBeInTheDocument();
    expect(screen.getByText("Rahul")).toBeInTheDocument();
    expect(screen.getByText("Amit")).toBeInTheDocument();
    expect(screen.getByText(/₹9,00,000/i)).toBeInTheDocument();
    expect(screen.getByText(/₹4,50,000/i)).toBeInTheDocument();
  });

  test("Flow 2: Register -> Verify OTP 123456 -> Dashboard", () => {
    render(<App />);

    // Click register link from login
    fireEvent.click(screen.getByRole("link", { name: /Register/i }));
    expect(screen.getByRole("heading", { name: /Create Account/i })).toBeInTheDocument();

    // Validation checks
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    expect(window.alert).toHaveBeenCalledWith("Please enter name");

    fireEvent.change(screen.getByPlaceholderText(/Your full name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));
    expect(window.alert).toHaveBeenCalledWith("Please enter email");

    // Enter email and register
    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "jane@orderflow.ai" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    // Navigates to OTP
    expect(screen.getByRole("heading", { name: /Verify OTP/i })).toBeInTheDocument();
    expect(screen.getByText(/jane@orderflow.ai/i)).toBeInTheDocument();

    // Verify OTP 123456
    const otpInput = screen.getByPlaceholderText(/Enter 123456/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    // Navigates to Dashboard
    expect(screen.getByRole("heading", { name: /Welcome to OrderFlow AI/i })).toBeInTheDocument();
  });
});
