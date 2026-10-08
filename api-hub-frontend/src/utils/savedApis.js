import { useEffect, useState } from "react";

const SAVED_APIS_KEY = "api-hub-saved-apis";
const SAVED_APIS_EVENT = "api-hub-saved-apis-changed";

export const getSavedApis = () => {
  try {
    const stored = localStorage.getItem(SAVED_APIS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setSavedApis = (apiIds) => {
  localStorage.setItem(SAVED_APIS_KEY, JSON.stringify(apiIds));
  window.dispatchEvent(new Event(SAVED_APIS_EVENT));
};

export const toggleSavedApi = (apiId) => {
  const current = getSavedApis();
  const next = current.includes(apiId)
    ? current.filter((id) => id !== apiId)
    : [...current, apiId];

  setSavedApis(next);
  return next;
};

export const useSavedApis = () => {
  const [savedApis, setSavedApisState] = useState(getSavedApis);

  useEffect(() => {
    const sync = () => setSavedApisState(getSavedApis());

    window.addEventListener("storage", sync);
    window.addEventListener(SAVED_APIS_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SAVED_APIS_EVENT, sync);
    };
  }, []);

  const toggleSave = (apiId) => {
    const next = toggleSavedApi(apiId);
    setSavedApisState(next);
  };

  return {
    savedApis,
    toggleSave,
    isSaved: (apiId) => savedApis.includes(apiId),
  };
};

export default SAVED_APIS_KEY;
