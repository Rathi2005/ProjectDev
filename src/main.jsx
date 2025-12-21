import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; 
import { Toaster } from "react-hot-toast";

if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" />
  </React.StrictMode>
);
