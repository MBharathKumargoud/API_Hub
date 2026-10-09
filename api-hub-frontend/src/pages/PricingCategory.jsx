import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";

const FREE_API_IDS = [
  "ebay-api",
  "jsonplaceholder",
  "httpbin",
  "nasa",
];

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

const getPricingType = (api) => {
  if (FREE_API_IDS.includes(api.id)) return "free";
  if (PAID_API_IDS.includes(api.id)) return "paid";
  return "freemium";
};

const titles = {
  free: {
    eyebrow: "PRICING • FREE APIs",
    title: "Free APIs",
    description:
      "Explore completely free APIs. No paid plans required.",
  },
  freemium: {
    eyebrow: "PRICING • FREEMIUM APIs",
    title: "Freemium APIs",
    description:
      "Free usage with paid plans for higher usage.",
  },
  paid: {
    eyebrow: "PRICING • PAID APIs",
    title: "Paid APIs",
    description:
      "APIs that primarily require a paid plan for usage.",
  },
};

function PricingCategory() {
  const { type = "free" } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const config = titles[type] || titles.free;

  const apis = useMemo(() => {
    return apiData.filter(
      (api) => getPricingType(api) === type
    );
  }, [type]);

  const categories = useMemo(() => {
    const counts = {};

    apis.forEach((api) => {
      counts[api.category] = (counts[api.category] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }, [apis]);

  const filteredApis = useMemo(() => {
    const query = search.trim().toLowerCase();

    return apis.filter((api) => {
      const matchesCategory =
        activeCategory === "All" ||
        api.category === activeCategory;

      const matchesSearch =
        !query ||
        api.name.toLowerCase().includes(query) ||
        api.provider.toLowerCase().includes(query) ||
        api.description.toLowerCase().includes(query) ||
        api.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [apis, activeCategory, search]);

  return (
    <div className="pricing-directory-page">
      <Navbar />

      <main className="pricing-directory-main">
        <button
          type="button"
          className="pricing-directory-back"
          onClick={() => navigate("/pricing")}
        >
          <ArrowLeft size={16} />
          Back to Pricing
        </button>

        <section className="pricing-directory-header">
          <div>
            <span className="pricing-directory-eyebrow">
              {config.eyebrow}
            </span>

            <h1>{config.title}</h1>

            <p>{config.description}</p>
          </div>

          <span className="pricing-directory-count">
            {apis.length} APIs
          </span>
        </section>

        <div className="pricing-directory-toolbar">
          <div className="pricing-directory-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={`Search ${config.title}...`}
            />
          </div>

          <button
            type="button"
            className="pricing-directory-filter"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="pricing-directory-layout">
          <aside className="pricing-directory-sidebar">
            <h3>Filter by Category</h3>

            <button
              type="button"
              className={
                activeCategory === "All"
                  ? "active"
                  : ""
              }
              onClick={() => setActiveCategory("All")}
            >
              <span>All</span>
              <b>{apis.length}</b>
            </button>

            {categories.map(([category, count]) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveCategory(category)
                }
              >
                <span>{category}</span>
                <b>{count}</b>
              </button>
            ))}
          </aside>

          <section className="pricing-directory-results">
            {filteredApis.length > 0 ? (
              <div className="pricing-directory-grid">
                {filteredApis.map((api) => (
                  <article
                    className="pricing-directory-card"
                    key={api.id}
                  >
                    <div className="pricing-directory-card-top">
                      <div
                        className={`pricing-directory-api-icon ${
                          api.color || ""
                        }`}
                      >
                        {api.icon}
                      </div>

                      <span>
                        {api.category}
                      </span>
                    </div>

                    <h2>{api.name}</h2>

                    <p>{api.description}</p>

                    <div className="pricing-directory-badges">
                      <span>{api.category}</span>

                      <strong>
                        {type === "free"
                          ? "Free"
                          : type === "freemium"
                          ? "Freemium"
                          : "Paid"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/api/${api.id}`)
                      }
                    >
                      View API
                      <ArrowRight size={15} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="pricing-directory-empty">
                No APIs found.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PricingCategory;
