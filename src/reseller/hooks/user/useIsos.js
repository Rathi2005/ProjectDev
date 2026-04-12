  import { useEffect, useState } from "react";

export default function useBasicIsos(serverId) {
  const [isos, setIsos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!serverId) return;

    const fetchIsos = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${BASE_URL}/api/users/servers/${serverId}/isos/basic`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to fetch ISOs");
        }

        const data = await res.json();
        setIsos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setIsos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIsos();
  }, [serverId, BASE_URL]);

  return {
    isos,      // [{ id, iso }]
    loading,   // boolean
    error,     // string | null
  };
}
