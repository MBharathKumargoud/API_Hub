import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerUser } from "../services/api";
import { setSession } from "../services/auth";
import { mergeLocalSavedApis } from "../utils/savedApis";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = await registerUser({ name, email, password });
      setSession(auth);
      await mergeLocalSavedApis();
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Sign up failed. Please try again.");
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
            <UserPlus size={22} />
          </div>

          <span className="auth-eyebrow">CREATE YOUR ACCOUNT</span>

          <h1>Join API Hub.</h1>

          <p>
            Create your developer workspace and start discovering APIs.
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Full Name
              <input
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

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
                placeholder="Create a password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <small style={{ display: "block", margin: "-4px 0 12px", opacity: 0.7 }}>
              At least 8 characters, with a letter and a number.
            </small>

            {error && (
              <p role="alert" style={{ color: "#dc2626", fontSize: "0.9rem", margin: "0 0 12px" }}>
                {error}
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to="/login">Log in</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Signup;
