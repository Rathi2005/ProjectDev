const BASE_URL = import.meta.env.VITE_BASE_URL;

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("rToken");

  const domain =
    window.location.hostname === "localhost"
      ? "shribankebiharitraders.com"
      : window.location.hostname;

  const headers = {
    "Content-Type": "application/json",
    "X-Reseller-Domain": domain,
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "API Error");
  }

  return res.json();
};