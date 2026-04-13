import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import toast, { Toaster } from "react-hot-toast";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsProvider } from "./context/AppSettingsContext.jsx";

if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  // NOTE: console.error is intentionally LEFT ACTIVE in production
  // so that runtime exceptions and library errors are visible for debugging.
}

// ── QueryClient: single instance, production-grade defaults ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30s — queries are fresh for 30s before refetch
      gcTime: 5 * 60 * 1000,       // 5min — unused cache is gc'd after 5min
      refetchOnWindowFocus: true,   // refetch when user returns to tab
      retry: (failureCount, error) => {
        // Never retry auth / not-found / network errors
        // status=0 means CORS failure or offline — retrying won't help
        if ([0, 401, 403, 404].includes(error?.status)) return false;
        return failureCount < 2;    // max 2 retries for transient 5xx errors
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Global fallback: show toast for unhandled mutation errors
        const msg = error?.message || "Something went wrong";
        toast.error(msg);
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <App />
        <Toaster position="top-right" />
      </SettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
