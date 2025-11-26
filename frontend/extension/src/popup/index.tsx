import React from "react";
import { createRoot } from "react-dom/client";
import { ExtensionProvider } from "../providers/ExtensionProvider";
import { AppProviders } from "../providers";
import { ErrorBoundary } from "../components/common";
import "../styles/global.css";
import Popup from "./Popup";

const container = document.getElementById("popup-root");
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <AppProviders>
        <ExtensionProvider>
          <Popup />
        </ExtensionProvider>
      </AppProviders>
    </ErrorBoundary>
  );
}
