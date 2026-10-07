import { ArrowLeft, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Signup() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Registration functionality will be connected to the backend later.");
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
              />
            </label>

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
                placeholder="Create a password"
                required
              />
            </label>

            <button type="submit" className="auth-submit">
              Create Account
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
