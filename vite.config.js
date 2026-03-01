import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    // host: "harshit.com",
    port: 5173,
    allowedHosts: true, // CRITICAL: Allows Nginx to pass ANY reseller domain to Vite
    headers: {
      "Permissions-Policy": "payment=(self), accelerometer=(self), gyroscope=(self), magnetometer=(self), device-orientation=(self)",
    }
    //  PROXY BLOCK DELETED: Nginx now handles all /api/ routing directly to your backend.
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true, // CRITICAL: Allows ANY reseller domain to view the preview build
  },
});