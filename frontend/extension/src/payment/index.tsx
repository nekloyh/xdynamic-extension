import React from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "../providers";
import { ErrorBoundary } from "../components/common";
import PaymentApp from "./PaymentApp";
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
        <PaymentApp />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
