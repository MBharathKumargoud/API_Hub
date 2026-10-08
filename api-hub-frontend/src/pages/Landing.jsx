import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Search,
  ArrowRight,
  Play,
  Cloud,
  MapPin,
  CreditCard,
  Newspaper,
  ShoppingCart,
  Bot,
  BarChart3,
  Shield,
  Code2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import FloatingApi from "../components/FloatingApi";
import apiData from "../data/apiData";


function Landing() {

  const navigate = useNavigate();

  const [heroPopup, setHeroPopup] = useState(null);

  const popupRef = useRef(null);


  /* =========================================================
     CATEGORIES
     ========================================================= */

  const categoryIcons = {
    "AI / ML": <Bot size={20} />,
    "Weather": <Cloud size={20} />,
    "Maps": <MapPin size={20} />,
    "Finance": <BarChart3 size={20} />,
    "Payment": <CreditCard size={20} />,
    "News": <Newspaper size={20} />,
    "E-commerce": <ShoppingCart size={20} />,
    "Security": <Shield size={20} />,
    "Developer Tools": <Code2 size={20} />,
  };

  const categoryColors = {
    "AI / ML": "purple",
    "Weather": "blue",
    "Maps": "green",
    "Finance": "cyan",
    "Payment": "purple",
    "News": "pink",
    "E-commerce": "orange",
    "Security": "blue",
    "Developer Tools": "purple",
  };

  const categories = Array.from(
    new Set(apiData.map((api) => api.category))
  ).map((name) => ({
    name,
    icon: categoryIcons[name] || <Code2 size={20} />,
    color: categoryColors[name] || "blue",
  }));

  const apiCount = apiData.length;
  const categoryCount = new Set(apiData.map((api) => api.category)).size;
  const providerCount = new Set(apiData.map((api) => api.provider)).size;


  /* =========================================================
     CLOSE POPUP WHEN CLICKING OUTSIDE
     ========================================================= */

  useEffect(() => {

    function handleOutsideClick(event) {

      if (
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {

        setHeroPopup(null);

      }

    }


    if (heroPopup) {

      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );

    }


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, [heroPopup]);


  /* =========================================================
     OPEN EXPLORE PAGE
     ========================================================= */

  const openExplore = (searchQuery = "") => {

    setHeroPopup(null);

    const query = searchQuery.trim();

    if (!query) {
      navigate("/explore");
      return;
    }

    const normalizedQuery = query.toLowerCase();

    const categoryAliases = {
      "AI / ML": ["ai", "artificial intelligence", "machine learning", "ml", "ai/ml"],
      Weather: ["weather", "forecast", "climate"],
      Maps: ["map", "maps", "location", "navigation", "geocoding"],
      Finance: ["finance", "financial", "stock", "stocks", "currency", "crypto", "banking"],
      Payment: ["payment", "payments", "checkout"],
      News: ["news", "article", "articles", "headlines"],
      "E-commerce": ["ecommerce", "e-commerce", "shopping", "store", "shop"],
      Security: ["security", "cybersecurity", "fraud", "virus", "ip reputation"],
      "Developer Tools": ["developer", "developer tools", "github", "gitlab", "testing", "http"],
    };

    for (const [category, aliases] of Object.entries(categoryAliases)) {
      if (aliases.some((alias) => normalizedQuery === alias || normalizedQuery.includes(alias))) {
        navigate(`/categories?category=${encodeURIComponent(category)}&view=compare`);
        return;
      }
    }

    const matchingApis = apiData.filter((api) => {
      const values = [api.name, api.provider, api.category, api.description]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return values.some((value) => value.includes(normalizedQuery));
    });

    const matchingCategories = [
      ...new Set(matchingApis.map((api) => api.category).filter(Boolean)),
    ];

    if (matchingCategories.length === 1) {
      navigate(`/categories?category=${encodeURIComponent(matchingCategories[0])}&view=compare`);
      return;
    }

    navigate(`/explore?search=${encodeURIComponent(query)}`);

  };


  return (

    <div className="landing-page">

      <Navbar />


      <main>


        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="hero"
          id="home"
        >


          <div className="hero-background">

            <div className="orb orb-one"></div>

            <div className="orb orb-two"></div>

            <div className="orb orb-three"></div>

          </div>


          <div className="hero-content">


            {/* =================================================
                HERO LEFT SIDE
            ================================================= */}

            <div className="hero-copy fade-up">


              {/* EYEBROW */}

              <div className="eyebrow">

                <span className="eyebrow-dot"></span>

                All Your APIs in One Place

              </div>


              {/* HEADING */}

              <h1>

                One Platform

                <br />

                Every{" "}

                <span className="gradient-text">
                  API
                </span>{" "}

                You{" "}

                <span className="gradient-text">
                  Need.
                </span>

              </h1>


              {/* DESCRIPTION */}

              <p>

                Discover, compare, test and integrate APIs
                from multiple providers in one place.
                Build faster. Build smarter.

              </p>


              {/* =================================================
                  SEARCH
              ================================================= */}

              <div className="hero-search">

                <Search size={20} />


                <input
                  type="text"
                  placeholder="Search APIs (e.g. Weather, AI, Maps, Finance...)"
                  onKeyDown={(event) => {

                    if (event.key === "Enter") {

                      openExplore(event.currentTarget.value);

                    }

                  }}
                />


                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector(".hero-search input");
                    openExplore(input?.value || "");
                  }}
                  aria-label="Explore APIs"
                >

                  <ArrowRight size={19} />

                </button>

              </div>


              {/* =================================================
                  STATS
              ================================================= */}

              <div className="hero-stats">


                <div>

                  <strong>
                    {apiCount}
                  </strong>

                  <span>
                    APIs Available
                  </span>

                </div>


                <div>

                  <strong>
                    {categoryCount}
                  </strong>

                  <span>
                    Categories
                  </span>

                </div>


                <div>

                  <strong>
                    {providerCount}
                  </strong>

                  <span>
                    Providers
                  </span>

                </div>


                <div>

                  <strong>
                    5
                  </strong>

                  <span>
                    Active Projects
                  </span>

                </div>


              </div>


              {/* =================================================
                  HERO BUTTONS
              ================================================= */}

              <div className="hero-buttons">


                {/* EXPLORE APIS */}

                <button
                  type="button"
                  className="primary-button"
                  onClick={openExplore}
                >

                  Explore APIs

                  <ArrowRight size={17} />

                </button>


                {/* WATCH DEMO */}

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {

                    setHeroPopup(null);

                    // Demo functionality will be added later.

                  }}
                >

                  <Play
                    size={15}
                    fill="currentColor"
                  />

                  Watch Demo

                </button>


              </div>


            </div>


            {/* =================================================
                HERO RIGHT SIDE
            ================================================= */}

            <div className="hero-visual">


              <div className="visual-glow"></div>


              <div className="api-orbit">


                {/* =================================================
                    ORBIT RINGS
                ================================================= */}

                <div className="orbit-ring ring-one"></div>

                <div className="orbit-ring ring-two"></div>


                {/* =================================================
                    API RESPONSE CARD
                ================================================= */}

                <button
                  type="button"
                  className="api-code-card float-slow"
                  onClick={() =>
                    setHeroPopup(
                      heroPopup === "response"
                        ? null
                        : "response"
                    )
                  }
                >

                  <span>
                    &lt;/&gt;
                  </span>


                  <div>

                    <small>
                      API
                    </small>

                    <strong>
                      Response
                    </strong>

                  </div>

                </button>


                {/* =================================================
                    OPENWEATHER
                ================================================= */}

                <FloatingApi
                  name="OpenWeather"
                  icon={
                    <Cloud size={25} />
                  }
                  className="api-one"
                  color="orange"
                />


                {/* =================================================
                    GOOGLE MAPS
                ================================================= */}

                <FloatingApi
                  name="Google Maps"
                  icon={
                    <MapPin size={25} />
                  }
                  className="api-two"
                  color="green"
                />


                {/* =================================================
                    OPENAI
                ================================================= */}

                <FloatingApi
                  name="OpenAI"
                  icon={
                    <Bot size={25} />
                  }
                  className="api-three"
                  color="dark"
                />


                {/* =================================================
                    STRIPE
                ================================================= */}

                <FloatingApi
                  name="Stripe"
                  icon={
                    <CreditCard size={25} />
                  }
                  className="api-four"
                  color="purple"
                />


                {/* =================================================
                    CENTER API
                ================================================= */}

                <div className="center-api float">

                  <span>
                    API
                  </span>

                </div>


              </div>


              {/* =================================================
                  BUILD / INTEGRATE / INNOVATE
              ================================================= */}

              <button
                type="button"
                className="developer-badge float-slow"
                onClick={() =>
                  setHeroPopup(
                    heroPopup === "workspace"
                      ? null
                      : "workspace"
                  )
                }
              >

                <div className="badge-icon">

                  <ArrowRight size={18} />

                </div>


                <div>

                  <strong>
                    Build.
                  </strong>

                  <span>
                    Integrate. Innovate.
                  </span>

                </div>

              </button>


              {/* =================================================
                  API RESPONSE POPUP
              ================================================= */}

              {heroPopup === "response" && (

                <div
                  ref={popupRef}
                  className="hero-action-popup response-popup"
                >


                  <button
                    type="button"
                    className="hero-popup-close"
                    onClick={() =>
                      setHeroPopup(null)
                    }
                  >

                    <X size={16} />

                  </button>


                  <div className="hero-popup-icon">

                    &lt;/&gt;

                  </div>


                  <span className="hero-popup-label">
                    API TESTING
                  </span>


                  <h3>
                    API Response
                  </h3>


                  <p>

                    Test API endpoints and instantly
                    inspect requests, responses and
                    status information.

                  </p>


                  <button
                    type="button"
                    className="hero-popup-button"
                    onClick={openExplore}
                  >

                    Open API Testing

                    <ArrowRight size={15} />

                  </button>


                </div>

              )}


              {/* =================================================
                  WORKSPACE POPUP
              ================================================= */}

              {heroPopup === "workspace" && (

                <div
                  ref={popupRef}
                  className="hero-action-popup workspace-popup"
                >


                  <button
                    type="button"
                    className="hero-popup-close"
                    onClick={() =>
                      setHeroPopup(null)
                    }
                  >

                    <X size={16} />

                  </button>


                  <div className="hero-popup-icon">

                    <ArrowRight size={20} />

                  </div>


                  <span className="hero-popup-label">
                    API WORKSPACE
                  </span>


                  <h3>
                    Build. Integrate. Innovate.
                  </h3>


                  <p>

                    Discover APIs, connect them to
                    your projects and build powerful
                    applications faster.

                  </p>


                  <button
                    type="button"
                    className="hero-popup-button"
                    onClick={openExplore}
                  >

                    Explore Workspace

                    <ArrowRight size={15} />

                  </button>


                </div>

              )}


            </div>

          </div>

        </section>


        {/* =================================================
            CATEGORIES
        ================================================= */}

        <section
          className="categories-section"
          id="categories"
        >


          <div className="section-heading">


            <div>

              <span>
                EXPLORE
              </span>

              <h2>
                Popular Categories
              </h2>

            </div>


            {/* VIEW ALL */}

            <button
              type="button"
              className="view-all"
              onClick={openExplore}
            >

              View all

              <ArrowRight size={16} />

            </button>


          </div>


          {/* CATEGORY LIST */}

          <div className="category-list">


            {categories.map((category) => (

              <button
                type="button"
                className="category-item"
                key={category.name}
                onClick={openExplore}
              >

                <span
                  className={`category-icon ${category.color}`}
                >

                  {category.icon}

                </span>


                <span>
                  {category.name}
                </span>

              </button>

            ))}


          </div>

        </section>


        {/* =================================================
            PRODUCT MESSAGE
        ================================================= */}

        <section className="story-section">


          <div className="story-card">


            <div>

              <span className="story-label">
                YOUR API WORKSPACE
              </span>


              <h2>

                Everything you need

                <br />

                to work with APIs.

              </h2>


              <p>

                Discover providers, compare APIs,
                test endpoints and manage your
                integrations from one workspace.

              </p>

            </div>


            <div className="story-pill">

              <span className="pulse"></span>

              Built for developers

            </div>


          </div>


        </section>


      </main>

    </div>

  );

}


export default Landing;