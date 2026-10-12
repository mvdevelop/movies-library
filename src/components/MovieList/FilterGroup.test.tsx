import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterGroup from "./FilterGroup";

describe("FilterGroup Component", () => {
  const mockOnRatingClick = vi.fn();
  const defaultProps = {
    minRating: 0,
    onRatingClick: mockOnRatingClick,
    ratings: [8, 7, 6],
  };

  beforeEach(() => {
    mockOnRatingClick.mockClear();
  });

  it("renders all rating options", () => {
    render(<FilterGroup {...defaultProps} />);

    expect(screen.getByText("8+ Star")).toBeInTheDocument();
    expect(screen.getByText("7+ Star")).toBeInTheDocument();
    expect(screen.getByText("6+ Star")).toBeInTheDocument();
  });

  it("applies active class when rating is selected", () => {
    render(<FilterGroup {...defaultProps} minRating={7} />);

    const activeItem = screen.getByText("7+ Star").closest("li");
    expect(activeItem).toHaveClass("active");
  });

  it("does not apply active class when rating is not selected", () => {
    render(<FilterGroup {...defaultProps} minRating={8} />);

    const inactiveItem = screen.getByText("7+ Star").closest("li");
    expect(inactiveItem).not.toHaveClass("active");
  });

  it("calls onRatingClick with the correct rating when clicked", () => {
    render(<FilterGroup {...defaultProps} />);

    const rateButton = screen.getByText("7+ Star").closest("li");
    fireEvent.click(rateButton!);

    expect(mockOnRatingClick).toHaveBeenCalledWith(7);
  });
});
