import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const DEFAULT_SETTINGS = {
    companyName: "ServerLink",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6f4thC2A4DalM-SgyOPhZaaec04PwADttAQ&s",
    companyAddress: "delhi",
    companyPhone: "3434343434",
    defaultPhone: "5555555555"
  };

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
        console.error("Failed to load settings from API, using defaults.", err);
        setSettings(DEFAULT_SETTINGS);
        document.title = DEFAULT_SETTINGS.companyName;
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
