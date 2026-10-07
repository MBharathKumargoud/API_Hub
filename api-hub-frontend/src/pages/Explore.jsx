import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Bot,
  Cloud,
  MapPin,
  CreditCard,
  TrendingUp,
  Newspaper,
  ShoppingCart,
  Shield,
  Code2,
  X,
  Check,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";
import ApiCard from "../components/ApiCard";

const iconMap = {
  Bot,
  Cloud,
  MapPin,
  CreditCard,
  TrendingUp,
  Newspaper,
  ShoppingCart,
  Shield,
  Code2,
};

const categories = [
  { name: "All" },
  { name: "AI / ML", icon: <Bot size={16} /> },
  { name: "Weather", icon: <Cloud size={16} /> },
  { name: "Maps", icon: <MapPin size={16} /> },
  { name: "Finance", icon: <TrendingUp size={16} /> },
  { name: "Payment", icon: <CreditCard size={16} /> },
  { name: "News", icon: <Newspaper size={16} /> },
  { name: "E-commerce", icon: <ShoppingCart size={16} /> },
  { name: "Security", icon: <Shield size={16} /> },
  { name: "Developer Tools", icon: <Code2 size={16} /> },
];

function Explore() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState("All");

  const providers = useMemo(() => {
    return [
      "All",
      ...new Set(apiData.map((api) => api.provider).filter(Boolean)),
    ];
  }, []);

  const authenticationTypes = useMemo(() => {
    return [
      "All",
      ...new Set(
        apiData.map((api) => api.authentication).filter(Boolean)
      ),
    ];
  }, []);

  const filteredApis = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return apiData.filter((api) => {
      const matchesCategory =
        activeCategory === "All" || api.category === activeCategory;

      const matchesSearch =
        search === "" ||
        [api.name, api.provider, api.category, api.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));

      const matchesAuth =
        selectedAuth === "All" ||
        api.authentication === selectedAuth;

      const matchesProvider =
        selectedProvider === "All" ||
        api.provider === selectedProvider;

      return (
        matchesCategory &&
        matchesSearch &&
        matchesAuth &&
        matchesProvider
      );
    });
  }, [
    activeCategory,
    searchTerm,
    selectedAuth,
    selectedProvider,
  ]);

  const hasActiveFilters =
    selectedAuth !== "All" || selectedProvider !== "All";

  // Do not show all 50 APIs on first load.
  // Results appear when the user searches, selects a category,
  // or applies a filter.
  const shouldShowResults =
    searchTerm.trim() !== "" ||
    activeCategory !== "All" ||
    hasActiveFilters;

  // Show a small curated set on first load instead of all 50 APIs.
  // Searching/filtering still uses the complete 50-API dataset.
  const featuredApis = apiData.slice(0, 6);

  const resetFilters = () => {
    setSelectedAuth("All");
    setSelectedProvider("All");
    setActiveCategory("All");
    setSearchTerm("");
    setShowFilters(false);
  };

  const getApiIcon = (api) => {
    const Icon = iconMap[api.icon] || Code2;
    return <Icon size={25} />;
  };

  return (
    <div className="discover-page">
      <Navbar />

      <main className="discover-main">
        <section className="discover-hero">
          <div className="discover-eyebrow">
            <span></span>
            API DIRECTORY
          </div>

          <h1>
            Discover the right
            <br />
            <span>API for your project.</span>
          </h1>

          <p>
            Explore APIs from multiple providers, compare
            their capabilities and find the perfect tools
            for your next application.
          </p>

          <div className="discover-search">
            <Search size={21} />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
              }}
              placeholder="Search APIs, providers or categories..."
              aria-label="Search APIs"
            />

            {searchTerm && (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={
                showFilters || hasActiveFilters ? "filter-active" : ""
              }
            >
              <SlidersHorizontal size={18} />
              Filters
              {hasActiveFilters && (
                <span className="filter-count">•</span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="explore-filter-panel">
              <div className="explore-filter-header">
                <div>
                  <span>FILTERS</span>
                  <h3>Refine your search</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="filter-close-button"
                  aria-label="Close filters"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="filter-group">
                <label>Category</label>

                <div className="filter-options">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.name}
                      className={
                        activeCategory === category.name ? "selected" : ""
                      }
                      onClick={() => setActiveCategory(category.name)}
                    >
                      {category.icon}
                      <span>{category.name}</span>

                      {activeCategory === category.name && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Authentication</label>

                <div className="filter-options">
                  {authenticationTypes.map((auth) => (
                    <button
                      type="button"
                      key={auth}
                      className={
                        selectedAuth === auth ? "selected" : ""
                      }
                      onClick={() => setSelectedAuth(auth)}
                    >
                      <span>{auth}</span>
                      {selectedAuth === auth && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Provider</label>

                <div className="filter-options">
                  {providers.map((provider) => (
                    <button
                      type="button"
                      key={provider}
                      className={
                        selectedProvider === provider ? "selected" : ""
                      }
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <span>{provider}</span>
                      {selectedProvider === provider && (
                        <Check size={14} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="explore-filter-footer">
                <button
                  type="button"
                  className="filter-reset"
                  onClick={resetFilters}
                >
                  Reset all
                </button>

                <button
                  type="button"
                  className="filter-apply"
                  onClick={() => setShowFilters(false)}
                >
                  Show {filteredApis.length} APIs
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="discover-categories">
          <div className="discover-section-title">
            <div>
              <span>EXPLORE</span>
              <h2>Categories</h2>
            </div>

            <p>Find APIs by what you want to build.</p>
          </div>

          <div className="discover-category-list">
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                className={`discover-category ${
                  activeCategory === category.name ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.name)}
              >
                {category.icon}
                <span>{category.name}</span>
                <small>
                  {category.name === "All"
                    ? apiData.length
                    : apiData.filter(
                        (api) => api.category === category.name
                      ).length}
                </small>
              </button>
            ))}
          </div>
        </section>

        <section className="api-directory">
          <div className="directory-heading">
            <div>
              <span>API DIRECTORY</span>
              <h2>
                {shouldShowResults
                  ? activeCategory === "All"
                    ? "Search results"
                    : activeCategory
                  : "Popular APIs"}
              </h2>
            </div>

            <span className="api-count">
              {shouldShowResults ? filteredApis.length : featuredApis.length} APIs
            </span>
          </div>

          {shouldShowResults ? (
            filteredApis.length > 0 ? (
              <div className="api-grid">
                {filteredApis.map((api) => (
                  <ApiCard
                    key={api.id}
                    name={api.name}
                    category={api.category}
                    description={api.description}
                    icon={getApiIcon(api)}
                    color={api.color}
                    provider={api.provider}
                    onClick={() => navigate(`/api/${api.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="discover-no-results">
                <Search size={34} />
                <h3>No APIs found</h3>
                <p>
                  Try another search term or change your filters.
                </p>
                <button type="button" onClick={resetFilters}>
                  Clear all filters
                </button>
              </div>
            )
          ) : (
            <>
              <div className="api-grid">
                {featuredApis.map((api) => (
                  <ApiCard
                    key={api.id}
                    name={api.name}
                    category={api.category}
                    description={api.description}
                    icon={getApiIcon(api)}
                    color={api.color}
                    provider={api.provider}
                    onClick={() => navigate(`/api/${api.id}`)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Explore;
