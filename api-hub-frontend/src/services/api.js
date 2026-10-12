import { clearSession, getToken } from "./auth";

/*
  All communication with the Spring Boot backend lives in this file.
  The base URL comes from .env (VITE_API_BASE_URL), e.g. http://localhost:8080/api
*/
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors || null;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the API Hub server. Is the backend running?", 0);
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    // Expired / invalid token: forget it so the UI shows the logged-out state.
    if (response.status === 401 && auth && token) clearSession();
    const fieldErrors = data?.fieldErrors;
    const firstField = fieldErrors ? Object.values(fieldErrors)[0] : null;
    throw new ApiError(firstField || data?.message || `Request failed (${response.status})`, response.status, fieldErrors);
  }
  return data;
}

/* ---------- Authentication ---------- */
export const registerUser = ({ name, email, password }) =>
  request("/auth/register", { method: "POST", body: { name, email, password } });
export const loginUser = ({ email, password }) =>
  request("/auth/login", { method: "POST", body: { email, password } });
export const forgotPassword = (email) =>
  request("/auth/forgot-password", { method: "POST", body: { email } });
// Step 2 of "forgot password": email + the 6-digit OTP from the email + the new password
export const resetPassword = ({ email, otp, newPassword }) =>
  request("/auth/reset-password", { method: "POST", body: { email, otp, newPassword } });
export const fetchMe = () => request("/auth/me", { auth: true });

/* ---------- API directory (public) ---------- */
export const fetchApis = ({ query, category, provider } = {}) => {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (category) params.set("category", category);
  if (provider) params.set("provider", provider);
  const qs = params.toString();
  return request(`/apis${qs ? `?${qs}` : ""}`);
};
export const fetchApi = (id) => request(`/apis/${encodeURIComponent(id)}`);
export const fetchCategories = () => request("/apis/categories");
export const fetchProviders = () => request("/apis/providers");

/* ---------- Saved APIs ---------- */
export const fetchSavedApis = () => request("/saved-apis", { auth: true });
export const saveApi = (id) => request(`/saved-apis/${encodeURIComponent(id)}`, { method: "PUT", auth: true });
export const unsaveApi = (id) => request(`/saved-apis/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });

/* ---------- Dashboard ---------- */
export const fetchDashboard = () => request("/dashboard", { auth: true });

/* ---------- Projects (backend ready; the Projects page is still empty) ---------- */
export const listProjects = () => request("/projects", { auth: true });
export const getProject = (id) => request(`/projects/${id}`, { auth: true });
export const createProject = (data) => request("/projects", { method: "POST", body: data, auth: true });
export const updateProject = (id, data) => request(`/projects/${id}`, { method: "PUT", body: data, auth: true });
export const deleteProject = (id) => request(`/projects/${id}`, { method: "DELETE", auth: true });

/* ---------- API tester (the backend sends the request for you) ---------- */
// payload: { apiId, method, url, headers?, queryParams?, body? }
// returns:  { status, statusText, durationMs, headers, body, truncated }
export const executeTest = (payload) =>
  request("/tester/execute", { method: "POST", body: payload, auth: true });
