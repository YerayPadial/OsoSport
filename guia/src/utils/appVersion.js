const APP_STORAGE_VERSION =
  import.meta.env.VITE_STORAGE_VERSION || "2026-06-30-v2";

const VERSION_KEY = "ososport-app-version";
const LOCAL_STORAGE_KEYS = ["ososport-active-session"];
const SESSION_STORAGE_KEYS = ["ososport-pending-official-workout"];

function removeStorageKeys(storage, keys) {
  keys.forEach((key) => {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage failures so the app can still load.
    }
  });
}

export function enforceClientVersion() {
  let storedVersion = null;

  try {
    storedVersion = window.localStorage.getItem(VERSION_KEY);
  } catch {
    storedVersion = null;
  }

  if (storedVersion === APP_STORAGE_VERSION) {
    return;
  }

  removeStorageKeys(window.localStorage, LOCAL_STORAGE_KEYS);
  removeStorageKeys(window.sessionStorage, SESSION_STORAGE_KEYS);

  try {
    window.localStorage.setItem(VERSION_KEY, APP_STORAGE_VERSION);
  } catch {
    // Ignore version persistence failures and continue booting the app.
  }
}

export { APP_STORAGE_VERSION };
