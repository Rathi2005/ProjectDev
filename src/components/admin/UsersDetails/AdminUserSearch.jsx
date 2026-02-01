import React, { useEffect, useState } from "react";
import { Search, User, Mail } from "lucide-react";

export default function AdminUserSearch({
  BASE_URL,
  onUserSelect,
  placeholder = "Search user by name, email or ID",
}) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${BASE_URL}/api/admin/users/overview?search=${encodeURIComponent(
          search
        )}&page=0&size=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("User search error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 bg-[#0e1525] border border-indigo-900/50 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Dropdown Results */}
      {search && (
        <div className="absolute z-50 w-full mt-2 bg-[#151c2f] border border-indigo-900/40 rounded-lg shadow-lg overflow-hidden">
          {loading && (
            <div className="p-3 text-sm text-gray-400">Searching...</div>
          )}

          {!loading && users.length === 0 && (
            <div className="p-3 text-sm text-gray-400">No users found</div>
          )}

          {!loading &&
            users.map((user) => (
              <button
                key={user.userId}
                onClick={() => {
                  onUserSelect({
                    id: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                  });
                  setSearch("");
                  setUsers([]);
                }}
                className="w-full text-left px-4 py-3 hover:bg-indigo-900/20 transition flex items-start gap-3"
              >
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    User ID: {user.userId}
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
