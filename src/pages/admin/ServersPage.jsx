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
  AlertCircle,
  ArrowLeft,
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
    ramAllocatedPercentage: 90,
    sockets: 1,
  });

  const handleBack = () => {
    navigate("/admin/settings/zones");
  };

  const [formData, setFormData] = useState({
    name: "",
    ip: "",
    location: "",
    node: "",
    port: 8006,
    networkBridge: "vmbr0",
    tokenId: "",
    tokenSecret: "",
    ramAllocatedPercentage: 90,
    sockets: 1,
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
          },
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
          })),
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
        },
      );

      if (!res.ok) {
        setServers((prev) =>
          prev.map((srv) =>
            srv.id === serverId ? { ...srv, vmCount: 0 } : srv,
          ),
        );
        return;
      }

      const data = await res.json();
      const count = data?.total ?? data?.count ?? 0;

      setServers((prev) =>
        prev.map((srv) =>
          srv.id === serverId ? { ...srv, vmCount: count } : srv,
        ),
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

    if (
      formData.ramAllocatedPercentage < 1 ||
      formData.ramAllocatedPercentage > 100
    ) {
      toast.error("RAM allocation must be between 1 and 100%");
      return;
    }

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
          sockets: Number(formData.sockets) || 1,
          location: formData.location,
          node: formData.node,
          port: Number(formData.port) || 8006,
          networkBridge: formData.networkBridge,
          tokenId: formData.tokenId,
          tokenSecret: formData.tokenSecret,
          ramAllocatedPercentage: Number(formData.ramAllocatedPercentage) || 90,
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
        ramAllocatedPercentage: 90,
        sockets: 1,
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

    if (
      editFormData.ramAllocatedPercentage < 1 ||
      editFormData.ramAllocatedPercentage > 100
    ) {
      toast.error("RAM allocation must be between 1 and 100%");
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
            sockets: Number(editFormData.sockets) || 1,
            ramAllocatedPercentage:
              Number(editFormData.ramAllocatedPercentage) || 90,
          }),
        },
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
            : server,
        ),
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
        ramAllocatedPercentage: 90,
        sockets: 1,
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
      ramAllocatedPercentage: server.ramAllocatedPercentage ?? 90,
      sockets: server.sockets ?? 1,
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
        },
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
          server.id === serverId ? { ...server, status: newStatus } : server,
        ),
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
          {/* Left Side: Back + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/settings/zones")}
              className="p-2 rounded-lg hover:bg-indigo-600/20 
        text-indigo-400 hover:text-indigo-300 transition-all duration-300"
              title="Back to Zones"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-3xl font-bold tracking-wide">Servers</h1>
          </div>

          {/* Right Side: Add Button */}
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
                              <option
                                value="DISABLED"
                                className="bg-gray-900 text-red-400"
                              >
                                Disabled
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

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-indigo-800/50 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-indigo-900/50 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Add New Server
                  </h2>
                  <p className="text-sm text-indigo-300 mt-1">
                    Configure your server settings
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                title="Close"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-red-400 rotate-45 absolute rounded-full"></div>
                  <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-red-400 -rotate-45 absolute rounded-full"></div>
                </div>
              </button>
            </div>

            {/* Form Content - Compact 3-column layout */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Zone Dropdown - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    Select Zone *
                  </label>
                  <select
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all duration-200 hover:border-indigo-700"
                  >
                    <option value="" className="bg-gray-900">
                      -- Select a Zone --
                    </option>
                    {zones.map((zone) => (
                      <option
                        key={zone.id}
                        value={zone.id}
                        className="bg-gray-900"
                      >
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3-Column Grid for All Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    {/* Server Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Server Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Production Server"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* IP Address */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        IP Address *
                      </label>
                      <input
                        type="text"
                        name="ip"
                        placeholder="192.168.0.10"
                        value={formData.ip}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200 font-mono"
                      />
                    </div>

                    {/* Port */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        name="port"
                        placeholder="8006"
                        value={formData.port}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* CPU Sockets */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        CPU Sockets *
                      </label>
                      <input
                        type="number"
                        name="sockets"
                        min="1"
                        placeholder="2"
                        value={formData.sockets}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Singapore DC"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Node */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Node *
                      </label>
                      <input
                        type="text"
                        name="node"
                        placeholder="Node-01"
                        value={formData.node}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Network Bridge */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Network Bridge
                      </label>
                      <input
                        type="text"
                        name="networkBridge"
                        placeholder="vmbr0"
                        value={formData.networkBridge}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-4">
                    {/* RAM Allocation */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        RAM Allocation (%) *
                        <span className="text-xs text-gray-500 ml-1">
                          Default: 90
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="ramAllocatedPercentage"
                          min="1"
                          max="100"
                          value={formData.ramAllocatedPercentage}
                          onChange={handleChange}
                          required
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                          placeholder="90"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Token ID */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Token ID
                      </label>
                      <input
                        type="text"
                        name="tokenId"
                        placeholder="API Token ID"
                        value={formData.tokenId}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Token Secret */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Token Secret
                      </label>
                      <input
                        type="password"
                        name="tokenSecret"
                        placeholder="Enter Token Secret"
                        value={formData.tokenSecret}
                        onChange={handleChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* RAM Allocation Info */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-indigo-300">
                      RAM Allocation Preview
                    </span>
                  </div>
                  <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Allocated RAM:</span>
                      <span className="text-white font-medium">
                        {formData.ramAllocatedPercentage || 90}% of system total
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Recommended: 70-90% to leave room for system processes
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding Server...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Add Server</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Server Modal */}
      {editModal && editingServer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-blue-800/50 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-900/50 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Edit Server Configuration
                  </h2>
                  <p className="text-sm text-blue-300 mt-1">
                    Update settings for server: {editingServer.name}
                  </p>
                </div>
              </div>
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
                    ramAllocatedPercentage: 90,
                    networkBridge: "vmbr0",
                    tokenId: "",
                    tokenSecret: "",
                    zoneId: "",
                    sockets: 1,
                  });
                }}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                title="Close"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-red-400 rotate-45 absolute rounded-full"></div>
                  <div className="w-4 h-0.5 bg-gray-400 group-hover:bg-red-400 -rotate-45 absolute rounded-full"></div>
                </div>
              </button>
            </div>

            {/* Edit Form Content */}
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditServer();
                }}
                className="space-y-6"
              >
                {/* Zone Dropdown - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Zone *
                  </label>
                  <select
                    name="zoneId"
                    value={editFormData.zoneId}
                    onChange={handleEditChange}
                    required
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all duration-200 hover:border-blue-700"
                  >
                    <option value="" className="bg-gray-900">
                      -- Select a Zone --
                    </option>
                    {zones.map((zone) => (
                      <option
                        key={zone.id}
                        value={zone.id}
                        className="bg-gray-900"
                      >
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3-Column Grid for All Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    {/* Server Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Server Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Production Server"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* IP Address */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        IP Address *
                      </label>
                      <input
                        type="text"
                        name="ip"
                        placeholder="192.168.0.10"
                        value={editFormData.ip}
                        onChange={handleEditChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 font-mono"
                      />
                    </div>

                    {/* Port */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Port
                      </label>
                      <input
                        type="number"
                        name="port"
                        placeholder="8006"
                        value={editFormData.port}
                        onChange={handleEditChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Singapore DC"
                        value={editFormData.location}
                        onChange={handleEditChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Node */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Node *
                      </label>
                      <input
                        type="text"
                        name="node"
                        placeholder="Node-01"
                        value={editFormData.node}
                        onChange={handleEditChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Network Bridge */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Network Bridge
                      </label>
                      <input
                        type="text"
                        name="networkBridge"
                        placeholder="vmbr0"
                        value={editFormData.networkBridge}
                        onChange={handleEditChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-4">
                    {/* RAM Allocation */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        RAM Allocation (%) *
                        <span className="text-xs text-gray-500 ml-1">
                          Default: 90
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="ramAllocatedPercentage"
                          min="1"
                          max="100"
                          value={editFormData.ramAllocatedPercentage}
                          onChange={handleEditChange}
                          required
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200"
                          placeholder="90"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Sockets */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        CPU Sockets *
                      </label>
                      <input
                        type="number"
                        name="sockets"
                        min="1"
                        placeholder="2"
                        value={editFormData.sockets}
                        onChange={handleEditChange}
                        required
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Token ID */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Token ID
                      </label>
                      <input
                        type="text"
                        name="tokenId"
                        placeholder="API Token ID"
                        value={editFormData.tokenId}
                        onChange={handleEditChange}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Token Secret */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        Token Secret
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="tokenSecret"
                          placeholder="Leave blank to keep current"
                          value={editFormData.tokenSecret}
                          onChange={handleEditChange}
                          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.querySelector(
                              'input[name="tokenSecret"]',
                            );
                            if (input.type === "password") {
                              input.type = "text";
                            } else {
                              input.type = "password";
                            }
                          }}
                          className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-300"
                          title="Toggle visibility"
                        >
                          👁️
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to keep existing token secret
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
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
                        ramAllocatedPercentage: 90,
                        networkBridge: "vmbr0",
                        tokenId: "",
                        tokenSecret: "",
                        zoneId: "",
                        sockets: 1,
                      });
                    }}
                    className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !editFormData.name.trim() ||
                      !editFormData.ip.trim() ||
                      submitting
                    }
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        <span>Update Server</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
