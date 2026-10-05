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
} from "lucide-react";

import Navbar from "../components/Navbar";
import FloatingApi from "../components/FloatingApi";

function Landing() {
  const categories = [
    {
      name: "AI / ML",
      icon: <Bot size={20} />,
      color: "purple",
    },
    {
      name: "Weather",
      icon: <Cloud size={20} />,
      color: "blue",
    },
    {
      name: "Maps",
      icon: <MapPin size={20} />,
      color: "green",
    },
    {
      name: "Finance",
      icon: <BarChart3 size={20} />,
      color: "cyan",
    },
    {
      name: "Payment",
      icon: <CreditCard size={20} />,
      color: "purple",
    },
    {
      name: "News",
      icon: <Newspaper size={20} />,
      color: "pink",
    },
    {
      name: "E-commerce",
      icon: <ShoppingCart size={20} />,
      color: "orange",
    },
    {
      name: "Security",
      icon: <Shield size={20} />,
      color: "blue",
    },
  ];

  return (
    <div className="landing-page">

      <Navbar />

      <main>

        {/* HERO */}

        <section className="hero" id="home">

          <div className="hero-background">
            <div className="orb orb-one"></div>
            <div className="orb orb-two"></div>
            <div className="orb orb-three"></div>
          </div>

          <div className="hero-content">

            <div className="hero-copy fade-up">

              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                All Your APIs in One Place
              </div>

              <h1>
                One Platform
                <br />
                Every{" "}
                <span className="gradient-text">
                  API
                </span>{" "}
                You <span className="gradient-text">Need.</span>
              </h1>

              <p>
                Discover, compare, test and integrate APIs
                from multiple providers in one place.
                Build faster. Build smarter.
              </p>

              <div className="hero-search">

                <Search size={20} />

                <input
                  type="text"
                  placeholder="Search APIs (e.g. Weather, AI, Maps, Finance...)"
                />

                <button>
                  <ArrowRight size={19} />
                </button>

              </div>

              <div className="hero-stats">

                <div>
                  <strong>150+</strong>
                  <span>APIs Available</span>
                </div>

                <div>
                  <strong>20+</strong>
                  <span>Categories</span>
                </div>

                <div>
                  <strong>10+</strong>
                  <span>Providers</span>
                </div>

                <div>
                  <strong>5</strong>
                  <span>Active Projects</span>
                </div>

              </div>

              <div className="hero-buttons">

                <button className="primary-button">
                  Explore APIs
                  <ArrowRight size={17} />
                </button>

                <button className="secondary-button">
                  <Play size={15} fill="currentColor" />
                  Watch Demo
                </button>

              </div>

            </div>

            {/* HERO VISUAL */}

            <div className="hero-visual">

              <div className="visual-glow"></div>

              <div className="api-orbit">

                <div className="orbit-ring ring-one"></div>
                <div className="orbit-ring ring-two"></div>

                <div className="api-code-card float-slow">
                  <span>&lt;/&gt;</span>
                  <div>
                    <small>API</small>
                    <strong>Response</strong>
                  </div>
                </div>

                <FloatingApi
                  name="OpenWeather"
                  icon={<Cloud size={25} />}
                  className="api-one"
                  color="orange"
                />

                <FloatingApi
                  name="Google Maps"
                  icon={<MapPin size={25} />}
                  className="api-two"
                  color="green"
                />

                <FloatingApi
                  name="OpenAI"
                  icon={<Bot size={25} />}
                  className="api-three"
                  color="dark"
                />

                <FloatingApi
                  name="Stripe"
                  icon={<CreditCard size={25} />}
                  className="api-four"
                  color="purple"
                />

                <div className="center-api float">
                  <span>API</span>
                </div>

              </div>

              <div className="developer-badge float-slow">
                <div className="badge-icon">
                  <ArrowRight size={18} />
                </div>

                <div>
                  <strong>Build.</strong>
                  <span>Integrate. Innovate.</span>
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* CATEGORIES */}

        <section
          className="categories-section"
          id="categories"
        >

          <div className="section-heading">

            <div>
              <span>EXPLORE</span>
              <h2>Popular Categories</h2>
            </div>

            <button className="view-all">
              View all
              <ArrowRight size={16} />
            </button>

          </div>

          <div className="category-list">

            {categories.map((category) => (
              <button
                className="category-item"
                key={category.name}
              >
                <span
                  className={`category-icon ${category.color}`}
                >
                  {category.icon}
                </span>

                <span>{category.name}</span>
              </button>
            ))}

          </div>

        </section>


        {/* PRODUCT MESSAGE */}

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