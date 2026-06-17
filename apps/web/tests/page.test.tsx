import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

describe("HomePage", () => {
  it("renders the service title", () => {
    render(<HomePage />);
    expect(screen.getByText("나혼자만 인테리어")).toBeInTheDocument();
  });
});
