import { ArrowLeft, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { loginUser } from "../services/api";
import { setSession } from "../services/auth";
import { mergeLocalSavedApis } from "../utils/savedApis";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = await loginUser({ email, password });
      setSession(auth);
      await mergeLocalSavedApis();
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <Link to="/" className="auth-back">
            <ArrowLeft size={15} />
            Back to home
          </Link>

          <div className="auth-icon">
            <LogIn size={22} />
          </div>

          <span className="auth-eyebrow">WELCOME BACK</span>

          <h1>Log in to API Hub.</h1>

          <p>
            Access your APIs, projects, credentials and developer workspace.
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div style={{ textAlign: "right", margin: "-4px 0 12px", fontSize: "0.9rem" }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            {error && (
              <p role="alert" style={{ color: "#dc2626", fontSize: "0.9rem", margin: "0 0 12px" }}>
                {error}
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/signup">Sign Up</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
