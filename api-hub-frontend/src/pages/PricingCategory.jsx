import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gift,
  Sparkles,
  CircleDollarSign,
  ArrowRight,
  Check,
  CreditCard,
  CloudSun,
  CloudRain,
  Newspaper,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";

const FREE_API_IDS = ["ebay-api", "jsonplaceholder", "httpbin", "nasa"];

const PAID_API_IDS = [
  "openai",
  "anthropic-claude",
  "replicate",
  "google-maps",
  "mapbox",
  "alpha-vantage",
  "finnhub",
  "polygon",
  "stripe",
  "paypal",
  "razorpay",
  "adyen",
  "square",
  "shopify",
  "bigcommerce",
  "twelve-data",
];

function pricingType(api) {
  if (FREE_API_IDS.includes(api.id)) return "free";
  if (PAID_API_IDS.includes(api.id)) return "paid";
  return "freemium";
}

const popularIconMap = {
  CloudSun,
  CloudRain,
  Newspaper,
  CreditCard,
};

function renderPopularIcon(iconName) {
  const Icon = popularIconMap[iconName];

  if (!Icon) {
    return null;
  }

  return <Icon size={14} strokeWidth={2} />;
}

function Pricing() {
  const navigate = useNavigate();

  const groups = useMemo(() => ({
    free: apiData.filter((api) => pricingType(api) === "free"),
    freemium: apiData.filter((api) => pricingType(api) === "freemium"),
    paid: apiData.filter((api) => pricingType(api) === "paid"),
  }), []);

  const openPricingGroup = (type) => {
    navigate(`/pricing/${type}`);
  };

  const popularApis = [
    apiData.find((api) => api.id === "openweather"),
    apiData.find((api) => api.id === "weatherapi"),
    apiData.find((api) => api.id === "news-api"),
    apiData.find((api) => api.id === "stripe"),
  ].filter(Boolean);

  return (
    <div className="pricing-landing-page">
      <style>{`
        .pricing-landing-page {
          min-height: 100vh;
          background: #f7f9fc;
          color: #111827;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .pricing-landing-main {
          width: min(1120px, calc(100% - 48px));
          margin: 0 auto;
          padding: 58px 0 80px;
        }

        .pricing-landing-hero {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 42px;
        }

        .pricing-landing-eyebrow {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4f46e5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
        }

        .pricing-landing-hero h1 {
          margin: 14px 0 12px;
          color: #111827;
          font-family: Inter, system-ui, sans-serif;
          font-size: clamp(38px, 4.6vw, 56px);
          line-height: 1.04;
          letter-spacing: -.045em;
          font-weight: 800;
        }

        .pricing-landing-hero h1 span {
          color: #4f46e5;
        }

        .pricing-landing-hero p {
          max-width: 650px;
          margin: 0 auto;
          color: #64748b;
          font-size: 14px;
          line-height: 1.65;
        }

        .pricing-landing-stats {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .pricing-landing-stat {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 13px;
          border: 1px solid #dce3ed;
          border-radius: 10px;
          background: #fff;
          color: #64748b;
          font-size: 11px;
        }

        .pricing-landing-stat svg {
          color: #4f46e5;
        }

        .pricing-landing-stat strong {
          color: #111827;
          font-size: 12px;
        }

        .pricing-choice-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .pricing-choice-card {
          position: relative;
          min-height: 174px;
          padding: 20px;
          border: 1px solid #dce3ed;
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          text-align: left;
          transition: .2s ease;
        }

        .pricing-choice-card:hover {
          transform: translateY(-3px);
          border-color: #8b83ff;
          box-shadow: 0 14px 35px rgba(79,70,229,.10);
        }

        .pricing-choice-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: #fff;
          margin-bottom: 12px;
        }

        .pricing-choice-free .pricing-choice-icon { background: #16b981; }
        .pricing-choice-freemium .pricing-choice-icon { background: #7c3aed; }
        .pricing-choice-paid .pricing-choice-icon { background: #f15b4f; }

        .pricing-choice-card h2 {
          margin: 0 0 5px;
          color: #111827;
          font-size: 16px;
          font-weight: 800;
        }

        .pricing-choice-card p {
          margin: 0;
          max-width: 250px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.55;
        }

        .pricing-choice-count {
          position: absolute;
          left: 20px;
          bottom: 18px;
          color: #4f46e5;
          font-size: 10px;
          font-weight: 700;
        }

        .pricing-choice-arrow {
          position: absolute;
          right: 18px;
          bottom: 15px;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eef2ff;
          color: #4f46e5;
        }

        .pricing-bottom-grid {
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 18px;
          margin-top: 22px;
        }

        .pricing-popular,
        .pricing-guide {
          border: 1px solid #dce3ed;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
        }

        .pricing-panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 17px;
          border-bottom: 1px solid #edf1f5;
        }

        .pricing-panel-heading h2 {
          margin: 0;
          color: #111827;
          font-size: 13px;
          font-weight: 800;
        }

        .pricing-panel-heading span {
          color: #4f46e5;
          font-size: 10px;
          font-weight: 700;
        }

        .pricing-popular-list {
          padding: 4px 12px;
        }

        .pricing-popular-row {
          display: grid;
          grid-template-columns: 1.2fr .8fr .75fr .65fr .7fr;
          align-items: center;
          min-height: 46px;
          border-bottom: 1px solid #edf1f5;
          gap: 8px;
          font-size: 9px;
        }

        .pricing-popular-row:last-child {
          border-bottom: 0;
        }

        .pricing-popular-name {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
        }

        .pricing-popular-icon {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          flex: 0 0 24px;
          border-radius: 6px;
          background: #eef2ff;
          color: #4f46e5;
          overflow: hidden;
          line-height: 0;
        }

        .pricing-popular-icon svg {
          display: block;
          flex: 0 0 auto;
        }

        .pricing-popular-name strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #1f2937;
        }

        .pricing-popular-row span {
          color: #64748b;
        }

        .pricing-mini-badge {
          width: max-content;
          padding: 3px 6px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #059669 !important;
          font-size: 8px;
          font-weight: 800;
        }

        .pricing-mini-badge.paid {
          background: #fff1f2;
          color: #e11d48 !important;
        }

        .pricing-mini-view {
          justify-self: end;
          border: 0;
          background: transparent;
          color: #4f46e5;
          font-size: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .pricing-guide-content {
          padding: 16px 17px;
        }

        .pricing-guide-item {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 14px;
        }

        .pricing-guide-item:last-child {
          margin-bottom: 0;
        }

        .pricing-guide-check {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          flex: 0 0 22px;
          border-radius: 6px;
          background: #eef2ff;
          color: #4f46e5;
        }

        .pricing-guide-item strong {
          display: block;
          margin-bottom: 2px;
          color: #1f2937;
          font-size: 10px;
        }

        .pricing-guide-item p {
          margin: 0;
          color: #64748b;
          font-size: 9px;
          line-height: 1.45;
        }

        html.dark-theme .pricing-landing-page,
        html[data-theme="dark"] .pricing-landing-page,
        body.dark-theme .pricing-landing-page {
          background: #0d1117;
          color: #f0f6fc;
        }

        html.dark-theme .pricing-landing-hero h1,
        html[data-theme="dark"] .pricing-landing-hero h1,
        body.dark-theme .pricing-landing-hero h1,
        html.dark-theme .pricing-choice-card h2,
        html[data-theme="dark"] .pricing-choice-card h2,
        body.dark-theme .pricing-choice-card h2,
        html.dark-theme .pricing-panel-heading h2,
        html[data-theme="dark"] .pricing-panel-heading h2,
        body.dark-theme .pricing-panel-heading h2,
        html.dark-theme .pricing-popular-name strong,
        html[data-theme="dark"] .pricing-popular-name strong,
        body.dark-theme .pricing-popular-name strong,
        html.dark-theme .pricing-guide-item strong,
        html[data-theme="dark"] .pricing-guide-item strong,
        body.dark-theme .pricing-guide-item strong {
          color: #f0f6fc;
        }

        html.dark-theme .pricing-landing-hero p,
        html[data-theme="dark"] .pricing-landing-hero p,
        body.dark-theme .pricing-landing-hero p,
        html.dark-theme .pricing-choice-card p,
        html[data-theme="dark"] .pricing-choice-card p,
        body.dark-theme .pricing-choice-card p,
        html.dark-theme .pricing-popular-row span,
        html[data-theme="dark"] .pricing-popular-row span,
        body.dark-theme .pricing-popular-row span,
        html.dark-theme .pricing-guide-item p,
        html[data-theme="dark"] .pricing-guide-item p,
        body.dark-theme .pricing-guide-item p {
          color: #8b949e;
        }

        html.dark-theme .pricing-landing-stat,
        html[data-theme="dark"] .pricing-landing-stat,
        body.dark-theme .pricing-landing-stat,
        html.dark-theme .pricing-choice-card,
        html[data-theme="dark"] .pricing-choice-card,
        body.dark-theme .pricing-choice-card,
        html.dark-theme .pricing-popular,
        html[data-theme="dark"] .pricing-popular,
        body.dark-theme .pricing-popular,
        html.dark-theme .pricing-guide,
        html[data-theme="dark"] .pricing-guide,
        body.dark-theme .pricing-guide {
          background: #161b22;
          border-color: #30363d;
        }

        html.dark-theme .pricing-panel-heading,
        html[data-theme="dark"] .pricing-panel-heading,
        body.dark-theme .pricing-panel-heading,
        html.dark-theme .pricing-popular-row,
        html[data-theme="dark"] .pricing-popular-row,
        body.dark-theme .pricing-popular-row {
          border-color: #30363d;
        }

        @media (max-width: 850px) {
          .pricing-choice-grid,
          .pricing-bottom-grid {
            grid-template-columns: 1fr;
          }

          .pricing-popular-row {
            grid-template-columns: 1.5fr 1fr .8fr;
          }

          .pricing-popular-row > span:nth-child(3),
          .pricing-popular-row > span:nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .pricing-landing-main {
            width: min(100% - 24px, 1120px);
            padding-top: 35px;
          }

          .pricing-landing-hero h1 {
            font-size: 38px;
          }

          .pricing-choice-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Navbar />

      <main className="pricing-landing-main">
        <section className="pricing-landing-hero">
          <span className="pricing-landing-eyebrow">
            PRICING GUIDE
          </span>

          <h1>
            Find APIs that fit
            <br />
            <span>your budget.</span>
          </h1>

          <p>
            Compare free, freemium and paid APIs.
            Understand usage limits, features and choose
            the best option for your project.
          </p>

          <div className="pricing-landing-stats">
            <div className="pricing-landing-stat">
              <CircleDollarSign size={15} />
              <strong>{apiData.length}</strong> APIs
            </div>

            <div className="pricing-landing-stat">
              <Gift size={15} />
              <strong>{groups.free.length}</strong> Free
            </div>

            <div className="pricing-landing-stat">
              <Sparkles size={15} />
              <strong>{groups.freemium.length}</strong> Freemium
            </div>

            <div className="pricing-landing-stat">
              <CreditCard size={15} />
              <strong>{groups.paid.length}</strong> Paid
            </div>
          </div>
        </section>

        <section className="pricing-choice-grid">
          <button
            type="button"
            className="pricing-choice-card pricing-choice-free"
            onClick={() => openPricingGroup("free")}
          >
            <div className="pricing-choice-icon">
              <Gift size={20} />
            </div>
            <h2>Free APIs</h2>
            <p>
              Completely free to use with no paid plans
              required.
            </p>
            <span className="pricing-choice-count">
              {groups.free.length} APIs
            </span>
            <span className="pricing-choice-arrow">
              <ArrowRight size={15} />
            </span>
          </button>

          <button
            type="button"
            className="pricing-choice-card pricing-choice-freemium"
            onClick={() => openPricingGroup("freemium")}
          >
            <div className="pricing-choice-icon">
              <Sparkles size={20} />
            </div>
            <h2>Freemium APIs</h2>
            <p>
              Free usage with limits, plus paid plans for
              higher usage.
            </p>
            <span className="pricing-choice-count">
              {groups.freemium.length} APIs
            </span>
            <span className="pricing-choice-arrow">
              <ArrowRight size={15} />
            </span>
          </button>

          <button
            type="button"
            className="pricing-choice-card pricing-choice-paid"
            onClick={() => openPricingGroup("paid")}
          >
            <div className="pricing-choice-icon">
              <CircleDollarSign size={20} />
            </div>
            <h2>Paid APIs</h2>
            <p>
              Primarily require a paid plan or paid usage
              for production access.
            </p>
            <span className="pricing-choice-count">
              {groups.paid.length} APIs
            </span>
            <span className="pricing-choice-arrow">
              <ArrowRight size={15} />
            </span>
          </button>
        </section>

        <section className="pricing-bottom-grid">
          <div className="pricing-popular">
            <div className="pricing-panel-heading">
              <h2>Popular APIs and their Pricing</h2>
              <span>View All</span>
            </div>

            <div className="pricing-popular-list">
              {popularApis.map((api) => {
                const type = pricingType(api);

                return (
                  <div
                    className="pricing-popular-row"
                    key={api.id}
                  >
                    <div className="pricing-popular-name">
                      <span className="pricing-popular-icon">
                        {renderPopularIcon(api.icon)}
                      </span>
                      <strong>{api.name}</strong>
                    </div>

                    <span>{api.provider}</span>
                    <span>{api.category}</span>
                    <span>{api.pricing}</span>

                    <span
                      className={`pricing-mini-badge ${
                        type === "paid" ? "paid" : ""
                      }`}
                    >
                      {type === "free"
                        ? "Free"
                        : type === "paid"
                        ? "Paid"
                        : "Freemium"}
                    </span>

                    <button
                      type="button"
                      className="pricing-mini-view"
                      onClick={() =>
                        navigate(`/api/${api.id}`)
                      }
                    >
                      View API →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pricing-guide">
            <div className="pricing-panel-heading">
              <h2>Pricing Guide</h2>
            </div>

            <div className="pricing-guide-content">
              <div className="pricing-guide-item">
                <span className="pricing-guide-check">
                  <Gift size={13} />
                </span>
                <div>
                  <strong>Understand API Pricing</strong>
                  <p>
                    Check free limits and paid usage before
                    integrating an API.
                  </p>
                </div>
              </div>

              <div className="pricing-guide-item">
                <span className="pricing-guide-check">
                  <Sparkles size={13} />
                </span>
                <div>
                  <strong>Choose the Right Plan</strong>
                  <p>
                    Pick free, freemium or paid based on
                    your project needs.
                  </p>
                </div>
              </div>

              <div className="pricing-guide-item">
                <span className="pricing-guide-check">
                  <CircleDollarSign size={13} />
                </span>
                <div>
                  <strong>Compare Pricing</strong>
                  <p>
                    Compare limits and pricing before
                    choosing a provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Pricing;