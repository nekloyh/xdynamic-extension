import React from "react";
import ReactDOM from "react-dom/client";
import OnboardingApp from "./OnboardingApp";
import { AppProviders } from "../providers";
import { ErrorBoundary } from "../components/common";
import "../styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <OnboardingApp />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
