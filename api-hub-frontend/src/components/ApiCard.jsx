import { ArrowRight, Bookmark, Check } from "lucide-react";
import { useSavedApis } from "../utils/savedApis";

function ApiCard({
  id,
  name,
  category,
  description,
  icon,
  color,
  provider,
  onClick,
}) {
  const { isSaved, toggleSave } = useSavedApis();
  const saved = isSaved(id);

  const handleSave = (event) => {
    event.stopPropagation();
    toggleSave(id);
  };

  return (
    <article className="api-card">
      <div className="api-card-header">
        <div className={`api-card-icon ${color}`}>
          {icon}
        </div>

        <span className="api-card-category">
          {category}
        </span>

        <button
          type="button"
          className={`api-card-save-button ${saved ? "saved" : ""}`}
          onClick={handleSave}
          aria-label={saved ? `Unsave ${name}` : `Save ${name}`}
          title={saved ? "Remove from saved APIs" : "Save API"}
          style={{
            marginLeft: "auto",
            width: "34px",
            height: "34px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9px",
            border: saved
              ? "1px solid rgba(99,102,241,0.55)"
              : "1px solid rgba(148,163,184,0.25)",
            background: saved
              ? "rgba(79,70,229,0.18)"
              : "rgba(255,255,255,0.04)",
            color: saved ? "#a5b4fc" : "#94a3b8",
            cursor: "pointer",
          }}
        >
          {saved ? <Check size={16} /> : <Bookmark size={16} />}
        </button>
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
