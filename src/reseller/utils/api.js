const BASE_URL = import.meta.env.VITE_BASE_URL;

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("rToken");

  const domain =
    window.location.hostname === "localhost"
      ? "test.coinnees.com"
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
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API Error");
  }

  return res.json();
};