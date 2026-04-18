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
    const currentDomain = window.location.hostname;
    const mainDomains = [
      "console.devai.in",
      "vps.hostheaven.in",
      "console.getwebup.in",
      "localhost",    
      "127.0.0.1",
      "10.0.0.49",
      "project-dev-three.vercel.app"
    ];
    const isMainDomain = mainDomains.includes(currentDomain);

    let fetchPromise;

    if (isMainDomain) {
      fetchPromise = fetch(`${BASE_URL}/api/public/settings/general`).then((res) => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      });
    } else {
      fetchPromise = fetch(`${BASE_URL}/api/public/reseller/company`, {
        headers: { "X-Reseller-Domain": currentDomain },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load reseller settings");
          return res.json();
        })
        .then((data) => {
          if (!data || Object.keys(data).length === 0) {
            // Fallback to main admin branding
            console.log("Reseller branding not found, falling back to admin branding.");
            return fetch(`${BASE_URL}/api/public/settings/general`).then((res) => {
              if (!res.ok) throw new Error("Failed to load settings");
              return res.json();
            });
          }
          return data;
        });
    }

    fetchPromise
      .then((data) => {
        setSettings(data);
        // ✅ Sync document title and favicon
        if (data.companyName) {
          document.title = data.companyName;
        }
        if (data.logoUrl) {
          const link = document.querySelector("link[rel*='icon']");
          if (link) {
            link.href = data.logoUrl;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = data.logoUrl;
            document.head.appendChild(newLink);
          }
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
