import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function FloatingApi({
  name,
  icon,
  className = "",
  color = "purple",
}) {
  const [open, setOpen] = useState(false);

  const cardRef = useRef(null);

  const navigate = useNavigate();


  /* =========================================================
     API INFORMATION
  ========================================================= */

  const apiInfo = {
    OpenWeather: {
      category: "Weather API",

      description:
        "Access current weather, forecasts and weather information for your applications.",

      features: [
        "Current Weather",
        "Forecasts",
        "Historical Data",
      ],

      slug: "openweather",
    },


    "Google Maps": {
      category: "Maps API",

      description:
        "Add maps, locations, places and geolocation features to your applications.",

      features: [
        "Maps",
        "Places",
        "Geolocation",
      ],

      slug: "google-maps",
    },


    OpenAI: {
      category: "AI / ML API",

      description:
        "Build intelligent applications using powerful AI capabilities.",

      features: [
        "Text Generation",
        "AI Models",
        "Embeddings",
      ],

      slug: "openai",
    },


    Stripe: {
      category: "Payment API",

      description:
        "Build payment experiences and financial infrastructure for your applications.",

      features: [
        "Payments",
        "Subscriptions",
        "Checkout",
      ],

      slug: "stripe",
    },
  };


  const info =
    apiInfo[name] || {
      category: "API",

      description:
        "Explore this API and integrate it into your application.",

      features: [],

      slug: name
        .toLowerCase()
        .replace(/\s+/g, "-"),
    };


  /* =========================================================
     CLOSE WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {

    const handleOutsideClick = (event) => {

      if (
        cardRef.current &&
        !cardRef.current.contains(event.target)
      ) {
        setOpen(false);
      }

    };


    if (open) {

      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );

    }


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, [open]);


  /* =========================================================
     OPEN API DETAILS
  ========================================================= */

  const handleExploreApi = (event) => {

    event.stopPropagation();

    setOpen(false);

    navigate(`/api/${info.slug}`);

  };


  return (

    <div
      ref={cardRef}
      className={`floating-api ${color} ${className} ${
        open ? "floating-api-open" : ""
      }`}
    >

      {/* =====================================================
          API CARD
      ===================================================== */}

      <button
        type="button"
        className="floating-api-card-button"
        onClick={() => setOpen(!open)}
      >

        <div className="floating-api-icon">
          {icon}
        </div>

        <span>
          {name}
        </span>

      </button>


      {/* =====================================================
          HINT
      ===================================================== */}

      {!open && (

        <div className="floating-api-hint">

          Click to explore

          <ArrowRight size={11} />

        </div>

      )}


      {/* =====================================================
          POPUP
      ===================================================== */}

      {open && (

        <div className="api-floating-popup">

          {/* CLOSE */}

          <button
            type="button"
            className="api-popup-close"
            onClick={(event) => {

              event.stopPropagation();

              setOpen(false);

            }}
          >

            <X size={16} />

          </button>


          {/* ICON */}

          <div className="api-popup-icon">

            {icon}

          </div>


          {/* CATEGORY */}

          <span className="api-popup-category">

            {info.category}

          </span>


          {/* CONTENT */}

          <div className="api-popup-content">

            <h3>
              {name}
            </h3>


            <p>
              {info.description}
            </p>


            {/* FEATURES */}

            <div className="api-popup-features">

              {info.features.map((feature) => (

                <span key={feature}>
                  {feature}
                </span>

              ))}

            </div>


            {/* EXPLORE API */}

            <button
              type="button"
              className="api-popup-button"
              onClick={handleExploreApi}
            >

              Explore API

              <ArrowRight size={15} />

            </button>

          </div>

        </div>

      )}

    </div>

  );
}

export default FloatingApi;