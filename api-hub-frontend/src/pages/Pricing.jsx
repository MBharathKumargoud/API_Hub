import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleDollarSign, Info, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import apiData from "../data/apiData";

const FREE_API_IDS = ["ebay-api", "jsonplaceholder", "httpbin", "nasa"];
const PAID_API_IDS = ["openai", "anthropic-claude", "replicate", "google-maps", "mapbox", "alpha-vantage", "finnhub", "polygon", "stripe", "paypal", "razorpay", "adyen", "square", "shopify", "bigcommerce", "twelve-data"];
const CATEGORIES = ["All", "AI / ML", "Weather", "Maps", "Finance", "Payment", "News", "E-commerce", "Security", "Developer Tools"];
const PRICING_FILTERS = ["All", "Free", "Freemium", "Paid"];

// Prices below are examples of verified public pricing. Update them when providers change rates.
// For APIs with model/SKU/usage-specific rates, we deliberately link to the live
// provider page rather than displaying a misleading single price.
const VERIFIED_PRICING = {
  "weatherapi": {
    headline: "$7 / month",
    detail: "Starter plan · up to 3 million calls/month",
    url: "https://www.weatherapi.com/pricing.aspx",
  },
  "visual-crossing": {
    headline: "$0.0001 / record",
    detail: "Metered plan; Professional plan from $35/month",
    url: "https://www.visualcrossing.com/weather-data-pricing/",
  },
  "locationiq": {
    headline: "$45 / month",
    detail: "Maps Lite · 10,000 map views/day; free plan also available",
    url: "https://api.locationiq.com/pricing",
  },
  "news-api": {
    headline: "$449 / month",
    detail: "Business plan; free Developer plan is for development/testing",
    url: "https://newsapi.org/pricing",
  },
  "stability-ai": {
    headline: "$0.01 / credit",
    detail: "25 free credits to start; credits used vary by model/service",
    url: "https://platform.stability.ai/pricing",
  },
  "hugging-face": {
    headline: "$0.10 free credits",
    detail: "Monthly free-user credits; extra inference is usage-based",
    url: "https://huggingface.co/docs/inference-providers/pricing",
  },
};

function getPricingType(api) {
  if (FREE_API_IDS.includes(api.id)) return "free";
  if (PAID_API_IDS.includes(api.id)) return "paid";
  const pricing = (api.pricing || "").toLowerCase();
  if (pricing === "free" || pricing.includes("free api access") || pricing.includes("free/open source")) return "free";
  return "freemium";
}

function getPriceLabel(api, type) {
  const verified = VERIFIED_PRICING[api.id];
  if (verified) return verified;

  if (type === "free") {
    return {
      headline: "$0",
      detail: "Free to start; published usage limits and fair-use rules apply.",
      estimate: false,
    };
  }

  // These are clearly labeled planning estimates, not provider quotations.
  // The range is a rough low-volume budget guide when this project has no
  // verified provider-specific numeric price for the API.
  const category = (api.category || "").toLowerCase();
  if (category.includes("payment") || ["stripe", "paypal", "razorpay", "adyen", "square"].includes(api.id)) {
    return {
      headline: "Usage-based fees",
      detail: "Approx. budget: $0–$25/month at low volume, plus transaction fees where applicable.",
      estimate: true,
    };
  }
  if (category.includes("ai / ml")) {
    return {
      headline: "Approx. $0–$20/month",
      detail: "Low-volume planning estimate; model and token usage can change the total substantially.",
      estimate: true,
    };
  }
  if (category.includes("maps")) {
    return {
      headline: "Approx. $0–$50/month",
      detail: "Low-volume planning estimate; requests, map views, and geocoding usage affect cost.",
      estimate: true,
    };
  }
  if (category.includes("weather")) {
    return {
      headline: "Approx. $0–$20/month",
      detail: "Low-volume planning estimate; free quotas and request volume vary by provider.",
      estimate: true,
    };
  }
  if (category.includes("finance")) {
    return {
      headline: "Approx. $0–$50/month",
      detail: "Low-volume planning estimate; real-time data and commercial use may cost more.",
      estimate: true,
    };
  }
  if (category.includes("news")) {
    return {
      headline: "Approx. $0–$30/month",
      detail: "Low-volume planning estimate; commercial plans may cost more.",
      estimate: true,
    };
  }
  if (category.includes("security")) {
    return {
      headline: "Approx. $0–$30/month",
      detail: "Low-volume planning estimate; lookup volume and premium features affect cost.",
      estimate: true,
    };
  }
  if (category.includes("e-commerce")) {
    return {
      headline: "Approx. $0–$40/month",
      detail: "Low-volume planning estimate; paid platform plans and transaction fees may apply.",
      estimate: true,
    };
  }
  return {
    headline: "Approx. $0–$25/month",
    detail: "Low-volume planning estimate only; actual charges depend on the provider and usage.",
    estimate: true,
  };
}

function Pricing() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePricingFilter, setActivePricingFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredApis = useMemo(() => {
    const query = search.trim().toLowerCase();
    return apiData.filter((api) => {
      const matchesCategory = activeCategory === "All" || api.category === activeCategory;
      const matchesPricing = activePricingFilter === "All" || getPricingType(api) === activePricingFilter.toLowerCase();
      const matchesQuery = !query ||
        (api.name || "").toLowerCase().includes(query) ||
        (api.provider || "").toLowerCase().includes(query) ||
        (api.description || "").toLowerCase().includes(query) ||
        (api.category || "").toLowerCase().includes(query);
      return matchesCategory && matchesPricing && matchesQuery;
    });
  }, [activeCategory, activePricingFilter, search]);

  // Counts are calculated from the same classification used by the filters,
  // so the summary cannot drift from the actual API directory.
  const pricingCounts = useMemo(() => ({
    free: apiData.filter((api) => getPricingType(api) === "free").length,
    freemium: apiData.filter((api) => getPricingType(api) === "freemium").length,
    paid: apiData.filter((api) => getPricingType(api) === "paid").length,
    total: apiData.length,
  }), []);

  return (
    <div className="pricing-redesign-page">
      <style>{`
        .pricing-redesign-page{min-height:100vh;background:#f7f8fe;color:#111b35;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .pricing-redesign-page *{box-sizing:border-box}
        .pricing-redesign-main{width:min(1450px,calc(100% - 64px));margin:0 auto;padding:34px 0 72px}
        .pricing-redesign-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:28px;margin-bottom:30px}
        .pricing-redesign-eyebrow{color:#5145f5;font-size:12px;font-weight:800;letter-spacing:.14em}
        .pricing-redesign-hero h1{margin:12px 0 10px;color:#101a34;font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,4vw,54px);line-height:1.06;letter-spacing:-.035em}
        .pricing-redesign-hero h1 span{color:#5944ef}
        .pricing-redesign-subtitle{margin:0;color:#657493;font-size:16px;line-height:1.65}
        .pricing-redesign-note{display:flex;gap:13px;align-items:center;max-width:420px;padding:17px 19px;border:1px solid #e5e8fa;border-radius:18px;background:rgba(255,255,255,.76);box-shadow:0 8px 24px rgba(70,76,145,.06);color:#687797;font-size:13px;line-height:1.55}
        .pricing-redesign-note svg{flex:0 0 auto;color:#5546f4}.pricing-redesign-note strong{display:block;color:#4f3deb;font-size:14px;margin-bottom:2px}
        .pricing-redesign-controls{display:flex;flex-direction:column;align-items:stretch;gap:14px;margin:25px 0 28px}
        .pricing-redesign-filter-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .pricing-redesign-filter-title{min-width:88px;color:#657493;font-size:12px;font-weight:800}
        .pricing-redesign-category-filters{display:flex;flex-wrap:wrap;gap:8px}
        .pricing-redesign-pricing-filters{display:flex;flex-wrap:wrap;gap:8px}
        .pricing-redesign-filters{display:flex;flex-wrap:wrap;gap:9px}
        .pricing-redesign-filter{border:1px solid #e7eaf4;border-radius:999px;padding:10px 18px;background:#fff;color:#293653;font-size:12px;font-weight:650;cursor:pointer;transition:background .18s,color .18s,border-color .18s,transform .18s}
        .pricing-redesign-filter:hover{transform:translateY(-1px);border-color:#bdb7ff}.pricing-redesign-filter.active{background:#5144ee;border-color:#5144ee;color:#fff;box-shadow:0 6px 14px rgba(81,68,238,.2)}
        .pricing-redesign-search{display:flex;align-items:center;gap:9px;width:min(270px,100%);padding:10px 13px;border:1px solid #e1e6f2;border-radius:12px;background:#fff;color:#8490aa}
        .pricing-redesign-search input{width:100%;border:0;outline:0;background:transparent;color:#18213a;font-size:13px}
        .pricing-redesign-counts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0 0 23px}
        .pricing-redesign-count{padding:14px 17px;border:1px solid #e3e7f5;border-radius:14px;background:#fff;box-shadow:0 4px 12px rgba(42,56,98,.035)}
        .pricing-redesign-count span{display:block;color:#6b7895;font-size:12px;font-weight:700}
        .pricing-redesign-count strong{display:block;margin-top:4px;color:#5144ee;font-size:25px;font-weight:850}
        .pricing-redesign-count.free strong{color:#087a51}.pricing-redesign-count.paid strong{color:#5d27dd}
        .pricing-redesign-count.total strong{color:#1b2945}
        .pricing-redesign-estimate{display:block;margin-top:5px;color:#8a6a1b;font-size:10px;font-weight:750;letter-spacing:.02em}
        .pricing-redesign-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
        .pricing-redesign-card{display:flex;flex-direction:column;min-width:0;padding:21px;border:1px solid #e0e6f2;border-radius:18px;background:rgba(255,255,255,.94);box-shadow:0 5px 16px rgba(42,56,98,.035);transition:transform .2s,box-shadow .2s,border-color .2s}
        .pricing-redesign-card:hover{transform:translateY(-3px);border-color:#c9c9fb;box-shadow:0 14px 28px rgba(53,60,120,.09)}
        .pricing-redesign-card-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .pricing-redesign-icon{display:flex;align-items:center;justify-content:center;width:49px;height:49px;border-radius:14px;background:linear-gradient(135deg,#5144ee,#8878ff);color:#fff;box-shadow:0 6px 14px rgba(81,68,238,.16)}
        .pricing-redesign-category{padding:6px 10px;border-radius:999px;background:#eef1ff;color:#627198;font-size:11px;font-weight:700;white-space:nowrap}
        .pricing-redesign-card h2{margin:17px 0 7px;color:#101a34;font-family:Georgia,"Times New Roman",serif;font-size:20px;line-height:1.25}
        .pricing-redesign-description{min-height:54px;margin:0;color:#657493;font-size:13px;line-height:1.6}
        .pricing-redesign-price{margin-top:15px;padding:13px 14px;border:1px solid #eee9ff;border-radius:14px;background:linear-gradient(110deg,#f5f1ff,#f9f8ff)}
        .pricing-redesign-price-label{display:block;margin-bottom:4px;color:#6845ed;font-size:11px;font-weight:750}
        .pricing-redesign-price-row{display:flex;justify-content:space-between;align-items:center;gap:8px}
        .pricing-redesign-price strong{color:#552be5;font-family:Georgia,"Times New Roman",serif;font-size:21px;line-height:1.25;overflow-wrap:anywhere}
        .pricing-redesign-paid-badge{flex:0 0 auto;padding:7px 11px;border-radius:999px;background:#e7dcff;color:#5d27dd;font-size:11px;font-weight:800}
        .pricing-redesign-paid-badge.free{background:#dcf8ec;color:#087a51}
        .pricing-redesign-price-detail{display:block;margin-top:5px;color:#647392;font-size:11px;line-height:1.45}\n        .pricing-redesign-free-tier{margin:12px 0 0;color:#667592;font-size:12px;line-height:1.5}.pricing-redesign-free-tier strong{color:#087d56}
        .pricing-redesign-tags{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0 16px}
        .pricing-redesign-tag{padding:6px 10px;border-radius:999px;background:#f0f3fa;color:#61708c;font-size:11px;font-weight:650}
        .pricing-redesign-tag.paid{background:#ece4ff;color:#5c2ce0}
        .pricing-redesign-button{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;margin-top:auto;padding:12px 15px;border:0;border-radius:10px;background:#5144ee;color:#fff;font-size:13px;font-weight:750;cursor:pointer;transition:background .18s,transform .18s}
        .pricing-redesign-button:hover{background:#4034d7;transform:translateY(-1px)}
        .pricing-redesign-empty{padding:44px 20px;text-align:center;color:#687797;border:1px dashed #d7deee;border-radius:16px;background:#fff;grid-column:1/-1}
        .pricing-redesign-footer{display:flex;align-items:flex-start;gap:12px;margin-top:26px;padding:17px 19px;border:1px solid #e4e8f4;border-radius:15px;background:rgba(255,255,255,.8);color:#667592;font-size:12px;line-height:1.6}
        .pricing-redesign-footer svg{flex:0 0 auto;color:#5746f1}
        @media(max-width:1100px){.pricing-redesign-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pricing-redesign-hero{flex-direction:column}.pricing-redesign-note{max-width:100%}}
        /* Dark mode: the background belongs to the full page wrapper, not the narrower content container. */
        html.dark-theme .pricing-redesign-page,
        html[data-theme="dark"] .pricing-redesign-page,
        body.dark-theme .pricing-redesign-page{min-height:100vh;width:100%;background:#0b0d14!important;color:#f5f7ff!important;background-image:radial-gradient(circle at 80% 5%,rgba(99,91,255,.16),transparent 32%),linear-gradient(180deg,#0b0d14 0%,#101321 100%)!important}
        html.dark-theme .pricing-redesign-hero h1,html[data-theme="dark"] .pricing-redesign-hero h1,body.dark-theme .pricing-redesign-hero h1{color:#f5f7ff}
        html.dark-theme .pricing-redesign-subtitle,html[data-theme="dark"] .pricing-redesign-subtitle,body.dark-theme .pricing-redesign-subtitle,html.dark-theme .pricing-redesign-filter-title,html[data-theme="dark"] .pricing-redesign-filter-title,body.dark-theme .pricing-redesign-filter-title{color:#aeb8d0}
        html.dark-theme .pricing-redesign-note,html[data-theme="dark"] .pricing-redesign-note,body.dark-theme .pricing-redesign-note,html.dark-theme .pricing-redesign-count,html[data-theme="dark"] .pricing-redesign-count,body.dark-theme .pricing-redesign-count,html.dark-theme .pricing-redesign-card,html[data-theme="dark"] .pricing-redesign-card,body.dark-theme .pricing-redesign-card,html.dark-theme .pricing-redesign-footer,html[data-theme="dark"] .pricing-redesign-footer,body.dark-theme .pricing-redesign-footer{background:rgba(20,24,39,.94);border-color:#2a3045;color:#d5dcef}
        html.dark-theme .pricing-redesign-count span,html[data-theme="dark"] .pricing-redesign-count span,body.dark-theme .pricing-redesign-count span,html.dark-theme .pricing-redesign-card h2,html[data-theme="dark"] .pricing-redesign-card h2,body.dark-theme .pricing-redesign-card h2{color:#f5f7ff}
        html.dark-theme .pricing-redesign-description,html[data-theme="dark"] .pricing-redesign-description,body.dark-theme .pricing-redesign-description,html.dark-theme .pricing-redesign-free-tier,html[data-theme="dark"] .pricing-redesign-free-tier,body.dark-theme .pricing-redesign-free-tier{color:#b3bfd8}
        html.dark-theme .pricing-redesign-price,html[data-theme="dark"] .pricing-redesign-price,body.dark-theme .pricing-redesign-price{background:linear-gradient(110deg,#211b3b,#1b2034);border-color:#403568}
        html.dark-theme .pricing-redesign-price-detail,html[data-theme="dark"] .pricing-redesign-price-detail,body.dark-theme .pricing-redesign-price-detail{color:#b8c3dd}
        html.dark-theme .pricing-redesign-filter,html[data-theme="dark"] .pricing-redesign-filter,body.dark-theme .pricing-redesign-filter,html.dark-theme .pricing-redesign-search,html[data-theme="dark"] .pricing-redesign-search,body.dark-theme .pricing-redesign-search{background:#151a29;border-color:#30374d;color:#dce3f5}
        html.dark-theme .pricing-redesign-search input,html[data-theme="dark"] .pricing-redesign-search input,body.dark-theme .pricing-redesign-search input{color:#f5f7ff}
        html.dark-theme .pricing-redesign-tag,html[data-theme="dark"] .pricing-redesign-tag,body.dark-theme .pricing-redesign-tag{background:#20263a;color:#c4cde3}
        html.dark-theme .pricing-redesign-tag.paid,html[data-theme="dark"] .pricing-redesign-tag.paid,body.dark-theme .pricing-redesign-tag.paid{background:#30234f;color:#d9caff}
        @media(max-width:680px){.pricing-redesign-main{width:calc(100% - 30px);padding-top:25px}.pricing-redesign-grid{grid-template-columns:1fr;gap:13px}.pricing-redesign-hero h1{font-size:37px}.pricing-redesign-card{padding:18px}.pricing-redesign-controls{align-items:stretch}.pricing-redesign-search{width:100%}.pricing-redesign-filter{padding:9px 12px}.pricing-redesign-counts{grid-template-columns:repeat(2,minmax(0,1fr))}}
      `}</style>

      <Navbar />
      <main className="pricing-redesign-main">
        <section className="pricing-redesign-hero">
          <div>
            <span className="pricing-redesign-eyebrow">PRICING</span>
            <h1>Simple, Transparent <span>Pricing</span></h1>
            <p className="pricing-redesign-subtitle">Find APIs that fit your budget. Check free limits and pricing before choosing.</p>
          </div>
          <aside className="pricing-redesign-note">
            <Info size={22} />
            <div><strong>Pricing information</strong>Prices and billing units vary by provider and may change. Open API details to verify current rates before committing.</div>
          </aside>
        </section>

        <section className="pricing-redesign-counts" aria-label="API pricing counts">
          <div className="pricing-redesign-count total"><span>Total APIs</span><strong>{pricingCounts.total}</strong></div>
          <div className="pricing-redesign-count free"><span>Free APIs</span><strong>{pricingCounts.free}</strong></div>
          <div className="pricing-redesign-count"><span>Freemium APIs</span><strong>{pricingCounts.freemium}</strong></div>
          <div className="pricing-redesign-count paid"><span>Paid APIs</span><strong>{pricingCounts.paid}</strong></div>
        </section>

        <section className="pricing-redesign-controls" aria-label="Filter APIs">
          <div className="pricing-redesign-filter-row">
            <span className="pricing-redesign-filter-title">Pricing type</span>
            <div className="pricing-redesign-pricing-filters">
              {PRICING_FILTERS.map((filter) => (
                <button type="button" key={filter} className={`pricing-redesign-filter ${activePricingFilter === filter ? "active" : ""}`} onClick={() => setActivePricingFilter(filter)}>{filter}</button>
              ))}
            </div>
            <label className="pricing-redesign-search"><Search size={16} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search APIs..." aria-label="Search APIs" /></label>
          </div>
          <div className="pricing-redesign-filter-row">
            <span className="pricing-redesign-filter-title">Category</span>
            <div className="pricing-redesign-category-filters">
              {CATEGORIES.map((category) => (
                <button type="button" key={category} className={`pricing-redesign-filter ${activeCategory === category ? "active" : ""}`} onClick={() => setActiveCategory(category)}>{category}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing-redesign-grid" aria-live="polite">
          {filteredApis.map((api) => {
            const type = getPricingType(api);
            const price = getPriceLabel(api, type);
            return (
              <article className="pricing-redesign-card" key={api.id}>
                <div className="pricing-redesign-card-top">
                  <div className="pricing-redesign-icon" aria-hidden="true"><CircleDollarSign size={25} /></div>
                  <span className="pricing-redesign-category">{api.category}</span>
                </div>
                <h2>{api.name}</h2>
                <p className="pricing-redesign-description">{api.description}</p>
                <div className="pricing-redesign-price">
                  <span className="pricing-redesign-price-label">{price.estimate ? "APPROXIMATE COST ESTIMATE" : type === "free" ? "PRICE" : "PRICING MODEL"}</span>
                  <div className="pricing-redesign-price-row">
                    <strong>{price.headline}</strong>
                    <span className={`pricing-redesign-paid-badge ${type === "free" ? "free" : ""}`}>{type === "free" ? "FREE" : type === "paid" ? "PAID" : "FREEMIUM"}</span>
                  </div>
                  <span className="pricing-redesign-price-detail">{price.detail}</span>
                  {price.estimate && <span className="pricing-redesign-estimate">ESTIMATE ONLY · NOT A PROVIDER QUOTE</span>}
                </div>
                <p className="pricing-redesign-free-tier"><strong>{type === "free" ? "Free access" : (api.freeTier || "").toLowerCase().includes("no permanent free") ? "No permanent free tier" : "Free tier / credits"}</strong><br />{api.freeTier || "Check provider for free-tier limits"}</p>
                <div className="pricing-redesign-tags">
                  <span className="pricing-redesign-tag">{api.category}</span>
                  <span className={`pricing-redesign-tag ${type === "free" ? "" : "paid"}`}>{type === "free" ? "Free" : type === "paid" ? "Paid" : "Free + Paid"}</span>
                </div>
                <button type="button" className="pricing-redesign-button" onClick={() => navigate(`/api/${api.id}`)}>View API <ArrowRight size={16} /></button>
              </article>
            );
          })}
          {filteredApis.length === 0 && <div className="pricing-redesign-empty">No APIs match those filters. Try another category or search term.</div>}
        </section>

        <div className="pricing-redesign-footer">
          <Info size={18} />
          <div><strong>About these prices:</strong> Verified provider prices are shown where available. Other amounts are explicitly labeled as approximate low-volume budget estimates, not guaranteed rates. Actual costs depend on usage, plan, region, model, and provider terms.</div>
        </div>
      </main>
    </div>
  );
}

export default Pricing;
