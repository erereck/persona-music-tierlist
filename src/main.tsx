import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "../app/globals.css";
import { TierEditor } from "../app/TierEditor";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TierEditor />
  </React.StrictMode>,
);
