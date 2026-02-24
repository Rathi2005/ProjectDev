import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";

const LocationSelector = ({ selected, onSelect }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const ZONES_API = `${BASE_URL}/api/users/zones`;

  useEffect(() => {
    const fetchZones = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(ZONES_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch zones");

        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error("Error fetching zones:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, [ZONES_API]);

  if (loading)
    return (
      <div className="text-gray-400 text-sm animate-pulse">
        Loading locations...
      </div>
    );

  if (locations.length === 0)
    return <div className="text-gray-400">No zones available.</div>;

  return (
    <div
      className="
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-5 pl-1
        h-[calc(100vh-220px)] overflow-y-auto pr-3 pb-6
        items-start scrollbar-thin
        scrollbar-thumb-[#2f365f] hover:scrollbar-thumb-indigo-500
        scrollbar-track-[#151c2f]
      "
    >
      {locations.map((zone) => (
        <div key={zone.id} className="flex justify-center">
          <button
            onClick={() => onSelect(selected === zone.id ? null : zone.id)}
            className={`
              relative w-full max-w-[320px] min-h-[150px] p-5 rounded-xl 
              border transition-all duration-300 text-left
              transform hover:scale-[1.02] active:scale-[0.99]
              ${
                selected === zone.id
                  ? "border-indigo-500 bg-gradient-to-br from-[#1b2236] to-[#0f1525] shadow-lg shadow-indigo-500/10"
                  : "border-[#2b3553] bg-gradient-to-br from-[#141a2d] to-[#0d111f] hover:border-indigo-400/60 hover:bg-gradient-to-br hover:from-[#1a2135] hover:to-[#12182a]"
              }
              group overflow-hidden
            `}
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-indigo-400 blur-xl"></div>
              <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-purple-400 blur-xl"></div>
            </div>

            {/* Selection glow effect */}
            {selected === zone.id && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5"></div>
                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-indigo-400 animate-pulse" />
              </>
            )}

            {/* Card content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`
                  p-2 rounded-lg transition-all duration-300
                  ${
                    selected === zone.id
                      ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300"
                      : "bg-gray-800/40 text-gray-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-300"
                  }
                `}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">
                    {zone.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        zone.status === "ACTIVE"
                          ? "bg-green-500 animate-pulse"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    <span
                      className={`
                      text-xs font-medium px-2 py-0.5 rounded-full
                      ${
                        zone.status === "ACTIVE"
                          ? "bg-green-500/10 text-green-300 border border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
                      }
                    `}
                    >
                      {zone.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional info section */}
              <div className="mt-4 pt-3 border-t border-gray-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">
                    Zone ID: {String(zone.id).substring(0, 8)}...
                  </span>

                  <div
                    className={`
                    text-xs font-medium px-2 py-1 rounded
                    transition-all duration-300
                    ${
                      selected === zone.id
                        ? "text-indigo-300 bg-indigo-500/20"
                        : "text-gray-500 group-hover:text-indigo-300 group-hover:bg-indigo-500/10"
                    }
                  `}
                  >
                    {selected === zone.id ? "Selected" : "Click to select"}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-transparent to-purple-500/3"></div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default LocationSelector;
