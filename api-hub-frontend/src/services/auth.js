import { useEffect, useState } from "react";

/*
  Keeps the JWT and the logged-in user in the browser.

  SECURITY NOTE: localStorage is readable by any JavaScript on the page, so an XSS bug
  could steal the token. It is acceptable for a learning/demo project. For production,
  have the backend set the JWT in an HttpOnly, Secure, SameSite cookie instead.
  Passwords are never stored - only the token and basic user info.
*/

const TOKEN_KEY = "api-hub-token";
const USER_KEY = "api-hub-user";
export const AUTH_EVENT = "api-hub-auth-changed";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => Boolean(getToken());

// `auth` is the response of POST /auth/login or /auth/register: { token, user, ... }
export const setSession = (auth) => {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
};

// React hook: re-renders the component whenever the user logs in or out.
export const useAuth = () => {
  const [state, setState] = useState(() => ({ token: getToken(), user: getUser() }));

  useEffect(() => {
    const sync = () => setState({ token: getToken(), user: getUser() });
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user: state.user, isAuthenticated: Boolean(state.token), logout: clearSession };
};
