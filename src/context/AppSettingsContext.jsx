import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/public/settings/general`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then((data) => {
        setSettings(data);
        // ✅ Sync document title with company name
        if (data.companyName) {
          document.title = data.companyName;
        }
      })
      .catch((err) => {
        console.error("Failed to load settings", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// ✅ VERY IMPORTANT EXPORT
export const useSettings = () => useContext(SettingsContext);
