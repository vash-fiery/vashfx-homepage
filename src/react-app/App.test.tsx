import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

describe("App component", () => {
  it("should show an error message when the API call fails", async () => {
    // Mock the fetch function to simulate a failure
    vi.spyOn(window, "fetch").mockImplementation(() => {
      return Promise.reject(new Error("API is down"));
    });

    render(<App />);
    const user = userEvent.setup();

    const nameButton = screen.getByRole("button", { name: /get name/i });
    await user.click(nameButton);

    // Expect to find an error message. This will fail before the fix.
    const errorMessage = await screen.findByText(/API request failed/i);
    expect(errorMessage).toBeInTheDocument();

    // Clean up the mock
    vi.restoreAllMocks();
  });
});
