import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Copy,
  Check,
  Clock3,
  AlertCircle,
  LoaderCircle,
  Code2,
  ExternalLink,
} from "lucide-react";

import Navbar from "../components/Navbar";
import apiData from "../data/apiData";

const METHODS = ["GET", "POST", "PUT", "DELETE"];

const AUTH_GUIDANCE = {
  "No API Key": {
    summary: "This API is listed as not requiring an API key for its basic public examples.",
    steps: ["Use a documented public endpoint.", "Start with GET when you only need to read data.", "If you receive 403 or 429, check the provider's limits and access rules."]
  },
  "API Key": {
    summary: "This provider requires an API key for protected endpoints. Create or retrieve a key from the provider's official developer dashboard.",
    steps: ["Open the official documentation and find Authentication / Quickstart.", "Follow the provider's stated method for sending the key. Some APIs use an Authorization header; others require a query parameter or a provider-specific header.", "Do not guess the key format. Follow the provider's documentation exactly."]
  },
  "Access Token": {
    summary: "This API uses an access token. The provider's docs specify whether it belongs in a Bearer Authorization header or another header.",
    steps: ["Create an access token in the provider's dashboard.", "Read the provider's authentication section and copy its exact header format.", "Paste the token only into a trusted local environment; never commit it to source control."]
  },
  "API Token": {
    summary: "This provider uses an API token. Token header names and formats can differ between providers.",
    steps: ["Create a token in the official provider dashboard.", "Check the authentication docs for the exact header name and prefix.", "Add the documented header to the Headers JSON field."]
  },
  "Bearer Token": {
    summary: "This API uses a Bearer token for protected requests.",
    steps: ["Obtain a token using the provider's official flow.", "Add an Authorization header in the form Bearer YOUR_TOKEN, as documented by the provider.", "Keep real tokens private and rotate any token that is exposed."]
  }
};

const CATEGORY_GUIDANCE = {
  "AI / ML": {
    goal: "AI endpoints often use POST with a JSON request body. The body schema depends on the model and endpoint.",
    checklist: ["Choose a specific operation from the provider docs (for example, model listing, text generation, embeddings, or image generation).", "Use the exact endpoint path and required model name from the docs.", "Set Content-Type to application/json when sending JSON.", "Check model access, quota, and billing if you receive 401, 403, or 429."]
  },
  Weather: {
    goal: "Weather APIs commonly use GET requests with a location parameter and may require a provider-specific API key parameter or header.",
    checklist: ["Choose current weather or forecast from the provider docs.", "Add the required location, such as a city name or coordinates.", "Add units or language only if the endpoint supports them.", "Follow the provider's documented API-key placement; it differs between services."]
  },
  Maps: {
    goal: "Mapping APIs may provide geocoding, directions, places, tiles, or distance calculations. Each operation has its own endpoint and parameters.",
    checklist: ["Choose the required operation from the official docs.", "Use a valid address, place ID, or coordinate format as documented.", "Check usage restrictions and key restrictions in the provider dashboard.", "Use the provider's exact authentication format."]
  },
  Finance: {
    goal: "Financial APIs often return market, exchange-rate, or account data. Data availability and limits depend on the provider and plan.",
    checklist: ["Choose a documented endpoint, symbol, currency pair, or date range.", "Add all required query parameters.", "Check whether real-time data requires a paid plan or a separate entitlement.", "Keep account credentials and private keys out of shared screenshots."]
  },
  "Exchange Rates": {
    goal: "Exchange-rate endpoints typically require a base currency and may support target currencies or date filters.",
    checklist: ["Choose the current-rate or historical-rate endpoint in the docs.", "Enter supported currency codes, such as USD or INR, where required.", "Check the provider's update frequency and plan limits.", "Use the authentication method documented by this provider."]
  },
  News: {
    goal: "News APIs usually use GET requests with search terms, sources, language, or date filters.",
    checklist: ["Choose an articles, headlines, or search endpoint.", "Add the required query parameter, such as a keyword or country, as specified in the docs.", "Check source, pagination, and date-range limits.", "Use the provider's documented API-key format."]
  },
  Payment: {
    goal: "Payment APIs can create real transactions or modify financial records. Use test/sandbox credentials and test mode only.",
    checklist: ["Use the provider's test environment and test credentials.", "Follow the documented authentication method, which may require secret keys or signed requests.", "Use only test payment methods and non-production data.", "Never paste a live secret key into this browser playground."]
  },
  Security: {
    goal: "Security APIs may accept URLs, file hashes, IP addresses, or other indicators. Some actions can involve sensitive data.",
    checklist: ["Use a documented endpoint and an input you are authorized to analyze.", "Check whether the endpoint expects a query parameter, JSON body, or uploaded file.", "Follow the provider's authentication and rate-limit requirements.", "Do not submit confidential files or private URLs unless you are authorized."]
  },
  "Developer Tools": {
    goal: "Developer APIs may expose repositories, test endpoints, space data, or other resources. Many require tokens for private resources.",
    checklist: ["Choose the resource endpoint from the official docs.", "Start with a GET endpoint that reads a public resource when possible.", "Use the provider's exact token header and scopes for protected resources.", "Check pagination and rate limits."]
  },
  "AI / ML": {
    goal: "AI endpoints often use POST with a JSON request body. The body schema depends on the model and endpoint.",
    checklist: ["Choose a specific operation from the provider docs.", "Use the exact endpoint path and required model name from the docs.", "Set Content-Type to application/json when sending JSON.", "Check model access, quota, and billing if you receive 401, 403, or 429."]
  }
};

function getAuthGuide(api) {
  if (!api) return AUTH_GUIDANCE["API Key"];
  const auth = api.authentication || "API Key";
  if (AUTH_GUIDANCE[auth]) return AUTH_GUIDANCE[auth];
  if (/no auth|none|no api key/i.test(auth)) return AUTH_GUIDANCE["No API Key"];
  if (/token/i.test(auth)) return AUTH_GUIDANCE["API Token"];
  if (/key/i.test(auth)) return AUTH_GUIDANCE["API Key"];
  return {
    summary: `Authentication listed for this API: ${auth}. Check the provider's official documentation for the exact credential format.`,
    steps: ["Open the provider's authentication guide.", "Use the exact credential format and header or parameter name specified there.", "Never share real credentials or commit them to source control."]
  };
}


function formatJson(value) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function ApiTesting() {
  const { apiName } = useParams();
  const navigate = useNavigate();

  const api = useMemo(
    () => apiData.find((item) => item.id === apiName),
    [apiName]
  );

  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState(api?.baseUrl || "");
  const [queryParams, setQueryParams] = useState("");
  const [headers, setHeaders] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('{\n  \n}');
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [sampleNotice, setSampleNotice] = useState("");

  const canHaveBody = method === "POST" || method === "PUT";

  const sampleRequests = {
    publicGet: {
      method: "GET",
      endpoint: "https://jsonplaceholder.typicode.com/posts/1",
      queryParams: "",
      headers: '{\n  "Accept": "application/json"\n}',
      body: ""
    },
    publicCreate: {
      method: "POST",
      endpoint: "https://jsonplaceholder.typicode.com/posts",
      queryParams: "",
      headers: '{\n  "Accept": "application/json",\n  "Content-Type": "application/json"\n}',
      body: '{\n  "title": "Hello API Hub",\n  "body": "My first test request",\n  "userId": 1\n}'
    }
  };

  function loadSample(sampleKey, runImmediately = false) {
    const sample = sampleRequests[sampleKey];
    setMethod(sample.method);
    setEndpoint(sample.endpoint);
    setQueryParams(sample.queryParams);
    setHeaders(sample.headers);
    setBody(sample.body);
    setResponse("");
    setStatus(null);
    setResponseTime(null);
    setError("");
    setSampleNotice(
      runImmediately
        ? "Starting the public sample request…"
        : sampleKey === "publicGet"
          ? "GET sample loaded. The request is ready; click Send Request to run it."
          : "POST sample loaded. JSONPlaceholder simulates creation and does not permanently save data."
    );
    if (runImmediately) {
      // Execute using the sample object directly; do not depend on React state
      // updates having completed before the request starts.
      void sendSampleRequest(sample);
    }
  }

  async function sendSampleRequest(sample) {
    setSampleNotice("Sending sample request…");
    setError("");
    setResponse("");
    setStatus(null);
    setResponseTime(null);
    setLoading(true);
    const started = performance.now();
    try {
      const result = await fetch(sample.endpoint, {
        method: sample.method,
        headers: JSON.parse(sample.headers),
        ...(sample.body ? { body: sample.body } : {})
      });
      const elapsed = Math.round(performance.now() - started);
      const text = await result.text();
      setStatus({ code: result.status, label: result.statusText, ok: result.ok });
      setResponseTime(elapsed);
      try {
        setResponse(text ? JSON.stringify(JSON.parse(text), null, 2) : "(Empty response body)");
      } catch {
        setResponse(text || "(Empty response body)");
      }
      setSampleNotice(result.ok
        ? `Sample request succeeded: HTTP ${result.status} ${result.statusText} in ${elapsed} ms.`
        : `The server responded with HTTP ${result.status}. See the response below for details.`);
    } catch (e) {
      const message = "Sample request could not be completed. Check your connection; the browser or network may be blocking the request. Details: " + (e.message || "Network error");
      setError(message);
      setSampleNotice("Sample request failed. See the error in Response Preview.");
    } finally {
      setLoading(false);
    }
  }

  function resetRequest() {
    setMethod("GET");
    setEndpoint(api?.baseUrl || "");
    setQueryParams("");
    setHeaders('{\n  "Accept": "application/json"\n}');
    setBody('{\n  \n}');
    setResponse("");
    setStatus(null);
    setResponseTime(null);
    setError("");
    setSampleNotice("");
    setCopied(false);
  }

  function getResponseHint() {
    if (!status) return "";
    if (status.code >= 200 && status.code < 300) {
      return "Success: the server accepted the request. Inspect the JSON below for the returned data.";
    }
    if (status.code === 400) return "Bad Request: check the endpoint, query parameters, headers, and request body.";
    if (status.code === 401) return "Unauthorized: this API likely needs a valid API key or other credentials.";
    if (status.code === 403) return "Forbidden: your credentials may not have permission to access this resource.";
    if (status.code === 404) return "Not Found: verify the endpoint path and resource ID.";
    if (status.code === 429) return "Rate Limited: wait and check the provider's request limits.";
    if (status.code >= 500) return "Server Error: the provider encountered a problem. Try again later or check its status page.";
    return "The server returned a response. Check the status and provider documentation for details.";
  }

  async function sendRequest() {
    setSampleNotice("Sending request…");
    setError("");
    setResponse("");
    setStatus(null);
    setResponseTime(null);

    if (!endpoint.trim()) {
      setError("Enter a request URL before sending.");
      return;
    }

    let requestUrl;
    let parsedHeaders;

    try {
      requestUrl = new URL(endpoint.trim());
      if (!["http:", "https:"].includes(requestUrl.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported.");
      }
    } catch (e) {
      setError(e.message || "Enter a valid full URL, including https://.");
      return;
    }

    try {
      parsedHeaders = JSON.parse(headers || "{}");
      if (
        parsedHeaders === null ||
        Array.isArray(parsedHeaders) ||
        typeof parsedHeaders !== "object"
      ) {
        throw new Error("Headers must be a JSON object.");
      }
    } catch {
      setError('Headers must be valid JSON, for example: {"Accept":"application/json"}.');
      return;
    }

    if (queryParams.trim()) {
      const normalizedQuery = queryParams
        .replace(/^\?/, "")
        .split(/[\r\n&]+/)
        .map((part) => part.trim())
        .filter(Boolean);
      for (const part of normalizedQuery) {
        const separator = part.indexOf("=");
        if (separator === -1) {
          setError(`Invalid query parameter "${part}". Use key=value, one per line.`);
          return;
        }
        const key = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();
        if (!key) {
          setError(`Invalid query parameter "${part}". The parameter name cannot be empty.`);
          return;
        }
        requestUrl.searchParams.set(key, value);
      }
    }

    const options = {
      method,
      headers: parsedHeaders,
    };

    if (canHaveBody && body.trim()) {
      try {
        JSON.parse(body);
      } catch {
        setError("Request body must be valid JSON.");
        return;
      }
      options.body = body;
      if (!Object.keys(parsedHeaders).some((key) => key.toLowerCase() === "content-type")) {
        options.headers["Content-Type"] = "application/json";
      }
    }

    setLoading(true);
    const started = performance.now();

    try {
      const result = await fetch(requestUrl.toString(), options);
      const elapsed = Math.round(performance.now() - started);
      const text = await result.text();

      setStatus({ code: result.status, label: result.statusText, ok: result.ok });
      setResponseTime(elapsed);
      setSampleNotice(result.ok
        ? `Request completed: HTTP ${result.status} ${result.statusText} in ${elapsed} ms.`
        : `Request returned HTTP ${result.status}. See the response and guidance below.`);

      if (!text) {
        setResponse("(Empty response body)");
      } else {
        try {
          setResponse(JSON.stringify(JSON.parse(text), null, 2));
        } catch {
          setResponse(text);
        }
      }
    } catch (e) {
      setError(
        "Request could not be completed by the browser. The provider may require authentication, be unavailable, or block browser requests with CORS. For CORS-restricted APIs, a backend proxy must be configured. Details: " +
          (e.message || "Network error")
      );
      setSampleNotice("Request failed before an HTTP response was available.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not access the clipboard. Select the response text and copy it manually.");
    }
  }

  if (!api) {
    return (
      <div className="api-testing-page">
        <Navbar />
        <main className="api-testing-container">
          <div className="testing-empty-state">
            <AlertCircle size={32} />
            <h1>API not found</h1>
            <p>We couldn't find this API in the API Hub directory.</p>
            <button className="testing-button testing-button-primary" onClick={() => navigate("/explore")}>
              <ArrowLeft size={16} /> Back to Explore
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="api-testing-page">
      <Navbar />
      <main className="api-testing-container">
        <button className="testing-back-button" onClick={() => navigate(`/api/${api.id}`)}>
          <ArrowLeft size={16} /> Back to API Details
        </button>

        <header className="testing-header">
          <div className="testing-heading-icon"><Code2 size={27} /></div>
          <div>
            <span className="testing-eyebrow">API HUB PLAYGROUND</span>
            <h1>Test {api.name}</h1>
            <p>Send a request and inspect the response without leaving API Hub.</p>
          </div>
        </header>

        <section className="testing-info-banner">
          <AlertCircle size={18} />
          <p>
            Use only endpoints and credentials you are authorized to access. Some providers require an API key.
            Browser CORS restrictions may prevent a request even when the API is working.
          </p>
        </section>

        <section className="testing-guide">
          <button
            type="button"
            className="testing-guide-toggle"
            onClick={() => setShowGuide((current) => !current)}
            aria-expanded={showGuide}
          >
            <span>
              <span className="testing-eyebrow">NEW TO APIs?</span>
              <strong>How to test an API — step by step</strong>
            </span>
            <span className="testing-guide-toggle-icon">{showGuide ? "−" : "+"}</span>
          </button>

          {showGuide && (
            <div className="testing-guide-content">
              <ol className="testing-guide-steps">
                <li><strong>Choose an endpoint.</strong><span>A base URL is not always enough. Add the resource path, such as <code>/posts/1</code>.</span></li>
                <li><strong>Select the HTTP method.</strong><span>GET reads data; POST sends new data; PUT updates data; DELETE requests removal.</span></li>
                <li><strong>Add parameters and headers.</strong><span>Only enter what the provider's documentation requires. Many APIs require an API key.</span></li>
                <li><strong>Send the request.</strong><span>Click Send Request and wait for the HTTP status, response time, and response body.</span></li>
              </ol>
              <div className="testing-samples">
                <div>
                  <strong>Try a safe public example</strong>
                  <p>This sample API requires no API key and returns example JSON.</p>
                </div>
                <div className="testing-sample-actions">
                  <button type="button" className="testing-button testing-button-secondary" onClick={() => loadSample("publicGet")}>Load GET sample</button>
                  <button
                    type="button"
                    className="testing-button testing-button-primary"
                    onClick={() => loadSample("publicGet", true)}
                    disabled={loading}
                  >
                    {loading ? <LoaderCircle className="testing-spinner" size={14} /> : <Play size={14} />}
                    {loading ? "Running sample..." : "Run sample"}
                  </button>
                </div>
              </div>
              {sampleNotice && <p className="testing-sample-notice" role="status">{sampleNotice}</p>}
              <p className="testing-guide-footnote">Never paste private or production API keys into a request you do not trust. Browser CORS restrictions can block some providers; those requests may need a backend proxy.</p>
            </div>
          )}
        </section>

        <section className="testing-api-doc">
          <div className="testing-api-doc-header">
            <div>
              <span className="testing-eyebrow">API-SPECIFIC DOCUMENTATION</span>
              <h2>How to test {api.name}</h2>
              <p>{api.description}</p>
            </div>
            {api.documentation && (
              <a href={api.documentation} target="_blank" rel="noopener noreferrer" className="testing-button testing-button-secondary">
                Official docs <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="testing-api-doc-facts">
            <div><span>Provider</span><strong>{api.provider}</strong></div>
            <div><span>Authentication</span><strong>{api.authentication || "Check provider docs"}</strong></div>
            <div className="testing-api-doc-base"><span>Base URL</span><code>{api.baseUrl || "Use the base URL shown in the official documentation"}</code></div>
          </div>

          <div className="testing-api-doc-auth">
            <h3>1. Authentication</h3>
            <p>{getAuthGuide(api).summary}</p>
            <ol>
              {getAuthGuide(api).steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
          </div>

          <div className="testing-api-doc-auth">
            <h3>2. Choose an endpoint and configure the request</h3>
            <p>{(CATEGORY_GUIDANCE[api.category] || {
              goal: "Choose an operation from this provider's official API documentation. The base URL alone may not be a complete endpoint.",
              checklist: ["Find the endpoint path and HTTP method in the official docs.", "Copy the complete endpoint URL into Request URL.", "Add only the required query parameters, headers, and request body."]
            }).goal}</p>
            <ol>
              {(CATEGORY_GUIDANCE[api.category] || {
                checklist: ["Find the endpoint path and HTTP method in the official docs.", "Copy the complete endpoint URL into Request URL.", "Add only the required query parameters, headers, and request body."]
              }).checklist.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
          </div>

          <div className="testing-api-doc-bottom">
            <div>
              <h3>3. Send and understand the result</h3>
              <p>Click <strong>Send Request</strong>. A 2xx status usually means the server accepted the request. A 401 often indicates authentication problems, 403 indicates insufficient access, 404 usually means the path is wrong, and 429 usually means a rate limit was reached.</p>
            </div>
            <button
              type="button"
              className="testing-button testing-button-secondary"
              onClick={() => {
                setEndpoint(api.baseUrl || "");
                setMethod("GET");
                setQueryParams("");
                setHeaders('{\n  "Accept": "application/json"\n}');
                setBody('{\n  \n}');
                setResponse("");
                setStatus(null);
                setResponseTime(null);
                setError("");
                setSampleNotice("Base URL loaded. Add a documented endpoint path and required authentication before sending.");
              }}
            >
              Use base URL in builder
            </button>
          </div>
          <p className="testing-api-doc-disclaimer">Endpoint paths and authentication formats are provider-specific. This guide uses the API's catalog metadata and category guidance; follow the linked official documentation for the exact endpoint, parameters, and credential format. Do not assume the base URL by itself is callable.</p>
        </section>

        <section className="testing-panel">
          <div className="testing-panel-title">
            <div><span className="testing-eyebrow">REQUEST BUILDER</span><h2>Configure request</h2></div>
            <span className="testing-api-chip">{api.category}</span>
          </div>

          <label className="testing-label" htmlFor="testing-endpoint">Request URL</label>
          <div className="testing-url-row">
            <select aria-label="HTTP method" value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input
              id="testing-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/v1/resource"
              spellCheck="false"
            />
          </div>

          <label className="testing-label" htmlFor="testing-query">Query parameters <span>(optional; one key=value per line)</span></label>
          <textarea id="testing-query" rows={3} value={queryParams} onChange={(e) => setQueryParams(e.target.value)} placeholder={"city=Hyderabad\nunits=metric"} />

          <div className="testing-two-columns">
            <div>
              <label className="testing-label" htmlFor="testing-headers">Headers (JSON) <span>Use the exact auth format from official docs</span></label>
              <textarea id="testing-headers" className="testing-code-input" rows={5} value={headers} onChange={(e) => setHeaders(e.target.value)} spellCheck="false" />
            </div>
            {canHaveBody && (
              <div>
                <label className="testing-label" htmlFor="testing-body">Request body (JSON)</label>
                <textarea id="testing-body" className="testing-code-input" rows={5} value={body} onChange={(e) => setBody(e.target.value)} spellCheck="false" />
              </div>
            )}
          </div>

          <div className="testing-request-actions">
            <div className="testing-request-secondary-actions">
              <button type="button" className="testing-button testing-button-secondary" onClick={() => loadSample("publicCreate")} disabled={loading}>
                Load POST sample
              </button>
              <button type="button" className="testing-button testing-button-secondary" onClick={resetRequest} disabled={loading}>
                Reset
              </button>
            </div>
            {api.documentation && (
              <a className="testing-doc-link" href={api.documentation} target="_blank" rel="noopener noreferrer">
                Documentation <ExternalLink size={14} />
              </a>
            )}
            <button className="testing-button testing-button-primary" onClick={sendRequest} disabled={loading}>
              {loading ? <LoaderCircle className="testing-spinner" size={17} /> : <Play size={16} />}
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </section>

        <section className="testing-panel testing-response-panel">
          {sampleNotice && (
            <div className={`testing-request-notice ${error ? "is-error" : status?.ok ? "is-success" : "is-neutral"}`} role="status">
              {loading && <LoaderCircle className="testing-spinner" size={15} />}
              <span>{sampleNotice}</span>
            </div>
          )}
          <div className="testing-panel-title">
            <div><span className="testing-eyebrow">RESPONSE</span><h2>Response preview</h2></div>
            {response && (
              <button className="testing-copy-button" onClick={copyResponse}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : "Copy response"}
              </button>
            )}
          </div>

          {(status || responseTime !== null) && (
            <div className="testing-response-meta">
              {status && <span className={`testing-status ${status.ok ? "is-success" : "is-error"}`}>{status.code} {status.label}</span>}
              {responseTime !== null && <span><Clock3 size={14} /> {responseTime} ms</span>}
            </div>
          )}

          {error && <div className="testing-error"><AlertCircle size={17} /><span>{error}</span></div>}
          {status && <div className={`testing-response-hint ${status.ok ? "is-success" : "is-warning"}`}>{getResponseHint()}</div>}
          {response ? (
            <pre className="testing-response-code"><code>{formatJson(response)}</code></pre>
          ) : (
            <div className="testing-response-placeholder">
              {loading ? <LoaderCircle className="testing-spinner" size={25} /> : <Code2 size={25} />}
              <p>{loading ? "Waiting for the API response…" : "Your response will appear here after you send a request."}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ApiTesting;
