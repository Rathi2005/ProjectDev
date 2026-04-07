import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // or adminToken

    fetch(`${BASE_URL}/api/admin/settings/general`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ IMPORTANT
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or failed");
        return res.json();
      })
      .then((data) => {
        console.log("SETTINGS DATA:", data); // ✅ debug
        setSettings(data);
      })
      .catch((err) => {
        console.error("Failed to load settings", err);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// ✅ VERY IMPORTANT EXPORT
export const useSettings = () => useContext(SettingsContext);
