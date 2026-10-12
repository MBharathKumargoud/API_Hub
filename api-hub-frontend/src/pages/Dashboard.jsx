import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Bookmark,
  Code2,
  BookOpen,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";
import { useSavedApis } from "../utils/savedApis";
import { useAuth } from "../services/auth";
import { fetchDashboard } from "../services/api";

function Dashboard() {
  const { isSaved } = useSavedApis();
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(null);

  // Get the logged-in user's name.
  const username = user?.name?.trim();

  // Dynamically generate the workspace heading.
  const workspaceTitle = username
    ? `${username}'s API Hub`
    : "Your API Hub";

  // Fetch dashboard statistics from the backend.
  useEffect(() => {
    if (!isAuthenticated) {
      setStats(null);
      return;
    }

    let cancelled = false;

    fetchDashboard()
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Get the user's saved APIs.
  const savedApis = useMemo(
    () => apiData.filter((api) => isSaved(api.id)),
    [isSaved]
  );

  const recentlyAdded = apiData.slice(0, 4);

  return (
    <div className="hub-dashboard-page">
      <Navbar />

      <main className="hub-dashboard-main">
        {/* Welcome section */}
        <section className="hub-dashboard-welcome">
          <div>
            <span className="hub-dashboard-eyebrow">
              <LayoutDashboard size={15} />
              DEVELOPER WORKSPACE
            </span>

            <h1>
              {workspaceTitle} <span>workspace</span>
            </h1>

            <p>
              Keep your favorite APIs close and jump back into development.
            </p>
          </div>

          <Link to="/explore" className="hub-dashboard-primary">
            <Compass size={17} />
            Explore APIs
          </Link>
        </section>

        {/* Dashboard statistics */}
        <section className="hub-dashboard-stats">
          <article className="hub-dashboard-stat">
            <span className="hub-dashboard-stat-icon">
              <Code2 size={19} />
            </span>

            <div>
              <small>APIs in directory</small>
              <strong>{apiData.length}</strong>
              <span>Available to explore</span>
            </div>
          </article>

          <article className="hub-dashboard-stat">
            <span className="hub-dashboard-stat-icon">
              <Bookmark size={19} />
            </span>

            <div>
              <small>Saved APIs</small>
              <strong>{savedApis.length}</strong>
              <span>Your bookmarked APIs</span>
            </div>
          </article>

          <article className="hub-dashboard-stat">
            <span className="hub-dashboard-stat-icon">
              <BookOpen size={19} />
            </span>

            <div>
              <small>Learning resources</small>
              <strong>4</strong>
              <span>HTTP methods quick guide</span>
            </div>
          </article>
        </section>

        {/* Saved APIs */}
        <section className="hub-dashboard-section">
          <div className="hub-dashboard-section-heading">
            <div>
              <span className="hub-dashboard-eyebrow">
                YOUR COLLECTION
              </span>

              <h2>Saved APIs</h2>

              <p>APIs you bookmarked from their details pages.</p>
            </div>

            <Link
              to="/explore"
              className="hub-dashboard-text-link"
            >
              Find more <ArrowUpRight size={15} />
            </Link>
          </div>

          {savedApis.length > 0 ? (
            <div className="hub-dashboard-api-grid">
              {savedApis.map((api) => (
                <article
                  className="hub-dashboard-api-card"
                  key={api.id}
                >
                  <div className="hub-dashboard-api-card-top">
                    <span className="hub-dashboard-category">
                      {api.category}
                    </span>

                    <Bookmark size={17} />
                  </div>

                  <h3>{api.name}</h3>

                  <p>{api.description}</p>

                  <div className="hub-dashboard-card-actions">
                    <Link to={`/api/${api.id}`}>
                      View details <ArrowUpRight size={14} />
                    </Link>

                    <Link to={`/api/${api.id}/test`}>
                      Test API <Code2 size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="hub-dashboard-empty">
              <div className="hub-dashboard-empty-icon">
                <Bookmark size={22} />
              </div>

              <h3>No saved APIs yet</h3>

              <p>
                Explore the directory and select{" "}
                <strong>Save API</strong> on any API details page.
                Your saved list will appear here.
              </p>

              <Link
                to="/explore"
                className="hub-dashboard-primary"
              >
                Browse APIs <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </section>

        {/* Quick access */}
        <section className="hub-dashboard-section">
          <div className="hub-dashboard-section-heading">
            <div>
              <span className="hub-dashboard-eyebrow">
                GET STARTED
              </span>

              <h2>Quick access</h2>

              <p>Continue exploring API Hub tools.</p>
            </div>
          </div>

          <div className="hub-dashboard-quick-grid">
            <Link
              to="/explore"
              className="hub-dashboard-quick-card"
            >
              <span>
                <Compass size={20} />
              </span>

              <div>
                <strong>Explore APIs</strong>
                <p>
                  Search the API directory by category and provider.
                </p>
              </div>

              <ArrowUpRight size={17} />
            </Link>

            <Link
              to="/documentation"
              className="hub-dashboard-quick-card"
            >
              <span>
                <BookOpen size={20} />
              </span>

              <div>
                <strong>Documentation</strong>
                <p>
                  Learn about endpoints, authentication, and requests.
                </p>
              </div>

              <ArrowUpRight size={17} />
            </Link>

            <Link
              to="/pricing"
              className="hub-dashboard-quick-card"
            >
              <span>
                <Sparkles size={20} />
              </span>

              <div>
                <strong>Compare pricing</strong>
                <p>
                  Review free tiers and pricing information.
                </p>
              </div>

              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>

        {/* Account information */}
        <section className="hub-dashboard-notice">
          <div>
            {isAuthenticated ? (
              <>
                <strong>
                  Signed in as {user?.name || user?.email} 
                  {user?.name && user?.email
                    ? ` (${user.email})`
                    : ""}
                  .
                </strong>

                <p>
                  Your saved APIs are synced with your account.
                  {stats
                    ? ` Projects: ${stats.projects} · API test requests sent: ${stats.requestsMade}.`
                    : ""}
                </p>
              </>
            ) : (
              <>
                <strong>You are browsing as a guest.</strong>

                <p>
                  Saved APIs are stored only in this browser.{" "}
                  <Link to="/login">Log in</Link> or{" "}
                  <Link to="/signup">create an account</Link> to
                  sync them to your account and use the API tester.
                </p>
              </>
            )}
          </div>

          <ExternalLink size={18} />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;