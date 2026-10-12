import { useEffect, useState } from "react";
import { AUTH_EVENT, isLoggedIn } from "../services/auth";
import { fetchSavedApis, saveApi, unsaveApi } from "../services/api";

/*
  Saved APIs.
  - Logged in : the list lives in the backend database (saved_apis table).
  - Logged out: the list stays in localStorage exactly as before.
  The exports (getSavedApis, toggleSavedApi, useSavedApis) keep the same names and
  behaviour, so ApiCard, ApiDetails and Dashboard do not need to change.
*/

const SAVED_APIS_KEY = "api-hub-saved-apis";
const SAVED_APIS_EVENT = "api-hub-saved-apis-changed";

let serverSaved = [];          // cache of the logged-in user's saved ids
let loadedForSession = false;  // have we fetched the list since logging in?

const emit = () => window.dispatchEvent(new Event(SAVED_APIS_EVENT));

/* ---------- local (logged-out) storage ---------- */
export const getSavedApis = () => {
  try {
    const stored = localStorage.getItem(SAVED_APIS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setLocalSavedApis = (apiIds) => {
  localStorage.setItem(SAVED_APIS_KEY, JSON.stringify(apiIds));
  emit();
};

/* ---------- which list is active ---------- */
const currentList = () => (isLoggedIn() ? serverSaved : getSavedApis());

export const loadServerSavedApis = async () => {
  if (!isLoggedIn()) {
    serverSaved = [];
    loadedForSession = false;
    emit();
    return;
  }
  try {
    serverSaved = await fetchSavedApis();
    loadedForSession = true;
  } catch {
    serverSaved = [];
  }
  emit();
};

// Call right after login/signup: moves APIs saved while logged out into the account.
export const mergeLocalSavedApis = async () => {
  const local = getSavedApis();
  await Promise.all(local.map((id) => saveApi(id).catch(() => null)));
  localStorage.removeItem(SAVED_APIS_KEY);
  loadedForSession = false;
  await loadServerSavedApis();
};

export const toggleSavedApi = (apiId) => {
  const current = currentList();
  const next = current.includes(apiId)
    ? current.filter((id) => id !== apiId)
    : [...current, apiId];

  if (!isLoggedIn()) {
    setLocalSavedApis(next);
    return next;
  }

  // Logged in: update the screen immediately, then tell the server; undo if it fails.
  const previous = serverSaved;
  serverSaved = next;
  emit();
  const call = next.includes(apiId) ? saveApi(apiId) : unsaveApi(apiId);
  call.catch(() => {
    serverSaved = previous;
    emit();
  });
  return next;
};

export const useSavedApis = () => {
  const [savedApis, setSavedApisState] = useState(currentList);

  useEffect(() => {
    const sync = () => setSavedApisState(currentList());
    const onAuthChange = () => {
      loadedForSession = false;
      loadServerSavedApis();
      sync();
    };

    window.addEventListener("storage", sync);
    window.addEventListener(SAVED_APIS_EVENT, sync);
    window.addEventListener(AUTH_EVENT, onAuthChange);

    if (isLoggedIn() && !loadedForSession) {
      loadedForSession = true; // avoid many cards each fetching
      loadServerSavedApis();
    }

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SAVED_APIS_EVENT, sync);
      window.removeEventListener(AUTH_EVENT, onAuthChange);
    };
  }, []);

  const toggleSave = (apiId) => {
    setSavedApisState(toggleSavedApi(apiId));
  };

  return {
    savedApis,
    toggleSave,
    isSaved: (apiId) => savedApis.includes(apiId),
  };
};

export default SAVED_APIS_KEY;
