import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  return (
    <header className={`navbar ${dark ? "navbar-dark" : ""}`}>
      <div className="navbar-inner">

        <a href="/" className="logo">
          <span className="logo-mark">
            <span></span>
          </span>

          <span>API Hub</span>
        </a>

        <nav className={`nav-links ${mobileOpen ? "open" : ""}`}>
          <a href="#home">Home</a>
          <a href="#explore">Explore</a>
          <a href="#categories">Categories</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </nav>

        <div className="nav-actions">

          <button
            className="icon-button"
            type="button"
            aria-label="Toggle theme"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="login-button">
            Log in
          </button>

          <button className="signup-button">
            Sign Up
          </button>

          <button
            className="mobile-menu"
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

        </div>
      </div>
    </header>
  );
}

export default Navbar;