import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // allowedHosts: ["console.getwebup.in"],
    headers: {
      "Permissions-Policy":
        "payment=(self), accelerometer=(self), gyroscope=(self), magnetometer=(self), device-orientation=(self)",
    },
    proxy: {
      "/api": {
        target: "https://vps.devai.in", 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
