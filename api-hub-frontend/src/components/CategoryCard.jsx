import { ArrowRight } from "lucide-react";

const CategoryCard = ({
  name,
  description,
  icon,
  color,
  apiCount,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="category-card"
      onClick={onClick}
    >
      <div className={`category-card-icon ${color}`}>
        {icon}
      </div>

      <div className="category-card-content">
        <h3>{name}</h3>

        <p>{description}</p>

        <div className="category-card-footer">
          <span>
            {apiCount} {apiCount === 1 ? "API" : "APIs"}
          </span>

          <span className="category-card-arrow">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </button>
  );
};

export default CategoryCard;