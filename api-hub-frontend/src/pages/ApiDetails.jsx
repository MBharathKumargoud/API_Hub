import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Code2,
  Globe,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";

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

  const api = useMemo(
    () => apiData.find((item) => item.id === apiName),
    [apiName]
  );

  if (!api) {
    return (
      <div className="api-details-page-wrapper">
        <Navbar />

        <main className="api-details-page">
          <div className="api-details-main">
            <button
              type="button"
              className="api-back-button"
              onClick={() => navigate("/explore")}
            >
              <ArrowLeft size={17} />
              Back to Explore
            </button>

            <section className="api-info-panel">
              <span className="api-panel-label">API NOT FOUND</span>
              <h2>We couldn't find that API.</h2>
              <p>
                The API may have been removed or the URL is incorrect.
              </p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  const ApiIcon = categoryIcons[api.category] || Code2;

  const documentationUrl = api.documentation || api.website;
  const websiteUrl = api.website || api.documentation;

  const features = [
    `Category: ${api.category}`,
    `Provider: ${api.provider}`,
    api.authentication
      ? `Authentication: ${api.authentication}`
      : "Authentication information available from provider",
    "Developer documentation",
  ];

  return (
    <div className="api-details-page-wrapper">
      <Navbar />

      <main className="api-details-page">
        <div className="api-details-main">
          <button
            type="button"
            className="api-back-button"
            onClick={() => navigate("/explore")}
          >
            <ArrowLeft size={17} />
            Back to Explore
          </button>

          <section className="api-details-hero">
            <div
              className={`api-details-icon ${api.color || ""}`}
            >
              <ApiIcon size={36} />
            </div>

            <div className="api-details-heading">
              <span className="api-details-category">
                {api.category}
              </span>

              <h1>{api.name}</h1>

              <p>{api.description}</p>

              <div className="api-provider">
                <span>Provided by</span>
                <strong>{api.provider}</strong>
              </div>
            </div>

            <div className="api-details-actions">
              {documentationUrl && (
                <a
                  href={documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-test-button"
                >
                  <Code2 size={17} />
                  View Documentation
                  <ExternalLink size={15} />
                </a>
              )}

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-website-button"
                >
                  <Globe size={16} />
                  Official Website
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </section>

          <section className="api-details-grid">
            <article className="api-info-panel">
              <span className="api-panel-label">
                ABOUT THIS API
              </span>

              <h2>{api.name}</h2>

              <p>{api.description}</p>

              <div className="api-feature-list">
                {features.map((feature, index) => (
                  <div className="api-feature" key={index}>
                    <CheckCircle2 size={18} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="api-info-panel">
              <span className="api-panel-label">
                API INFORMATION
              </span>

              <div className="api-detail-row">
                <span>Provider</span>
                <strong>{api.provider}</strong>
              </div>

              <div className="api-detail-row">
                <span>Category</span>
                <strong>{api.category}</strong>
              </div>

              <div className="api-detail-row">
                <span>Authentication</span>
                <strong>
                  <ShieldCheck size={15} />
                  {api.authentication || "Not specified"}
                </strong>
              </div>
            </article>
          </section>

          <section className="api-details-grid">
            <article className="api-info-panel">
              <span className="api-panel-label">
                CONNECTION DETAILS
              </span>

              <div className="api-detail-row">
                <span>Base URL</span>
                <code>{api.baseUrl || "Not provided"}</code>
              </div>

              <div className="api-detail-row">
                <span>Documentation</span>
                <strong>
                  <BookOpen size={15} />
                  {documentationUrl
                    ? "Available"
                    : "Not provided"}
                </strong>
              </div>

              {documentationUrl && (
                <a
                  href={documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-doc-button"
                >
                  Open Documentation
                  <ArrowRight size={16} />
                </a>
              )}
            </article>

            <article className="api-info-panel">
              <span className="api-panel-label">
                DEVELOPER ACCESS
              </span>

              <h2>Ready to build?</h2>

              <p>
                Use the official provider resources to create
                credentials, understand authentication and integrate
                this API into your application.
              </p>

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-start-button"
                >
                  Visit Provider Website
                  <ExternalLink size={16} />
                </a>
              )}
            </article>
          </section>

          <section className="api-doc-banner">
            <div>
              <span className="api-panel-label">
                READY TO BUILD?
              </span>

              <h2>Start integrating {api.name}.</h2>

              <p>
                Visit the official developer documentation to create
                credentials, explore endpoints and start building.
              </p>
            </div>

            {documentationUrl && (
              <a
                href={documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="api-doc-button"
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
