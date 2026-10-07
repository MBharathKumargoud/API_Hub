import { ArrowLeft, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Login functionality will be connected to the backend later.");
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
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                required
              />
            </label>

            <button type="submit" className="auth-submit">
              Log in
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
