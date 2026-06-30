import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { DataProvider } from "./data/DataProvider.jsx";
import { enforceClientVersion } from "./utils/appVersion.js";
import "./index.css"; 

enforceClientVersion();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });

  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
);
