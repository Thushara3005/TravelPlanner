import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TripsPage from "./TripsPage.jsx";
import { getTrips } from "../services/api.js";

vi.mock("../services/api.js");

const goaTrip = {
  id: 1,
  name: "Goa Trip",
  destination: "Goa",
  start_date: "2026-11-10",
  end_date: "2026-11-14",
  budget: 20000,
  status: "upcoming",
};

function paginatedResponse(trips = [goaTrip], totalPages = 1) {
  return {
    trips,
    page: 1,
    limit: 10,
    total: trips.length,
    total_pages: totalPages,
  };
}

function renderPage() {
  render(
    <MemoryRouter>
      <TripsPage />
    </MemoryRouter>
  );
}

describe("TripsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("lists trips with their details and pagination", async () => {
    getTrips.mockResolvedValue(paginatedResponse());
    renderPage();

    expect(await screen.findByText("Goa Trip")).toBeInTheDocument();
    expect(screen.getByText("₹20,000")).toBeInTheDocument();
    expect(screen.getByText("upcoming")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("shows a message when no trips are found", async () => {
    getTrips.mockResolvedValue(paginatedResponse([]));
    renderPage();

    expect(await screen.findByText("No trips found.")).toBeInTheDocument();
  });

  it("shows the error when loading fails", async () => {
    getTrips.mockRejectedValue(new Error("Database error"));
    renderPage();

    expect(await screen.findByText("Database error")).toBeInTheDocument();
  });

  it("asks the API for matching trips when searching and filtering", async () => {
    getTrips.mockResolvedValue(paginatedResponse([]));
    renderPage();

    await userEvent.type(
      screen.getByLabelText("Search trips"),
      "goa"
    );

    await userEvent.selectOptions(
      screen.getByLabelText("Filter by status"),
      "ongoing"
    );

    await waitFor(() =>
      expect(getTrips).toHaveBeenLastCalledWith({
        search: "goa",
        status: "ongoing",
        page: 1,
        limit: 10,
      })
    );
  });

  it("loads the next page when Next is clicked", async () => {
    const user = userEvent.setup();
    getTrips.mockResolvedValue(paginatedResponse([goaTrip], 2));
    renderPage();

    await user.click(
      await screen.findByRole("button", { name: "Next" })
    );

    await waitFor(() =>
      expect(getTrips).toHaveBeenLastCalledWith({
        search: "",
        status: "",
        page: 2,
        limit: 10,
      })
    );
  });
});
