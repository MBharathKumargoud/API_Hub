import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  KeyRound,
  Code2,
  Globe,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Check,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";
import { useSavedApis } from "../utils/savedApis";

const categoryIcons = {
  "AI / ML": Code2,
  Weather: Globe,
  Maps: Globe,
  Finance: ArrowRight,
  Payment: ShieldCheck,
  News: BookOpen,
  "E-commerce": Globe,
  Security: ShieldCheck,
  "Developer Tools": Code2,
};

function ApiDetails() {
  const { apiName } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useSavedApis();

  const api = useMemo(
    () => apiData.find((item) => item.id === apiName),
    [apiName]
  );

  const ApiIcon = api
    ? categoryIcons[api.category] || Code2
    : Code2;

  if (!api) {
    return (
      <>
        <Navbar />
        <main className="api-details-page">
          <section className="api-not-found">
            <div className="api-not-found-icon">
              <Code2 size={30} />
            </div>
            <span className="section-label">404</span>
            <h1>API not found</h1>
            <p>
              The API you are looking for does not exist in the API Hub directory.
            </p>
            <button
              type="button"
              className="api-primary-button"
              onClick={() => navigate("/explore")}
            >
              <ArrowLeft size={17} />
              Back to Explore
            </button>
          </section>
        </main>
      </>
    );
  }

  const documentationUrl = api.documentation || api.website;
  const websiteUrl = api.website || api.documentation;
  const saved = isSaved(api.id);

  const features = [
    `Category: ${api.category}`,
    `Provider: ${api.provider}`,
    api.authentication
      ? `Authentication: ${api.authentication}`
      : "Authentication information available from provider",
    api.freeTier ? `Free tier: ${api.freeTier}` : "Free-tier information available from provider",
    api.pricing ? `Pricing: ${api.pricing}` : "Pricing information available from provider",
    "Developer documentation",
  ];

  return (
    <div className="api-details-page-wrapper">
      <Navbar />

      <main className="api-details-page">
        <div className="api-details-container">
          <button
            type="button"
            className="api-back-button"
            onClick={() => navigate("/explore")}
          >
            <ArrowLeft size={17} />
            Back to Explore
          </button>

          <section className="api-details-hero">
            <div className="api-details-hero-left">
              <div className={`api-details-icon ${api.color || ""}`}>
                <ApiIcon size={36} />
              </div>

              <div className="api-details-heading">
                <span className="api-details-category">{api.category}</span>
                <h1>{api.name}</h1>
                <p>{api.description}</p>
              </div>
            </div>

            <div className="api-details-actions">
              <button
                type="button"
                className="api-primary-button"
                onClick={() => toggleSave(api.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {saved ? <Check size={17} /> : <Bookmark size={17} />}
                {saved ? "Saved" : "Save API"}
              </button>

              <button
                type="button"
                className="api-primary-button"
                onClick={() => navigate(`/api/${api.id}/test`)}
              >
                <Code2 size={17} />
                Test API
              </button>

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-secondary-button"
                >
                  Official Site
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </section>

          <section className="api-info-grid">
            <article className="api-info-card">
              <div className="api-info-card-icon">
                <BookOpen size={20} />
              </div>
              <div>
                <span>ABOUT</span>
                <h2>{api.name}</h2>
                <p>{api.description}</p>
              </div>
            </article>

            <article className="api-info-card">
              <div className="api-info-card-icon">
                <KeyRound size={20} />
              </div>
              <div>
                <span>AUTHENTICATION</span>
                <h2>{api.authentication || "API Key"}</h2>
                <p>
                  Check the official documentation for authentication and credential requirements.
                </p>
              </div>
            </article>
          </section>

          <section className="api-details-content">
            <div className="api-main-content">
              <span className="section-label">API OVERVIEW</span>
              <h2>Everything you need to get started.</h2>
              <p>
                {api.name} is available through the provider's developer platform. Use the official
                documentation to learn about available endpoints, parameters, authentication and
                integration options.
              </p>

              <div className="api-feature-list">
                {features.map((feature, index) => (
                  <div className="api-feature" key={index}>
                    <CheckCircle2 size={18} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="api-sidebar-card">
              <span className="section-label">QUICK INFO</span>

              <div className="api-sidebar-row">
                <span>Provider</span>
                <strong>{api.provider}</strong>
              </div>

              <div className="api-sidebar-row">
                <span>Category</span>
                <strong>{api.category}</strong>
              </div>

              <div className="api-sidebar-row">
                <span>Authentication</span>
                <strong>{api.authentication || "API Key"}</strong>
              </div>

              {api.freeTier && (
                <div className="api-sidebar-row">
                  <span>Free Tier</span>
                  <strong>{api.freeTier}</strong>
                </div>
              )}

              {api.pricing && (
                <div className="api-sidebar-row">
                  <span>Pricing</span>
                  <strong>{api.pricing}</strong>
                </div>
              )}

              {api.baseUrl && (
                <div className="api-sidebar-block">
                  <span>Base URL</span>
                  <code>{api.baseUrl}</code>
                </div>
              )}

              {documentationUrl && (
                <a
                  href={documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-doc-link"
                >
                  Open Documentation
                  <ArrowRight size={16} />
                </a>
              )}
            </aside>
          </section>

          <section className="api-documentation-banner">
            <div className="api-documentation-icon">
              <Code2 size={24} />
            </div>

            <div className="api-documentation-content">
              <span className="section-label">READY TO BUILD?</span>
              <h2>Start integrating {api.name}.</h2>
              <p>
                Visit the official developer documentation to create credentials, explore endpoints
                and start building.
              </p>
            </div>

            {documentationUrl && (
              <a
                href={documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="api-primary-button"
              >
                View Documentation
                <ExternalLink size={15} />
              </a>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ApiDetails;
