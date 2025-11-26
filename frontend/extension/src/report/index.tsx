import React from "react";
import ReactDOM from "react-dom/client";
import ReportApp from "./ReportApp";
import { AppProviders } from "../providers";
import { ErrorBoundary } from "../components/common";
import "../styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <ReportApp />
      </AppProviders>
    </ErrorBoundary>
  </React.StrictMode>
);
