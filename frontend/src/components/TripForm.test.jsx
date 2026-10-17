
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TripForm from "./TripForm";

function renderForm(onSubmit = vi.fn()) {
  render(
    <MemoryRouter>
      <TripForm
        submitLabel="Create trip"
        onSubmit={onSubmit}
        cancelTo="/"
      />
    </MemoryRouter>,
  );

  return onSubmit;
}

async function fillForm() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Trip name"), "Goa Trip");
  await user.type(screen.getByLabelText("Destination"), "Goa");
  await user.type(screen.getByLabelText("Start date"), "2026-11-10");
  await user.type(screen.getByLabelText("End date"), "2026-11-14");
  await user.type(screen.getByLabelText("Budget (₹)"), "20000");

  return user;
}

describe("TripForm", () => {
  it("submits the entered values with a numeric budget", async () => {
    const onSubmit = renderForm();

    await fillForm();
    await userEvent.click(
      screen.getByRole("button", { name: "Create trip" }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Goa Trip",
      destination: "Goa",
      destinations: ["Goa"],
      start_date: "2026-11-10",
      end_date: "2026-11-14",
      budget: 20000,
      description: "",
    });
  });

  it("shows the error returned by the server", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));

    renderForm(onSubmit);
    await fillForm();

    await userEvent.click(
      screen.getByRole("button", { name: "Create trip" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Server error");
  });
});
