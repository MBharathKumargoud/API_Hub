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
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./styles/dark-theme.css";
import "./styles/index.css";


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
            PRICING
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
            API DETAILS
           ================================================== */}

        <Route
          path="/api/:apiName"
          element={<ApiDetails />}
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