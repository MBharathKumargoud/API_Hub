import { ArrowRight } from "lucide-react";

function ApiCard({
  name,
  category,
  description,
  icon,
  color,
  provider,
  onClick,
}) {
  return (
    <article className="api-card">
      <div className="api-card-header">
        <div className={`api-card-icon ${color}`}>
          {icon}
        </div>

        <span className="api-card-category">
          {category}
        </span>
      </div>

      <div className="api-card-content">
        <h3>{name}</h3>

        <p>{description}</p>
      </div>

      <div className="api-card-footer">
        <span className="api-card-provider">
          by {provider}
        </span>

        <button
          type="button"
          className="api-card-button"
          onClick={onClick}
        >
          View API
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

export default ApiCard;