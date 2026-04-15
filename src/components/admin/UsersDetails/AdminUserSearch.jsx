import React, { useEffect, useState } from "react";
import { Search, User, Mail } from "lucide-react";

export default function AdminUserSearch({
  BASE_URL,
  onUserSelect,
  placeholder = "Search user by name, email or ID",
}) {
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    // Modern abort controller pattern to prevent detached responses
    const controller = new AbortController();
    const delayDebounce = setTimeout(() => {
      fetchUsers(controller.signal);
    }, 400); // debounce

    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
  }, [search, searchBy]);

  const fetchUsers = async (signal) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      let url = `${BASE_URL}/api/admin/users/overview?search=${encodeURIComponent(search)}&page=0&size=5`;
      if (searchBy) url += `&searchBy=${searchBy}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error("User search error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
        <select 
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          className="absolute left-9 py-2 bg-transparent border-none text-xs text-indigo-300 focus:ring-0 outline-none z-10 w-24 cursor-pointer"
        >
          <option value="">Global</option>
          <option value="id">ID</option>
          <option value="email">Email</option>
          <option value="name">Name</option>
          <option value="billing">Billing</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-[9.5rem] pr-4 py-2 bg-[#0e1525] border border-indigo-900/50 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
