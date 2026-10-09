import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import Categories from "./pages/Categories";
import Pricing from "./pages/Pricing";
import PricingCategory from "./pages/PricingCategory";
import ApiDetails from "./pages/ApiDetails";
import ApiTesting from "./pages/ApiTesting";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Documentation from "./pages/Documentation";
import Dashboard from "./pages/Dashboard";

import "./styles/dark-theme.css";
import "./styles/documentation-dark-theme.css";
import "./styles/pricing-dark-theme.css";
import "./styles/index.css";
import "./styles/api-details-restore-styling.css";
import "./styles/api-card-layout-fix.css";
import "./styles/api-testing.css";
import "./styles/documentation-dashboard.css";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================================
            HOME / LANDING
           ================================================== */}
        <Route
          path="/"
          element={<Landing />}
        />


        {/* ==================================================
            EXPLORE
           ================================================== */}
        <Route
          path="/explore"
          element={<Explore />}
        />


        {/* ==================================================
            CATEGORIES
           ================================================== */}
        <Route
          path="/categories"
          element={<Categories />}
        />


        {/* ==================================================
            PRICING LANDING
           ================================================== */}
        <Route
          path="/pricing"
          element={<Pricing />}
        />


        {/* ==================================================
            PRICING CATEGORY PAGES
            FREE / FREEMIUM / PAID
           ================================================== */}
        <Route
          path="/pricing/:type"
          element={<PricingCategory />}
        />


        {/* ==================================================
            API TESTING PLAYGROUND
            Keep this before /api/:apiName
           ================================================== */}
        <Route
          path="/api/:apiName/test"
          element={<ApiTesting />}
        />


        {/* ==================================================
            API DETAILS
           ================================================== */}
        <Route
          path="/api/:apiName"
          element={<ApiDetails />}
        />


        {/* ==================================================
            DOCUMENTATION
           ================================================== */}
        <Route
          path="/documentation"
          element={<Documentation />}
        />

        {/* Keep /docs working as an alias for older links/bookmarks. */}
        <Route
          path="/docs"
          element={<Documentation />}
        />


        {/* ==================================================
            DASHBOARD
           ================================================== */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ==================================================
            LOGIN
           ================================================== */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==================================================
            SIGN UP
           ================================================== */}
        <Route
          path="/signup"
          element={<Signup />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
