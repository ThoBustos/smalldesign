import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./small/analytics";
import "./small/styles.css";
import "./small/diagnostic.css";
initAnalytics();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
