import React, { useState, useEffect } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";

const LocationSelector = ({ selected, onSelect }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const SERVER_LOCATION = `${BASE_URL}/api/options/servers/by-location`;

  useEffect(() => {
    const fetchLocations = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(SERVER_LOCATION, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch locations");
        const data = await res.json();

        const formatted = Object.entries(data).flatMap(
          ([locationName, servers]) =>
            servers
              .filter(
                (s) =>
                  s.status?.toUpperCase() === "ACTIVE" ||
                  s.isActive === 1 ||
                  s.active === true,
              )
              .map((server) => ({
                ...server,
                locationName,
              })),
        );

        setLocations(formatted);
      } catch (err) {
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [SERVER_LOCATION]);

  if (loading)
    return (
      <div className="text-gray-400 text-sm animate-pulse">
        Loading locations...
      </div>
    );

  if (locations.length === 0)
    return <div className="text-gray-400">No server locations available.</div>;

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
      {locations.map((server) => (
        <div key={server.id} className="flex justify-center">
          <button
            onClick={() => onSelect(server.locationName, server.id)}
            className={`relative w-full max-w-[320px] min-h-[150px] p-5 rounded-xl border transition-all duration-200 text-left
        ${
          selected === server.id
            ? "border-indigo-500 bg-[#1b2236]"
            : "border-[#2b3553] bg-[#141a2d] hover:border-indigo-400/70 hover:bg-[#1a2135]"
        } shadow-sm hover:shadow-md`}
          >
            {selected === server.id && (
              <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-indigo-400" />
            )}

            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-md bg-gray-700/20 text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                {server.name}
              </h3>
            </div>

            <p className="text-xs text-gray-400 mb-2">
              Location: {server.locationName}
            </p>

            <p className="text-sm font-medium">
              Status: <span className="text-green-400">{server.status}</span>
            </p>
          </button>
        </div>
      ))}
    </div>
  );
};

export default LocationSelector;
