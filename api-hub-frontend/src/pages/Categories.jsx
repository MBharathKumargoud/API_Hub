import { useMemo } from "react";
import { ArrowLeft, Bookmark, Check, ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import CategoryCard from "../components/CategoryCard";
import ApiCard from "../components/ApiCard";
import apiData from "../data/apiData";
import { useSavedApis } from "../utils/savedApis";

import {
  Brain,
  CloudSun,
  Map,
  Landmark,
  CreditCard,
  Newspaper,
  ShoppingCart,
  ShieldCheck,
  Code2,
} from "lucide-react";

const categoryConfig = [
  {
    name: "AI / ML",
    description: "Artificial intelligence and machine learning APIs",
    color: "category-purple",
    icon: <Brain size={26} />,
  },
  {
    name: "Weather",
    description: "Weather forecasts, conditions and climate data",
    color: "category-blue",
    icon: <CloudSun size={26} />,
  },
  {
    name: "Maps",
    description: "Maps, locations, geocoding and navigation APIs",
    color: "category-green",
    icon: <Map size={26} />,
  },
  {
    name: "Finance",
    description: "Financial markets, stocks, banking and currency APIs",
    color: "category-emerald",
    icon: <Landmark size={26} />,
  },
  {
    name: "Payment",
    description: "Payment processing and transaction APIs",
    color: "category-orange",
    icon: <CreditCard size={26} />,
  },
  {
    name: "News",
    description: "News, articles and current events APIs",
    color: "category-red",
    icon: <Newspaper size={26} />,
  },
  {
    name: "E-commerce",
    description: "Products, stores and shopping APIs",
    color: "category-pink",
    icon: <ShoppingCart size={26} />,
  },
  {
    name: "Security",
    description: "Security, verification and protection APIs",
    color: "category-yellow",
    icon: <ShieldCheck size={26} />,
  },
  {
    name: "Developer Tools",
    description: "Useful APIs for developers and applications",
    color: "category-cyan",
    icon: <Code2 size={26} />,
  },
];

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category");
  const currentView = searchParams.get("view") || "categories";

  const { savedApis, toggleSave } = useSavedApis();

  const categoryApis = useMemo(() => {
    if (!selectedCategory) return [];

    return apiData.filter(
      (api) => api.category === selectedCategory
    );
  }, [selectedCategory]);

  const categoryInfo = categoryConfig.find(
    (category) => category.name === selectedCategory
  );

  const openCategory = (categoryName) => {
    navigate(
      `/categories?category=${encodeURIComponent(
        categoryName
      )}&view=compare`
    );
  };

  const showAllApis = () => {
    navigate(
      `/categories?category=${encodeURIComponent(
        selectedCategory
      )}&view=all`
    );
  };

  const goBack = () => {
    if (currentView === "all") {
      navigate(
        `/categories?category=${encodeURIComponent(
          selectedCategory
        )}&view=compare`
      );
      return;
    }

    navigate("/categories");
  };

  /*
   * We currently don't have pricing/free-tier fields
   * inside apiData.js.
   *
   * Therefore we display "Not specified" instead of
   * inventing pricing information.
   */
  const getFreeTier = (api) => {
    return api.freeTier || api.freeTierLimit || "Not specified";
  };

  const getPricing = (api) => {
    return api.pricing || api.pricingType || "Not specified";
  };

  /*
   * Simple starting recommendation:
   * Prefer an API that does not require authentication.
   * Otherwise use the first API in the category.
   *
   * This can later be replaced with a proper recommendation
   * system when pricing/free-tier data is added.
   */
  const recommendedApi =
    categoryApis.find(
      (api) =>
        api.authentication?.toLowerCase() === "none"
    ) || categoryApis[0];

  if (currentView === "all" && selectedCategory) {
    return (
      <div className="categories-page">
        <Navbar />

        <main className="categories-main">
          <button
            type="button"
            className="categories-back-button"
            onClick={goBack}
          >
            <ArrowLeft size={18} />
            Back to Comparison
          </button>

          <section className="categories-all-header">
            <div>
              <span className="categories-eyebrow">
                API DIRECTORY
              </span>

              <h1>
                All {selectedCategory} APIs
              </h1>

              <p>
                Explore all available {selectedCategory} APIs
                in API Hub.
              </p>
            </div>

            <span className="categories-api-count">
              {categoryApis.length} APIs
            </span>
          </section>

          <section className="categories-api-grid">
            {categoryApis.map((api) => (
              <div
                className="categories-api-card-wrapper"
                key={api.id}
              >
                <button
                  type="button"
                  className={`categories-save-button ${
                    savedApis.includes(api.id)
                      ? "saved"
                      : ""
                  }`}
                  onClick={() => toggleSave(api.id)}
                  aria-label={
                    savedApis.includes(api.id)
                      ? "Remove saved API"
                      : "Save API"
                  }
                >
                  {savedApis.includes(api.id) ? (
                    <Check size={17} />
                  ) : (
                    <Bookmark size={17} />
                  )}
                </button>

                <ApiCard
                  {...api}
                  onClick={() =>
                    navigate(`/api/${api.id}`)
                  }
                />
              </div>
            ))}
          </section>
        </main>
      </div>
    );
  }

  if (currentView === "compare" && selectedCategory) {
    return (
      <div className="categories-page">
        <Navbar />

        <main className="categories-main">
          <button
            type="button"
            className="categories-back-button"
            onClick={goBack}
          >
            <ArrowLeft size={18} />
            All Categories
          </button>

          <section className="categories-compare-header">
            <span className="categories-eyebrow">
              CATEGORY COMPARISON
            </span>

            <h1>{selectedCategory} APIs</h1>

            <p>
              Compare the available APIs and choose the
              one that best fits your requirements.
            </p>
          </section>

          <section className="categories-comparison-section">
            <div className="categories-table-wrapper">
              <table className="categories-comparison-table">
                <thead>
                  <tr>
                    <th>API</th>
                    <th>Provider</th>
                    <th>Authentication</th>
                    <th>Free Tier / Limit</th>
                    <th>Pricing</th>
                  </tr>
                </thead>

                <tbody>
                  {categoryApis.map((api) => (
                    <tr key={api.id}>
                      <td>
                        <div className="comparison-api-name">
                          <span
                            className="comparison-api-icon"
                            style={{
                              backgroundColor:
                                api.color,
                            }}
                          >
                            {api.icon}
                          </span>

                          <div>
                            <strong>{api.name}</strong>
                            <span>
                              {api.description}
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`comparison-save-button ${
                              savedApis.includes(api.id)
                                ? "saved"
                                : ""
                            }`}
                            onClick={() =>
                              toggleSave(api.id)
                            }
                            aria-label="Save API"
                          >
                            {savedApis.includes(api.id) ? (
                              <Check size={16} />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td>{api.provider}</td>

                      <td>
                        <span className="comparison-badge">
                          {api.authentication}
                        </span>
                      </td>

                      <td>{getFreeTier(api)}</td>

                      <td>{getPricing(api)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {recommendedApi && (
            <section className="categories-recommendation">
              <div className="recommendation-content">
                <span className="categories-eyebrow">
                  RECOMMENDED
                </span>

                <h2>
                  Our recommended{" "}
                  {selectedCategory} API
                </h2>

                <div className="recommendation-api">
                  <div
                    className="recommendation-icon"
                    style={{
                      backgroundColor:
                        recommendedApi.color,
                    }}
                  >
                    {recommendedApi.icon}
                  </div>

                  <div className="recommendation-info">
                    <h3>{recommendedApi.name}</h3>

                    <p>
                      {recommendedApi.description}
                    </p>

                    <span>
                      Authentication:{" "}
                      {recommendedApi.authentication}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`recommendation-save ${
                      savedApis.includes(
                        recommendedApi.id
                      )
                        ? "saved"
                        : ""
                    }`}
                    onClick={() =>
                      toggleSave(recommendedApi.id)
                    }
                  >
                    {savedApis.includes(
                      recommendedApi.id
                    ) ? (
                      <>
                        <Check size={17} />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={17} />
                        Save
                      </>
                    )}
                  </button>
                </div>

                <div className="recommendation-why">
                  <strong>Why we recommend it</strong>

                  <p>
                    {recommendedApi.authentication?.toLowerCase() ===
                    "none"
                      ? "This API does not require authentication according to the current API Hub data, making it a simple option to get started."
                      : "This API is currently one of the available options in this category. Review its details, authentication requirements and pricing before integrating it."}
                  </p>
                </div>

                <button
                  type="button"
                  className="recommendation-view-button"
                  onClick={() =>
                    navigate(
                      `/api/${recommendedApi.id}`
                    )
                  }
                >
                  View API
                  <ChevronRight size={18} />
                </button>
              </div>
            </section>
          )}

          <section className="categories-see-all">
            <div>
              <h2>
                Want to explore all {selectedCategory} APIs?
              </h2>

              <p>
                View every API available in this category.
              </p>
            </div>

            <button
              type="button"
              onClick={showAllApis}
              className="categories-see-all-button"
            >
              See All {selectedCategory} APIs
              <ChevronRight size={18} />
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <Navbar />

      <main className="categories-main">
        <section className="categories-hero">
          <span className="categories-eyebrow">
            API HUB CATEGORIES
          </span>

          <h1>Find the right API for your project</h1>

          <p>
            Explore APIs by category, compare your options,
            and find the right API before you integrate it.
          </p>
        </section>

        <section className="categories-grid">
          {categoryConfig.map((category) => {
            const count = apiData.filter(
              (api) => api.category === category.name
            ).length;

            return (
              <CategoryCard
                key={category.name}
                name={category.name}
                description={category.description}
                icon={category.icon}
                color={category.color}
                apiCount={count}
                onClick={() =>
                  openCategory(category.name)
                }
              />
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Categories;