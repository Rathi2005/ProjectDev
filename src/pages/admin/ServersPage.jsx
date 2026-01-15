import React, { useState, useEffect } from "react";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import {
  PlusCircle,
  Loader2,
  Edit,
  Trash2,
  HardDrive,
  File,
  MemoryStick,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

// const MySwal = withReactContent(Swal);

export default function ServersPage() {
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [zones, setZones] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    ip: "",
    location: "",
    node: "",
    port: 8006,
    networkBridge: "vmbr0",
    tokenId: "",
    tokenSecret: "",
    zoneId: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    location: "",
    node: "",
    port: 8006,
    networkBridge: "vmbr0",
    tokenId: "",
    tokenSecret: "",
  });

  const [ramModal, setRamModal] = useState(false);
  const [ramStats, setRamStats] = useState(null);
  const [ramLoading, setRamLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [allowedPercentage, setAllowedPercentage] = useState(90);

  const navigate = useNavigate();
  // const FETCH_SERVERS = import.meta.env.VITE_SERVERS;
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const FETCH_SERVERS = `${BASE_URL}/admin/servers`;
  const { id: zoneId } = useParams();

  // ✅ Configure SweetAlert2 dark theme
  const swalDarkTheme = {
    customClass: {
      popup: "dark-swal-popup",
      title: "dark-swal-title",
      htmlContainer: "dark-swal-content",
      confirmButton: "dark-swal-confirm",
      cancelButton: "dark-swal-cancel",
      input: "dark-swal-input",
    },
    background: "#0f172a",
    color: "#e2e8f0",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#ef4444",
  };

  // ✅ Add SweetAlert2 styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .dark-swal-popup {
        background: #0f172a !important;
        border: 1px solid #334155 !important;
        border-radius: 0.75rem !important;
      }
      .dark-swal-title {
        color: #e2e8f0 !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
      }
      .dark-swal-content {
        color: #cbd5e1 !important;
        font-size: 1rem !important;
      }
      .dark-swal-confirm {
        background-color: #3b82f6 !important;
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .dark-swal-confirm:hover {
        background-color: #2563eb !important;
        transform: translateY(-1px) !important;
      }
      .dark-swal-cancel {
        background-color: #4b5563 !important;
        border: none !important;
        border-radius: 0.5rem !important;
        padding: 0.625rem 1.5rem !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .dark-swal-cancel:hover {
        background-color: #374151 !important;
        transform: translateY(-1px) !important;
      }
      .dark-swal-input {
        background-color: #1e293b !important;
        border: 1px solid #475569 !important;
        color: #e2e8f0 !important;
        border-radius: 0.5rem !important;
        padding: 0.75rem !important;
      }
      .dark-swal-input:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch servers (GET)
  useEffect(() => {
    const fetchServers = async () => {
      const token = localStorage.getItem("adminToken");
      setLoading(true);

      try {
        const res = await fetch(
          `${BASE_URL}/api/admin/servers?zoneId=${zoneId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          toast.error("Failed to load servers");
          return;
        }

        const data = await res.json();
        setServers(
          data.map((srv) => ({
            ...srv,
            vmCount: 0,
          }))
        );

        data.forEach((srv) => {
          if (srv.id) fetchVmCount(srv.id, token);
        });
      } catch (err) {
        toast.error("Error loading servers");
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, [FETCH_SERVERS]);

  // Fetch Zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/api/options/zones`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          toast.error("Failed to load zones");
          return;
        }

        const data = await res.json();
        setZones(data || []);
      } catch (err) {
        toast.error("Error loading zones");
      }
    };

    fetchZones();
  }, [BASE_URL]);

  // Fetch VM count per server
  const fetchVmCount = async (serverId, token) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/servers/${serverId}/vms/counts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        setServers((prev) =>
          prev.map((srv) =>
            srv.id === serverId ? { ...srv, vmCount: 0 } : srv
          )
        );
        return;
      }

      const data = await res.json();
      const count = data?.total ?? data?.count ?? 0;

      setServers((prev) =>
        prev.map((srv) =>
          srv.id === serverId ? { ...srv, vmCount: count } : srv
        )
      );
    } catch (err) {
      toast.error(`Error fetching VM count for server ${serverId}:`, err);
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || "INACTIVE").toUpperCase();

    switch (statusUpper) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "INACTIVE":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "MAINTENANCE":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      default:
        return "text-gray-400 bg-gray-700/10 border-gray-700/30";
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    setSubmitting(true);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zoneId: Number(formData.zoneId),
          name: formData.name,
          ip: formData.ip,
          location: formData.location,
          node: formData.node,
          port: Number(formData.port) || 8006,
          networkBridge: formData.networkBridge,
          tokenId: formData.tokenId,
          tokenSecret: formData.tokenSecret,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error("Failed to add server");
        return;
      }

      const newServer = await res.json();
      setServers((prev) => [...prev, { ...newServer, vmCount: 0 }]);

      toast.success("Server added successfully!");
      setShowModal(false);

      setFormData({
        zoneId: "",
        name: "",
        ip: "",
        location: "",
        node: "",
        port: 8006,
        networkBridge: "vmbr0",
        tokenId: "",
        tokenSecret: "",
      });
    } catch (err) {
      toast.error("Error adding server");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete Server with confirmation
  const handleDeleteServer = async (serverId, serverName) => {
    const result = await Swal.fire({
      ...swalDarkTheme,
      title: "Delete Server",
      html: `
    <div class="text-left space-y-4">
      <p class="text-red-300">
        Are you sure you want to delete the server "<strong>${serverName}</strong>"?
      </p>
      <p class="text-gray-400 text-sm">
        This action cannot be undone. All associated VMs and data will be permanently removed.
      </p>
      <p class="text-gray-400 text-sm">
        Type <strong>delete</strong> below to confirm:
      </p>
    </div>
  `,
      input: "text",
      inputPlaceholder: 'Type "delete" to confirm',
      showCancelButton: true,
      confirmButtonText: "Delete Server",
      cancelButtonText: "Cancel",
      preConfirm: (input) => {
        if (input?.toLowerCase() !== "delete") {
          Swal.showValidationMessage('You must type "delete" to confirm');
          return false;
        }
        return true;
      },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${BASE_URL}/api/admin/servers/${serverId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Remove server from state
        setServers(servers.filter((server) => server.id !== serverId));

        await Swal.fire({
          ...swalDarkTheme,
          icon: "success",
          title: "Deleted!",
          text: `Server "${serverName}" has been deleted successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          ...swalDarkTheme,
          icon: "error",
          title: "Error",
          text: "Failed to delete server. Please try again.",
        });
      }
    }
  };

  // Add this function to handle edit form changes
  const handleEditChange = (e) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  // ✅ Edit Server Configuration
  const handleEditServer = async () => {
    if (!editingServer) {
      toast.error("No server selected for editing");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${BASE_URL}/api/admin/servers/${editingServer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editFormData.name,
            location: editFormData.location,
            ip: editFormData.ip,
            node: editFormData.node,
            tokenId: editFormData.tokenId,
            tokenSecret: editFormData.tokenSecret,
            port: Number(editFormData.port) || 8006,
            networkBridge: editFormData.networkBridge,
            zoneId: Number(editFormData.zoneId),
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(`Failed to update server: ${errorText}`);
        return;
      }

      const data = await res.json();

      // Update server in state
      setServers(
        servers.map((server) =>
          server.id === editingServer.id
            ? { ...server, ...editFormData }
            : server
        )
      );

      setEditModal(false);
      setEditingServer(null);
      setEditFormData({
        name: "",
        ip: "",
        location: "",
        node: "",
        port: 8006,
        networkBridge: "vmbr0",
        tokenId: "",
        tokenSecret: "",
        zoneId: "",
      });

      toast.success(`Server "${editFormData.name}" updated successfully!`);
    } catch (err) {
      toast.error("Failed to update server");
    }
  };

  // Open edit modal
  const openEditModal = (server) => {
    setEditingServer(server);
    setEditFormData({
      name: server.name || "",
      ip: server.ip || "",
      location: server.location || "",
      node: server.node || "",
      port: server.port || 8006,
      networkBridge: server.networkBridge || "vmbr0",
      tokenId: server.tokenId || "",
      tokenSecret: server.tokenSecret || "",
      zoneId: server.zoneId || "",
    });
    setEditModal(true);
  };

  // ✅ Handle Status Change
  const handleStatusChange = async (serverId, newStatus) => {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/servers/${serverId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(`Failed to update status: ${errorText}`);
        return;
      }

      const data = await res.json();

      // Update the server in local state
      setServers((prev) =>
        prev.map((server) =>
          server.id === serverId ? { ...server, status: newStatus } : server
        )
      );

      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Error updating server status");
    }
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Main */}
      <main className="flex-1 mt-[72px] p-4 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-wide">Servers</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all duration-300 text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Server</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-indigo-900/40 shadow-lg">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-lg">
              No servers found.
            </div>
          ) : (
            <div className="w-full min-w-[900px] sm:min-w-0">
              <table className="w-full text-left border-collapse text-sm sm:text-base">
                <thead className="bg-[#151c2f] text-gray-300 uppercase tracking-wider text-xs sm:text-sm">
                  <tr>
                    <th className="px-4 py-3 sm:px-6">Server ID</th>
                    <th className="px-4 py-3 sm:px-6">Name</th>
                    <th className="px-4 py-3 sm:px-6">IP</th>
                    <th className="px-4 py-3 sm:px-6">Location</th>
                    <th className="px-4 py-3 sm:px-6">Node</th>
                    <th className="px-4 py-3 sm:px-6 hidden md:table-cell">
                      Token ID
                    </th>
                    <th className="px-4 py-3 sm:px-6 text-center">VMs</th>
                    <th className="px-4 py-3 sm:px-6">Status</th>
                    <th className="px-4 py-3 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.map((server, index) => (
                    <tr
                      key={server.id || index}
                      className={`${
                        index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                      } hover:bg-indigo-900/20 transition-all duration-300`}
                    >
                      <td className="px-4 py-3 sm:px-6 text-indigo-300 font-semibold whitespace-nowrap">
                        {server.id || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.name || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.ip || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.location || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        {server.node || "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap hidden md:table-cell">
                        {server.tokenId ? (
                          <span className="text-xs bg-gray-800/50 px-2 py-1 rounded">
                            {server.tokenId.slice(0, 8)}...
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-center whitespace-nowrap">
                        {server.vmCount === null ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400 inline" />
                        ) : (
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/vms`)
                            }
                            className="flex items-center justify-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white font-semibold px-3 py-1 rounded-full transition-all duration-300 text-xs shadow-sm hover:shadow-indigo-700/30"
                          >
                            <span>{server.vmCount ?? "—"}</span>
                            <span className="text-[10px] opacity-80 hidden sm:inline">
                              VMs
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                        <div className="relative group">
                          {/* Mobile: Show status badge only */}
                          <div className="sm:hidden">
                            <span
                              className={`
                                px-2 py-1 rounded-full text-xs font-semibold
                                ${getStatusColor(server.status || "INACTIVE")}
                              `}
                            >
                              {server.status === "ACTIVE"
                                ? "Active"
                                : server.status === "INACTIVE"
                                ? "Inactive"
                                : "Maint."}
                            </span>
                          </div>

                          {/* Desktop: Show dropdown */}
                          <div className="hidden sm:block relative">
                            <select
                              value={server.status || "INACTIVE"}
                              onChange={(e) =>
                                handleStatusChange(server.id, e.target.value)
                              }
                              className={`
                                w-full px-3 py-1.5 pr-8 rounded-lg text-xs font-medium cursor-pointer
                                transition-all duration-200 appearance-none
                                ${getStatusColor(server.status || "INACTIVE")}
                                hover:brightness-110 focus:outline-none focus:ring-1 focus:ring-indigo-500
                                bg-black/30 backdrop-blur-sm
                              `}
                            >
                              <option
                                value="ACTIVE"
                                className="bg-gray-900 text-green-400"
                              >
                                Active
                              </option>
                              <option
                                value="INACTIVE"
                                className="bg-gray-900 text-red-400"
                              >
                                Inactive
                              </option>
                              <option
                                value="MAINTENANCE"
                                className="bg-gray-900 text-yellow-400"
                              >
                                Maintenance
                              </option>
                            </select>
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <svg
                                className="w-3 h-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-center whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/isos`)
                            }
                            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all duration-300"
                            title="Add ISOs"
                          >
                            <File className="w-3 h-3" />
                            <span className="hidden sm:inline">ISOs</span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/disks`)
                            }
                            className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all duration-300"
                            title="Add Disk"
                          >
                            <HardDrive className="w-3 h-3" />
                            <span className="hidden sm:inline">Disk</span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/servers/${server.id}/ram`)
                            }
                            className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700
             text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5
             rounded-md transition-all duration-300"
                            title="View RAM"
                          >
                            <MemoryStick className="w-3 h-3" />
                            <span className="hidden sm:inline">RAM</span>
                          </button>
                          <button
                            onClick={() => openEditModal(server)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all duration-300"
                            title="Edit Server Configuration"
                          >
                            <Edit className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteServer(server.id, server.name)
                            }
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-md transition-all duration-300"
                            title="Delete Server"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ✅ Add Server Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto flex justify-center items-start">
          <div className="relative bg-[#111827] border border-indigo-800/40 rounded-2xl shadow-2xl w-[92%] max-w-2xl my-10 p-4 sm:p-8 lg:p-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40 mb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-indigo-300 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                <span className="text-sm sm:text-lg lg:text-xl">
                  Add New Server
                </span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-red-400 transition-colors text-lg sm:text-xl"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* ✅ Zone Dropdown */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Select Zone
                </label>
                <select
                  name="zoneId"
                  value={formData.zoneId}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                >
                  <option value="">-- Select a Zone --</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Server Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Production Server"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                />
              </div>

              {/* IP + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    name="ip"
                    placeholder="e.g. 192.168.0.10"
                    value={formData.ip}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Singapore Data Center"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Node + Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Node
                  </label>
                  <input
                    type="text"
                    name="node"
                    placeholder="e.g. Node-01"
                    value={formData.node}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    name="port"
                    placeholder="8006"
                    value={formData.port}
                    onChange={handleChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Network Bridge + Token Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Network Bridge
                  </label>
                  <input
                    type="text"
                    name="networkBridge"
                    placeholder="vmbr0"
                    value={formData.networkBridge}
                    onChange={handleChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Token Secret
                  </label>
                  <input
                    type="password"
                    name="tokenSecret"
                    placeholder="Enter Token Secret"
                    value={formData.tokenSecret}
                    onChange={handleChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Token ID */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Token ID
                </label>
                <input
                  type="text"
                  name="tokenId"
                  placeholder="Enter API Token ID"
                  value={formData.tokenId}
                  onChange={handleChange}
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 sm:gap-3 pt-4 border-t border-indigo-900/40 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 sm:px-5 py-2 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200 disabled:opacity-50 text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Add Server</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Edit Server Modal */}
      {editModal && editingServer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto flex justify-center items-start">
          <div className="relative bg-[#111827] border border-indigo-800/40 rounded-2xl shadow-2xl w-[92%] max-w-2xl my-10 p-4 sm:p-8 lg:p-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40 mb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-indigo-300 flex items-center gap-2">
                <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                <span className="text-sm sm:text-lg lg:text-xl">
                  Edit Server Configuration
                </span>
              </h2>
              <button
                onClick={() => {
                  setEditModal(false);
                  setEditingServer(null);
                  setEditFormData({
                    name: "",
                    ip: "",
                    location: "",
                    node: "",
                    port: 8006,
                    networkBridge: "vmbr0",
                    tokenId: "",
                    tokenSecret: "",
                    zoneId: "",
                  });
                }}
                className="text-gray-400 hover:text-red-400 transition-colors text-lg sm:text-xl"
                title="Close"
              >
                ×
              </button>
            </div>

            {/* Current Server Info */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-indigo-900/20 rounded-lg border border-indigo-700/30">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-400">Server ID:</p>
                  <p className="text-base sm:text-lg font-semibold text-indigo-300">
                    {editingServer.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Status:</p>
                  <span
                    className={`
                px-2 py-1 rounded-full text-xs font-semibold
                ${getStatusColor(editingServer.status || "INACTIVE")}
              `}
                  >
                    {editingServer.status === "ACTIVE"
                      ? "Active"
                      : editingServer.status === "INACTIVE"
                      ? "Inactive"
                      : "Maintenance"}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4 sm:space-y-5">
              {/* Zone Dropdown */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Zone</label>
                <select
                  name="zoneId"
                  value={editFormData.zoneId}
                  onChange={handleEditChange}
                  required
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                >
                  <option value="">-- Select a Zone --</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Server Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Server Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Production Server"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                />
              </div>

              {/* IP + Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    IP Address
                  </label>
                  <input
                    type="text"
                    name="ip"
                    placeholder="e.g. 192.168.0.10"
                    value={editFormData.ip}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Singapore Data Center"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Node + Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Node
                  </label>
                  <input
                    type="text"
                    name="node"
                    placeholder="e.g. Node-01"
                    value={editFormData.node}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    name="port"
                    placeholder="8006"
                    value={editFormData.port}
                    onChange={handleEditChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Network Bridge + Token Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Network Bridge
                  </label>
                  <input
                    type="text"
                    name="networkBridge"
                    placeholder="vmbr0"
                    value={editFormData.networkBridge}
                    onChange={handleEditChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Token Secret
                  </label>
                  <input
                    type="password"
                    name="tokenSecret"
                    placeholder="Enter Token Secret"
                    value={editFormData.tokenSecret}
                    onChange={handleEditChange}
                    className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Token ID */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Token ID
                </label>
                <input
                  type="text"
                  name="tokenId"
                  placeholder="Enter API Token ID"
                  value={editFormData.tokenId}
                  onChange={handleEditChange}
                  className="w-full bg-[#0d1220] border border-indigo-700/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 sm:gap-3 pt-4 border-t border-indigo-900/40 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditModal(false);
                    setEditingServer(null);
                    setEditFormData({
                      name: "",
                      ip: "",
                      location: "",
                      node: "",
                      port: 8006,
                      networkBridge: "vmbr0",
                      tokenId: "",
                      tokenSecret: "",
                      zoneId: "",
                    });
                  }}
                  className="px-3 sm:px-5 py-2 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditServer}
                  disabled={
                    !editFormData.name.trim() || !editFormData.ip.trim()
                  }
                  className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50 text-sm"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Update Server</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
