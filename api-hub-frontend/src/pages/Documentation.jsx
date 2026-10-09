import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, BookOpen, ExternalLink, KeyRound, Code2, ArrowRight,
  Globe, ShieldCheck, Terminal, ChevronDown
} from "lucide-react";
import Navbar from "../components/Navbar";
import apiData from "../data/apiData";

const methodHelp = [
  { method: "GET", meaning: "Retrieve information", example: "Read a resource or list of resources." },
  { method: "POST", meaning: "Submit or create information", example: "Send a JSON body to create or process data." },
  { method: "PUT", meaning: "Update a resource", example: "Send a JSON body to replace or update a resource." },
  { method: "DELETE", meaning: "Request resource removal", example: "Delete a resource when the provider supports it." },
];

function Documentation() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [expanded, setExpanded] = useState("auth");

  const filteredApis = useMemo(() => {
    const term = search.trim().toLowerCase();
    return apiData.filter((api) =>
      !term || [api.name, api.provider, api.category, api.description]
        .filter(Boolean).some((value) => value.toLowerCase().includes(term))
    );
  }, [search]);

  const selectedApi = apiData.find((api) => api.id === selectedId) || filteredApis[0] || apiData[0];

  const toggleSection = (key) => setExpanded((current) => current === key ? "" : key);

  return (
    <div className="hub-docs-page">
      <Navbar />
      <main className="hub-docs-main">
        <section className="hub-docs-hero">
          <span className="hub-docs-eyebrow"><BookOpen size={15} /> API HUB LEARNING CENTER</span>
          <h1>API documentation, <span>made simpler.</span></h1>
          <p>Find an API, understand its authentication, and learn what to prepare before making your first request.</p>
          <label className="hub-docs-search">
            <Search size={19} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by API, provider, or category…" aria-label="Search APIs in documentation" />
            <span>{filteredApis.length} APIs</span>
          </label>
        </section>

        <section className="hub-docs-layout">
          <aside className="hub-docs-sidebar">
            <div className="hub-docs-sidebar-title">API DIRECTORY</div>
            <div className="hub-docs-api-list">
              {filteredApis.map((api) => (
                <button key={api.id} type="button" className={`hub-docs-api-item ${selectedApi?.id === api.id ? "is-active" : ""}`} onClick={() => setSelectedId(api.id)}>
                  <span className="hub-docs-api-dot" />
                  <span><strong>{api.name}</strong><small>{api.category}</small></span>
                </button>
              ))}
              {filteredApis.length === 0 && <p className="hub-docs-no-results">No APIs match that search.</p>}
            </div>
          </aside>

          <div className="hub-docs-content">
            {selectedApi ? (
              <>
                <div className="hub-docs-api-heading">
                  <div className="hub-docs-api-icon"><Code2 size={25} /></div>
                  <div className="hub-docs-api-title">
                    <span>{selectedApi.category} · {selectedApi.provider}</span>
                    <h2>{selectedApi.name}</h2>
                    <p>{selectedApi.description}</p>
                  </div>
                  <Link className="hub-docs-details-link" to={`/api/${selectedApi.id}`}>API details <ArrowRight size={15} /></Link>
                </div>

                <div className="hub-docs-facts">
                  <div><span>AUTHENTICATION</span><strong><KeyRound size={15} /> {selectedApi.authentication || "Check provider docs"}</strong></div>
                  <div><span>FREE TIER</span><strong>{selectedApi.freeTier || "Check provider pricing"}</strong></div>
                  <div><span>PRICING</span><strong>{selectedApi.pricing || "Check provider pricing"}</strong></div>
                </div>

                <section className="hub-docs-callout">
                  <ShieldCheck size={20} />
                  <div><strong>Before you send a request</strong><p>Confirm the endpoint, required authentication, rate limits, and pricing in the provider's official documentation. API Hub does not generate or supply provider API keys.</p></div>
                </section>

                <section className="hub-docs-section">
                  <h3><Globe size={18} /> Getting started</h3>
                  <ol className="hub-docs-steps">
                    <li><strong>Open the official documentation.</strong><span>Find the endpoint and required parameters supported by {selectedApi.name}.</span></li>
                    <li><strong>Set up authentication.</strong><span>{selectedApi.authentication && selectedApi.authentication.toLowerCase() === "none" ? "The API directory lists this API as requiring no authentication; verify this in the provider documentation." : "Follow the provider's instructions to obtain and securely store credentials if required."}</span></li>
                    <li><strong>Build the request.</strong><span>Use the correct HTTP method, URL, headers, and request body for the endpoint.</span></li>
                    <li><strong>Test and inspect.</strong><span>Send a request, then check the HTTP status and response body.</span></li>
                  </ol>
                  <div className="hub-docs-actions">
                    {selectedApi.documentation && <a href={selectedApi.documentation} target="_blank" rel="noopener noreferrer" className="hub-docs-primary">Official documentation <ExternalLink size={15} /></a>}
                    {selectedApi.website && <a href={selectedApi.website} target="_blank" rel="noopener noreferrer" className="hub-docs-secondary">Provider website <ExternalLink size={15} /></a>}
                    <Link to={`/api/${selectedApi.id}/test`} className="hub-docs-secondary">Open API tester <Terminal size={15} /></Link>
                  </div>
                </section>
              </>
            ) : (
              <div className="hub-docs-empty"><Search size={25} /><h2>No matching APIs</h2><p>Try another API name or category.</p></div>
            )}
          </div>
        </section>

        <section className="hub-docs-reference">
          <div className="hub-docs-reference-heading"><span className="hub-docs-eyebrow">QUICK REFERENCE</span><h2>HTTP methods at a glance</h2><p>Choose a method that matches the endpoint's documented behavior.</p></div>
          <div className="hub-docs-method-grid">
            {methodHelp.map((item) => <article className="hub-docs-method-card" key={item.method}><span className={`hub-docs-method-badge method-${item.method.toLowerCase()}`}>{item.method}</span><h3>{item.meaning}</h3><p>{item.example}</p></article>)}
          </div>
        </section>

        <section className="hub-docs-faq">
          <h2>Common questions</h2>
          {[
            ["auth", "What is an API key?", "An API key is a credential some providers use to identify or authorize a client. Get it only from the provider's official account or developer portal, and never commit it to frontend code or a public repository."],
            ["cors", "Why might a browser request fail?", "Some providers restrict browser-origin requests with CORS. A failed browser fetch does not necessarily mean the API is offline. A trusted backend integration may be needed."],
            ["status", "What does an HTTP status mean?", "A 2xx response usually indicates success; 4xx responses often indicate request or permission issues; 5xx responses indicate a server-side issue. Always check the provider's documentation."]
          ].map(([key, title, body]) => (
            <div className="hub-docs-faq-item" key={key}>
              <button type="button" onClick={() => toggleSection(key)} aria-expanded={expanded === key}>{title}<ChevronDown size={17} className={expanded === key ? "is-open" : ""} /></button>
              {expanded === key && <p>{body}</p>}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Documentation;
