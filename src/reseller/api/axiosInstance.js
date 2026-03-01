import axios from "axios";

const instance = axios.create({
  baseURL: "https://console.devai.in",
});

// Attach origin automatically
instance.interceptors.request.use((config) => {
  const rToken = localStorage.getItem("rToken");

  if (rToken) {
    config.headers.Authorization = `Bearer ${rToken}`;
  }

  // Add origin header here
  config.headers["X-Origin"] = window.location.origin;

  return config;
});

export default instance;