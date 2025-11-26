import React from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "../providers";
import { ErrorBoundary } from "../components/common";
import LoginApp from "./LoginApp";
import "../styles/global.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <LoginApp />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
