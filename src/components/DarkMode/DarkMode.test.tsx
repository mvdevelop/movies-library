import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DarkMode from "./DarkMode";

describe("DarkMode Component", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute("data-theme");
  });

  it("renders toggle checkbox", () => {
    render(<DarkMode />);
    const checkbox = screen.getByLabelText(
      "Alternar tema escuro/claro"
    ) as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.id).toBe("darkmode-toggle");
  });

  it("sets dark theme by default when no preference exists", () => {
    render(<DarkMode />);
    expect(document.body.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("selectedTheme")).toBe("dark");
  });

  it("maintains light theme when previously selected", () => {
    localStorage.setItem("selectedTheme", "light");
    render(<DarkMode />);
    expect(document.body.getAttribute("data-theme")).toBe("light");
  });

  it("switches to dark theme when checkbox is checked", () => {
    localStorage.setItem("selectedTheme", "light");
    render(<DarkMode />);
    const checkbox = screen.getByLabelText(
      "Alternar tema escuro/claro"
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(document.body.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("selectedTheme")).toBe("dark");
  });

  it("switches to light theme when checkbox is unchecked", () => {
    render(<DarkMode />);
    const checkbox = screen.getByLabelText(
      "Alternar tema escuro/claro"
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(document.body.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("selectedTheme")).toBe("light");
  });
});
