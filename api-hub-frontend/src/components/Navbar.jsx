import {
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";


function Navbar() {

  const navigate = useNavigate();


  /* =========================================================
     THEME
     ========================================================= */

  const [dark, setDark] = useState(() => {
    return localStorage.getItem("api-hub-theme") === "dark";
  });


  /* =========================================================
     MOBILE MENU
     ========================================================= */

  const [mobileOpen, setMobileOpen] = useState(false);


  /* =========================================================
     APPLY THEME
     ========================================================= */

  useEffect(() => {

    const html = document.documentElement;
    const body = document.body;

    if (dark) {

      html.classList.add("dark-theme");
      html.setAttribute("data-theme", "dark");

      body.classList.add("dark-theme");

      localStorage.setItem(
        "api-hub-theme",
        "dark"
      );

    } else {

      html.classList.remove("dark-theme");
      html.removeAttribute("data-theme");

      body.classList.remove("dark-theme");

      localStorage.setItem(
        "api-hub-theme",
        "light"
      );
    }

  }, [dark]);


  /* =========================================================
     THEME TOGGLE
     ========================================================= */

  const handleThemeToggle = () => {
    setDark((current) => !current);
  };


  /* =========================================================
     MOBILE MENU
     ========================================================= */

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };


  /* =========================================================
     LOGIN / SIGNUP
     ========================================================= */

  const goToLogin = () => {
    closeMobileMenu();
    navigate("/login");
  };

  const goToSignup = () => {
    closeMobileMenu();
    navigate("/signup");
  };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <header
      className={`navbar ${
        dark ? "navbar-dark" : ""
      }`}
    >

      <div className="navbar-inner">


        {/* LOGO */}

        <Link
          to="/"
          className="logo"
          onClick={closeMobileMenu}
        >

          <span className="logo-mark">
            <span></span>
          </span>

          <span>
            API Hub
          </span>

        </Link>


        {/* NAVIGATION */}

        <nav
          className={`nav-links ${
            mobileOpen ? "open" : ""
          }`}
        >

          <Link
            to="/"
            onClick={closeMobileMenu}
          >
            Home
          </Link>


          <Link
            to="/explore"
            onClick={closeMobileMenu}
          >
            Explore
          </Link>


          <a
            href="/#categories"
            onClick={closeMobileMenu}
          >
            Categories
          </a>


          <a
            href="/#pricing"
            onClick={closeMobileMenu}
          >
            Pricing
          </a>


          <a
            href="/#docs"
            onClick={closeMobileMenu}
          >
            Docs
          </a>

        </nav>


        {/* ACTIONS */}

        <div className="nav-actions">


          {/* THEME */}

          <button
            className="icon-button"
            type="button"
            aria-label={
              dark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              dark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            onClick={handleThemeToggle}
          >

            {dark ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}

          </button>


          {/* LOGIN */}

          <button
            type="button"
            className="login-button"
            onClick={goToLogin}
          >
            Log in
          </button>


          {/* SIGN UP */}

          <button
            type="button"
            className="signup-button"
            onClick={goToSignup}
          >
            Sign Up
          </button>


          {/* MOBILE */}

          <button
            className="mobile-menu"
            type="button"
            onClick={() =>
              setMobileOpen(
                (current) => !current
              )
            }
            aria-label="Toggle menu"
          >

            {mobileOpen ? (
              <X />
            ) : (
              <Menu />
            )}

          </button>

        </div>

      </div>

    </header>

  );
}


export default Navbar;