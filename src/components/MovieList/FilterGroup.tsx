import "./FilterGroup.css";

interface FilterGroupProps {
  minRating: number;
  onRatingClick: (rating: number) => void;
  ratings: number[];
}

const FilterGroup = ({
  minRating,
  onRatingClick,
  ratings,
}: FilterGroupProps) => {
  return (
    <ul className="align_center movie_filter">
      {ratings.map((rate: number) => (
        <li
          className={
            minRating === rate
              ? "movie_filter_item active"
              : "movie_filter_item"
          }
          key={rate}
          onClick={() => onRatingClick(rate)}
          role="button"
          tabIndex={0}
          aria-label={`Filtrar filmes com rating mínimo de ${rate} estrelas`}
          onKeyDown={(e) => e.key === "Enter" && onRatingClick(rate)}
        >
          {rate}+ Star
        </li>
      ))}
    </ul>
  );
};

export default FilterGroup;
