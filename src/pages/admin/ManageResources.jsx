import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import {
  PlusCircle,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  X,
  Layers,
  ChevronDown,
  Globe,
  Network,
  Settings,
  CheckCircle,
  HardDrive,
  Server,
  Database,
  ArrowLeft,
  PieChart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useDebounce } from "../../hooks/useDebounce";
import Swal from "sweetalert2";

export default function ManageResourcesPage({
  title,
  endpoint,
  fields,
  showExisting = true,
  showAddForm = true,
  showActions = true,
  extraForm = null,
}) {
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0);
  const [totalIps, setTotalIps] = useState(0);
  const [processedIps, setProcessedIps] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [failedIps, setFailedIps] = useState([]);

  const handleBack = () => {
    if (endpoint === "/ips") {
      // IPS → go to zones list
      navigate("/admin/settings/zones");
    } else if (extraForm === "disks") {
      // Disks → go to servers list (dynamic admin id)
      const pathParts = location.pathname.split("/").filter(Boolean);

      // current: admin / servers / 13 / disks
      // we need:  admin / 13 / servers

      const serverId = pathParts[2]; // 13
      navigate(`/admin/${serverId}/servers`);
    } else {
      navigate(-1);
    }
  };

  // 🌐 IP-RELATED CONSTANTS
  const ipSingleFields = [
    { name: "ip", label: "IP Address", type: "text" },
    { name: "cidr", label: "CIDR (e.g. /23)", type: "text" },
    { name: "gateway", label: "Gateway", type: "text" },
    { name: "mac", label: "MAC Address", type: "text" },
    { name: "inUse", label: "In Use", type: "checkbox" },
  ];

  const ipRangeFields = [
    { name: "startIp", label: "Start IP", type: "text" },
    { name: "endIp", label: "End IP", type: "text" },
    { name: "cidr", label: "CIDR (e.g. /24)", type: "text" },
    { name: "gateway", label: "Gateway", type: "text" },
  ];

  const [rows, setRows] = useState([]);
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ipMode, setIpMode] = useState("single");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [inUseFilter, setInUseFilter] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // 🔄 RESOLVE FIELDS BASED ON ENDPOINT AND MODE
  const resolvedFields = useMemo(() => {
    if (endpoint === "/ips") {
      return ipMode === "single" ? ipSingleFields : ipRangeFields;
    }
    return fields;
  }, [endpoint, ipMode, fields]);

  // 🆕 DEFINE getEmptyRow BEFORE USING IT
  const getEmptyRow = useCallback(() => {
    const fieldsToUse = resolvedFields;
    return Object.fromEntries(
      fieldsToUse.map((f) => [f.name, f.type === "checkbox" ? false : ""]),
    );
  }, [resolvedFields]);

  // 🔄 INITIALIZE ROWS WITH EMPTY ROW
  useEffect(() => {
    setRows([getEmptyRow()]);
  }, [getEmptyRow]);

  // 🔄 UPDATE ROWS WHEN IP MODE CHANGES
  useEffect(() => {
    if (endpoint === "/ips") {
      setRows([getEmptyRow()]);
    }
  }, [ipMode, endpoint, getEmptyRow]);

  const addRow = () => setRows([...rows, getEmptyRow()]);

  const handleChange = (i, field, value) => {
    const newRows = [...rows];
    newRows[i][field] = value;
    setRows(newRows);
  };

  // 🔄 FETCH EXISTING DATA FOR ALL RESOURCE TYPES
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        let apiUrl;

        if (endpoint === "/ips") {
          apiUrl = `${BASE_URL}/api/admin/zones/${id}/ips`;
        } else if (extraForm === "disks") {
          apiUrl = `${BASE_URL}/api/admin/servers/${id}/disk-details`;
        } else {
          // ISOs or other server resources
          apiUrl = `${BASE_URL}/api/admin/servers/${id}${endpoint}`;
        }

        const res = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch ${title}`);

        const data = await res.json();
        setExisting(data);
      } catch (err) {
        toast.error(`Failed to load ${title}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BASE_URL, id, endpoint, title, extraForm]);

  // 🔄 RELOAD DATA FOR ALL TYPES
  const reloadData = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      let url;

      if (endpoint === "/ips") {
        url = `${BASE_URL}/api/admin/zones/${id}/ips`;
      } else if (extraForm === "disks") {
        url = `${BASE_URL}/api/admin/servers/${id}/disk-details`;
      } else {
        url = `${BASE_URL}/api/admin/servers/${id}${endpoint}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const json = await res.json();
      setExisting(json);
    } catch (err) {
      toast.error("Error reloading data");
    }
  };

  // 🔢 IP HELPER FUNCTIONS (ONLY FOR /ips ENDPOINT)
  const ipToNumber = (ip) => {
    if (!ip) return 0;
    const octets = ip.split(".").map(Number);
    if (octets.length !== 4 || octets.some(isNaN)) return 0;
    return (
      ((octets[0] << 24) >>> 0) +
      ((octets[1] << 16) >>> 0) +
      ((octets[2] << 8) >>> 0) +
      (octets[3] >>> 0)
    );
  };

  const numberToIp = (num) => {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join(".");
  };

  const validateIp = (ip) => {
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(ip)) return false;

    const parts = ip.split(".").map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  };

  const cidrToSubnet = (cidr) => {
    const cidrNum = parseInt(cidr.toString().replace("/", ""));
    if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) return "255.255.255.0";

    const mask = (0xffffffff << (32 - cidrNum)) >>> 0;
    return numberToIp(mask);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const safeFetch = async (url, options, retries = 3) => {
    try {
      const res = await fetch(url, options);

      if (res.status === 503) {
        throw new Error("Server busy");
      }

      if (!res.ok) throw new Error(await res.text());

      return res;
    } catch (err) {
      if (retries > 0) {
        await delay(1000); // longer wait for server recovery
        return safeFetch(url, options, retries - 1);
      }
      throw err;
    }
  };

  // 🚀 SUBMIT HANDLER FOR ALL RESOURCE TYPES
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setSaving(true);

    try {
      // ==================== IP HANDLING ====================
      if (endpoint === "/ips") {
        if (ipMode === "single") {
          for (const row of rows) {
            if (!row.ip || !row.cidr || !row.gateway) {
              toast.error(
                `Please fill all required fields for IP: ${row.ip || "row"}`,
              );
              continue;
            }

            if (!validateIp(row.ip)) {
              toast.error(`Invalid IP address: ${row.ip}`);
              continue;
            }

            if (!validateIp(row.gateway)) {
              toast.error(`Invalid Gateway: ${row.gateway}`);
              continue;
            }

            const cidr = row.cidr.startsWith("/") ? row.cidr : `/${row.cidr}`;
            const subnetMask = cidrToSubnet(cidr);

            const payload = {
              ip: row.ip.trim(),
              cidr: cidr,
              subnetMask,
              gateway: row.gateway.trim(),
              mac: row.mac?.trim() || null,
              inUse: Boolean(row.inUse),
            };

            const res = await fetch(`${BASE_URL}/api/admin/zones/${id}/ips`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              const error = await res.text();
              throw new Error(`Failed to add IP ${row.ip}: ${error}`);
            }
          }
        } else if (ipMode === "range") {
          for (const row of rows) {
            if (!row.startIp || !row.endIp || !row.cidr || !row.gateway) {
              toast.error("Please fill start IP, end IP, CIDR and gateway");
              continue;
            }

            if (!/^\/\d{1,2}$/.test(row.cidr)) {
              toast.error("Invalid CIDR format (example: /24)");
              continue;
            }

            if (!validateIp(row.startIp) || !validateIp(row.endIp)) {
              toast.error("Invalid IP address in range");
              continue;
            }

            if (!validateIp(row.gateway)) {
              toast.error("Invalid Gateway address");
              continue;
            }

            const start = ipToNumber(row.startIp);
            const end = ipToNumber(row.endIp);

            if (end < start) {
              toast.error("End IP must be greater than or equal to Start IP");
              continue;
            }

            const cidr = row.cidr.startsWith("/") ? row.cidr : `/${row.cidr}`;
            const subnetMask = cidrToSubnet(cidr);
            const total = end - start + 1;

            setTotalIps(total);
            setProcessedIps(0);
            setProgress(0);
            setFailedIps([]);
            setIsProcessing(true);

            const batchSize = 15;
            let processed = 0;
            const failed = [];

            for (let i = start; i <= end; i += batchSize) {
              const batchEnd = Math.min(i + batchSize - 1, end);
              const promises = [];

              for (let j = i; j <= batchEnd; j++) {
                const ip = numberToIp(j);

                const payload = {
                  ip,
                  cidr,
                  subnetMask,
                  gateway: row.gateway.trim(),
                  mac: null,
                  inUse: false,
                };

                const request = (async () => {
                  await delay(Math.random() * 300); // spread load
                  return safeFetch(`${BASE_URL}/api/admin/zones/${id}/ips`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  });
                })().catch(() => {
                  failed.push(ip);
                });

                promises.push(request);
              }

              await Promise.all(promises);

              processed += batchEnd - i + 1;
              setProcessedIps(processed);
              setProgress(Math.round((processed / total) * 100));

              // small delay between batches
              await delay(800);
            }

            setFailedIps(failed);
            setIsProcessing(false);

            if (failed.length > 0) {
              toast.error(`${failed.length} IPs failed`);
            } else {
              toast.success(`All ${total} IPs created successfully`);
            }
          }
        }
      }
      // ==================== DISK HANDLING ====================
      else if (extraForm === "disks") {
        for (const row of rows) {
          const payload = {
            diskName: row.diskName?.trim(),
            maxVms: Number(row.maxVms || 1),
            usableDiskPercentage: Number(row.usableDiskPercentage || 100),
          };

          // ✅ Validation (VERY IMPORTANT)
          if (!payload.diskName) {
            toast.error("Disk name is required");
            continue;
          }

          if (payload.maxVms < 1) {
            toast.error("Max VMs must be at least 1");
            continue;
          }

          if (
            payload.usableDiskPercentage < 1 ||
            payload.usableDiskPercentage > 100
          ) {
            toast.error("Percentage must be between 1 and 100");
            continue;
          }

          try {
            const res = await fetch(
              `${BASE_URL}/api/admin/servers/${id}/storage`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
              },
            );

            const data = await res.json(); // ✅ IMPORTANT

            if (!res.ok) {
              throw new Error(data.error || "Failed to add storage");
            }

            toast.success(data.message || "Storage added successfully");
          } catch (err) {
            toast.error(err.message);
          }
        }
      }

      await reloadData();
      setRows([getEmptyRow()]);
      toast.success(`${title} added successfully!`);
    } catch (err) {
      setIsProcessing(false);
      toast.error(err.message || `Failed to add ${title}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditFormData({ ...item });
  };

  // ✏️ EDIT HANDLER FOR ALL RESOURCE TYPES
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("adminToken");
    if (!token || !editingItem) return;

    try {
      let url = "";
      let method = "PUT";
      let payload = {}; // ✅ FIX: define outside

      if (endpoint === "/ips") {
        url = `${BASE_URL}/api/admin/zones/${id}/ips/${editingItem.id}`;
        payload = editFormData;
      } else if (extraForm === "disks") {
        const diskId = editingItem.id;

        url = `${BASE_URL}/api/admin/servers/${id}/storage/${diskId}`;
        method = "PUT";

        payload = {
          diskName: editFormData.diskName?.trim(),
          maxVms: Number(editFormData.maxVms || 1),
          usableDiskPercentage: Number(
            editFormData.usableDiskPercentage || 100,
          ),
        };

        // ✅ Validation
        if (payload.maxVms < 1) {
          return toast.error("Max VMs must be at least 1");
        }

        if (
          payload.usableDiskPercentage < 1 ||
          payload.usableDiskPercentage > 100
        ) {
          return toast.error("Percentage must be between 1 and 100");
        }
      } else {
        url = `${BASE_URL}/api/admin/servers/${id}${endpoint}/${editingItem.id}`;
        payload = editFormData;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // ✅ now works
      });

      const data = await res.json(); // ✅ IMPORTANT

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success(data.message || "Updated successfully");
      setEditingItem(null);
      await reloadData();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  // 🗑️ DELETE HANDLER FOR ALL RESOURCE TYPES
  const handleDelete = async (item) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return toast.error("No admin token");

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `Delete <b>${
        item.ip || item.iso || item.diskName || "this item"
      }</b>?<br>This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      background: "#1e2640",
      color: "#fff",
      confirmButtonColor: "#e63946",
      cancelButtonColor: "#444",
    });

    if (!result.isConfirmed) return;

    try {
      let deleteUrl = "";

      if (endpoint === "/ips") {
        deleteUrl = `${BASE_URL}/api/admin/zones/${id}/ips/${item.id}`;
      } else if (extraForm === "disks") {
        const diskId = item.id || item.ID || item.Id || item.storage_id;
        deleteUrl = `${BASE_URL}/api/admin/servers/${id}/storage/${diskId}`;
      }

      await fetch(deleteUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await reloadData();
      toast.success("Item deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredExisting = useMemo(() => {
    let data = Array.isArray(existing) ? [...existing] : [];

    const q = debouncedSearchQuery.trim().toLowerCase();

    // 🔍 SEARCH FILTER
    if (q) {
      data = data.filter((item) =>
        Object.entries(item || {}).some(([key, val]) => {
          if (val === null || val === undefined) return false;

          // Convert boolean to Yes/No for search
          if (typeof val === "boolean") {
            return (val ? "yes" : "no").includes(q);
          }

          // Convert everything else safely
          return String(val).toLowerCase().includes(q);
        }),
      );
    }

    // ✅ InUse filter
    if (endpoint === "/ips" && inUseFilter !== "all") {
      data = data.filter((item) => {
        if (inUseFilter === "yes") return item.inUse === true;
        if (inUseFilter === "no") return item.inUse === false;
        return true;
      });
    }

    return data;
  }, [existing, debouncedSearchQuery, inUseFilter, endpoint]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, inUseFilter]);
  // UI RENDERING
  const totalPages = Math.ceil(filteredExisting.length / itemsPerPage);
  const displayed = filteredExisting.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get fields for display
  const currentFields = resolvedFields;

  const getPagination = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      end = Math.min(5, totalPages);
    }

    if (currentPage > totalPages - 3) {
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      <style>{`
        .swal2-confirm.swal2-confirm-glow {
          box-shadow: 0 0 12px rgba(76,139,255,0.8) !important;
        }
        .swal2-input, .swal2-select {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: #e6e6e6;
          box-shadow: none;
        }
        .swal2-select {
          color: #000 !important;
          background: #ffffff !important;
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-4 md:p-6 lg:p-10 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
            {title} for {endpoint === "/ips" ? "Zone" : "Server"} #{id}
          </h1>
        </div>

        {isProcessing && (
          <div className="bg-[#0e1525] border border-indigo-900/40 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>
                Creating IPs... ({processedIps}/{totalIps})
              </span>{" "}
              <span>{progress}%</span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2 text-xs text-gray-400">
              {processedIps} / {totalIps} processed
            </div>
          </div>
        )}

        {/* ADD FORM SECTION */}
        {showAddForm && (
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-4 md:p-6 shadow-2xl border border-indigo-900/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* IP MODE SELECTOR (ONLY FOR IPS) */}
              {endpoint === "/ips" && (
                <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setIpMode("single")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                      ipMode === "single"
                        ? "bg-indigo-600 shadow-lg shadow-indigo-500/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Add Single IP
                  </button>

                  <button
                    type="button"
                    onClick={() => setIpMode("range")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                      ipMode === "range"
                        ? "bg-green-600 shadow-lg shadow-green-500/25"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    Add IP Range
                  </button>
                </div>
              )}

              {/* FORM TABLE - DESKTOP */}
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-indigo-900/40">
                <table className="min-w-[600px] w-full text-left border-collapse">
                  <thead className="bg-[#151c2f] text-gray-300 uppercase text-sm tracking-wider">
                    <tr>
                      {currentFields.map((f) => (
                        <th
                          key={f.name}
                          className="px-4 md:px-6 py-3 border-b border-indigo-900/40"
                        >
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className={`${
                          i % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                        } relative group`} // Add relative and group classes
                      >
                        {currentFields.map((f) => (
                          <td
                            key={f.name}
                            className="px-4 md:px-6 py-3 border-b border-indigo-900/30"
                          >
                            {f.type === "checkbox" ? (
                              <input
                                type="checkbox"
                                checked={row[f.name]}
                                onChange={(e) =>
                                  handleChange(i, f.name, e.target.checked)
                                }
                                className="w-5 h-5 accent-indigo-600"
                              />
                            ) : (
                              <input
                                type={f.type}
                                value={row[f.name]}
                                onChange={(e) =>
                                  handleChange(i, f.name, e.target.value)
                                }
                                placeholder={`Enter ${f.label}`}
                                required={f.name !== "mac"}
                                className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2"
                              />
                            )}
                          </td>
                        ))}

                        {/* Delete button positioned absolutely on the right */}
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newRows = rows.filter(
                                (_, idx) => idx !== i,
                              );
                              setRows(
                                newRows.length ? newRows : [getEmptyRow()],
                              );
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Remove Row"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* FORM MOBILE VIEW */}
              <div className="block sm:hidden space-y-4">
                {rows.map((row, i) => (
                  <div
                    key={i}
                    className="bg-[#141b2e] border border-indigo-900/40 rounded-xl p-4 space-y-3 relative"
                  >
                    {currentFields.map((f) => (
                      <div key={f.name} className="flex flex-col">
                        <label className="text-gray-300 text-sm mb-1">
                          {f.label}
                        </label>
                        {f.type === "checkbox" ? (
                          <input
                            type="checkbox"
                            checked={row[f.name]}
                            onChange={(e) =>
                              handleChange(i, f.name, e.target.checked)
                            }
                            className="w-5 h-5 accent-indigo-600"
                          />
                        ) : (
                          <input
                            type={f.type}
                            value={row[f.name]}
                            onChange={(e) =>
                              handleChange(i, f.name, e.target.value)
                            }
                            placeholder={`Enter ${f.label}`}
                            required={f.name !== "mac"}
                            className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2"
                          />
                        )}
                      </div>
                    ))}

                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newRows = rows.filter((_, idx) => idx !== i);
                          setRows(newRows.length ? newRows : [getEmptyRow()]);
                        }}
                        className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition-all p-1"
                        title="Remove Row"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* FORM BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 md:px-5 md:py-3 rounded-xl shadow-md transition-all duration-300 w-full sm:w-auto"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Row
                </button>

                <button
                  type="submit"
                  disabled={saving || isProcessing}
                  className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl text-white shadow-md transition-all duration-300 w-full sm:w-auto ${
                    saving
                      ? "bg-indigo-700 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {endpoint === "/ips" && ipMode === "range"
                        ? "Creating Range..."
                        : "Saving..."}
                    </>
                  ) : endpoint === "/ips" && ipMode === "range" ? (
                    "Create Range"
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/*   TRIES SECTION */}
        {(showExisting || extraForm === "disks") && (
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-4 md:p-6 shadow-2xl border border-indigo-900/40">
            <h2
              className={`text-xl md:text-2xl font-semibold mb-4 ${
                extraForm === "disks" ? "text-green-400" : "text-indigo-400"
              }`}
            >
              {extraForm === "disks" ? "Available Disks" : "Existing Entries"}
              <span className="text-sm text-gray-400 ml-3">
                ({filteredExisting.length} results)
              </span>
            </h2>
            <div className="bg-gradient-to-br from-[#151c2f] to-[#1a2138] border border-indigo-900/40 rounded-2xl p-5 mb-8 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search Input - Enhanced */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/60 group-focus-within:text-indigo-400 transition-colors duration-200" />
                  <input
                    type="text"
                    placeholder="Search by IP, hostname, or description..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-12 pr-4 py-3 
          bg-[#0e1525]/80 backdrop-blur-sm
          border border-indigo-900/50 
          rounded-xl
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
          text-gray-200 placeholder:text-gray-500
          transition-all duration-200
          group-hover:border-indigo-800"
                  />

                  {/* Optional: Clear button when search has value */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-indigo-900/30 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-300" />
                    </button>
                  )}
                </div>

                {/* ✅ ONLY SHOW FOR IPS - Enhanced Select */}
                {endpoint === "/ips" && (
                  <div className="relative w-full md:w-72 group">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>

                    {/* Icon */}
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 z-10" />

                    {/* Custom Chevron */}
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/60 group-hover:text-indigo-400 transition-colors duration-200 z-10" />

                    <select
                      value={inUseFilter}
                      onChange={(e) => {
                        setInUseFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none w-full pl-11 pr-11 py-3
            bg-[#0e1525]/90 backdrop-blur-sm
            border border-indigo-900/50
            rounded-xl
            text-gray-200 font-medium
            cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
            transition-all duration-200
            group-hover:border-indigo-700
            shadow-lg"
                    >
                      <option
                        value="all"
                        className="bg-[#151c2f] text-gray-200"
                      >
                        All
                      </option>
                      <option
                        value="yes"
                        className="bg-[#151c2f] text-gray-200"
                      >
                        In Use
                      </option>
                      <option value="no" className="bg-[#151c2f] text-gray-200">
                        Available
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* Optional: Quick filter chips for mobile */}
              {endpoint === "/ips" && (
                <div className="flex md:hidden gap-2 mt-4 pt-2 border-t border-indigo-900/30">
                  <button
                    onClick={() => {
                      setInUseFilter("all");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      inUseFilter === "all"
                        ? "bg-indigo-600 text-white"
                        : "bg-[#0e1525] text-gray-400 hover:text-gray-300 border border-indigo-900/30"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setInUseFilter("yes");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      inUseFilter === "yes"
                        ? "bg-green-600 text-white"
                        : "bg-[#0e1525] text-gray-400 hover:text-gray-300 border border-indigo-900/30"
                    }`}
                  >
                    In Use
                  </button>
                  <button
                    onClick={() => {
                      setInUseFilter("no");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      inUseFilter === "no"
                        ? "bg-gray-600 text-white"
                        : "bg-[#0e1525] text-gray-400 hover:text-gray-300 border border-indigo-900/30"
                    }`}
                  >
                    Available
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="ml-3 text-gray-300">Loading...</span>
              </div>
            ) : filteredExisting.length === 0 ? (
              <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-700 rounded-xl">
                No records found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-indigo-900/40">
                  <table className="min-w-[600px] w-full text-left border-collapse">
                    <thead className="bg-[#151c2f] text-gray-300 uppercase text-xs md:text-sm tracking-wider">
                      <tr>
                        {displayed.length > 0 &&
                          Object.keys(displayed[0]).map((key) => (
                            <th
                              key={key}
                              className="px-3 md:px-6 py-2 md:py-3 border-b border-indigo-900/40"
                            >
                              {key}
                            </th>
                          ))}

                        {showActions && (
                          <th className="px-3 md:px-6 py-2 md:py-3 border-b border-indigo-900/40 text-center">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {displayed.map((item, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-[#141b2e]" : "bg-[#19223c]"
                          } hover:bg-[#1b2545]/60 transition-colors`}
                        >
                          {Object.entries(item).map(([key, val], j) => {
                            let displayValue = val;

                            if (key === "inUse") {
                              displayValue = val ? "Yes" : "No";
                            }

                            if (
                              extraForm === "disks" &&
                              [
                                "TOTALDISKGB",
                                "USABLEDISKGB",
                                "LIVEUSEDGB",
                                "LIVEAVAILABLEGB",
                              ].includes(key.toUpperCase()) &&
                              !isNaN(val)
                            ) {
                              displayValue =
                                (Number(val) / 1024).toFixed(2) + " TB";
                            }

                            return (
                              <td
                                key={j}
                                className="px-3 md:px-6 py-2 md:py-3 border-b border-indigo-900/30 text-sm md:text-base"
                              >
                                {displayValue}
                              </td>
                            );
                          })}

                          {/* ACTION BUTTONS */}
                          {showActions && (
                            <td className="px-3 md:px-6 py-2 md:py-3 border-b border-indigo-900/30 text-center">
                              <div className="flex justify-center gap-2 md:gap-4">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1 md:p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487a2.12 2.12 0 113.001 3.001L7.5 19.85l-4 1 1-4 12.362-12.363z"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-1 md:p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredExisting.length > itemsPerPage && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 md:px-4 md:py-2 rounded-md border border-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      Previous
                    </button>

                    {getPagination().map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === page
                            ? "bg-indigo-600 text-white"
                            : "bg-[#1a2035] text-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 md:px-4 md:py-2 rounded-md border border-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          {/* Scoped premium CSS */}
          <style>{`
            .edit-modal {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }
            .edit-modal-input {
              background: rgba(13, 17, 23, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 0 transparent;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .edit-modal-input:hover {
              border-color: rgba(255, 255, 255, 0.15);
            }
            .edit-modal-input:focus {
              border-color: rgba(99, 102, 241, 0.5);
              box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(99, 102, 241, 0.12), 0 0 20px rgba(99, 102, 241, 0.1);
              outline: none;
            }
            .edit-modal-icon {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .edit-modal-field:hover .edit-modal-icon {
              transform: scale(1.1);
            }
            .edit-modal-save {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .edit-modal-save:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 30px -8px rgba(99, 102, 241, 0.4);
              filter: brightness(1.1);
            }
            .edit-modal-save:active {
              transform: translateY(0);
            }
            @keyframes subtlePulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .edit-status-dot {
              animation: subtlePulse 2s ease-in-out infinite;
            }
          `}</style>

          <div
            className="edit-modal bg-[#111827] w-full max-w-2xl rounded-2xl border border-white/[0.06] overflow-hidden"
            style={{
              boxShadow:
                "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 40px -10px rgba(99, 102, 241, 0.08)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="px-7 py-5 border-b border-white/[0.06]"
              style={{
                background: "linear-gradient(135deg, #111827 0%, #0f172a 100%)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="edit-modal-icon p-2.5 rounded-xl text-white"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      boxShadow: "0 8px 20px -4px rgba(99, 102, 241, 0.35)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">
                      Edit {title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 font-normal">
                      <span className="w-1 h-1 rounded-full bg-indigo-500/60"></span>
                      Manage Resource Details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-2 rounded-full hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <X className="w-5 h-5 text-gray-500 group-hover:text-gray-300 group-hover:rotate-90 transition-all duration-300" />
                </button>
              </div>
            </div>

            {/* ── Form Body ── */}
            <form
              onSubmit={handleEditSubmit}
              className="p-7 max-h-[70vh] overflow-y-auto"
              style={{
                background: "linear-gradient(180deg, #111827 0%, #0f172a 100%)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resolvedFields.map((field, index) => {
                  const value = editFormData[field.name];
                  const isRequired =
                    field.name !== "mac" && field.name !== "inUse";

                  // ── Premium icon mapping ──
                  const getFieldIcon = (fieldName) => {
                    const icons = {
                      ip: <Globe className="w-4 h-4" />,
                      cidr: <Network className="w-4 h-4" />,
                      gateway: <Settings className="w-4 h-4" />,
                      mac: <Network className="w-4 h-4" />,
                      inUse: <CheckCircle className="w-4 h-4" />,
                      startIp: <Globe className="w-4 h-4" />,
                      endIp: <Globe className="w-4 h-4" />,
                      diskName: <HardDrive className="w-4 h-4" />,
                      maxVms: <Layers className="w-4 h-4" />,
                      usableDiskPercentage: <PieChart className="w-4 h-4" />,
                    };
                    return icons[fieldName] || <Database className="w-4 h-4" />;
                  };

                  // ── Gradient colors per field ──
                  const getFieldGradient = (fieldName) => {
                    const gradients = {
                      ip: {
                        bg: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                        shadow: "rgba(59, 130, 246, 0.3)",
                      },
                      cidr: {
                        bg: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                        shadow: "rgba(139, 92, 246, 0.3)",
                      },
                      gateway: {
                        bg: "linear-gradient(135deg, #f59e0b, #f97316)",
                        shadow: "rgba(245, 158, 11, 0.3)",
                      },
                      mac: {
                        bg: "linear-gradient(135deg, #10b981, #14b8a6)",
                        shadow: "rgba(16, 185, 129, 0.3)",
                      },
                      inUse: {
                        bg: "linear-gradient(135deg, #10b981, #22c55e)",
                        shadow: "rgba(16, 185, 129, 0.3)",
                      },
                      startIp: {
                        bg: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        shadow: "rgba(59, 130, 246, 0.3)",
                      },
                      endIp: {
                        bg: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        shadow: "rgba(99, 102, 241, 0.3)",
                      },
                      diskName: {
                        bg: "linear-gradient(135deg, #3b82f6, #22d3ee)",
                        shadow: "rgba(59, 130, 246, 0.3)",
                      },
                      maxVms: {
                        bg: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                        shadow: "rgba(139, 92, 246, 0.3)",
                      },
                      usableDiskPercentage: {
                        bg: "linear-gradient(135deg, #f43f5e, #ec4899)",
                        shadow: "rgba(244, 63, 94, 0.3)",
                      },
                    };
                    return (
                      gradients[fieldName] || {
                        bg: "linear-gradient(135deg, #6b7280, #9ca3af)",
                        shadow: "rgba(107, 114, 128, 0.3)",
                      }
                    );
                  };

                  // ── Grid balancing ──
                  const isFullWidthField =
                    field.name === "inUse" ||
                    field.name === "diskName" ||
                    (fields.length === 3 && index === 0);

                  const fieldClassName = isFullWidthField
                    ? "md:col-span-2"
                    : "";
                  const gradient = getFieldGradient(field.name);

                  return (
                    <div
                      key={field.name}
                      className={`edit-modal-field group ${fieldClassName}`}
                    >
                      {/* ── Label Row ── */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="edit-modal-icon p-2 rounded-xl text-white"
                          style={{
                            background: gradient.bg,
                            boxShadow: `0 6px 16px -4px ${gradient.shadow}`,
                          }}
                        >
                          {getFieldIcon(field.name)}
                        </div>
                        <label className="text-[13px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                          {field.label}
                          {isRequired && (
                            <span className="text-indigo-400 ml-1">*</span>
                          )}
                        </label>

                        {/* Status badge for inUse */}
                        {field.name === "inUse" && (
                          <div className="ml-auto">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                value
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-gray-500/15 text-gray-400 border border-gray-500/20"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${value ? "bg-emerald-400 edit-status-dot" : "bg-gray-500"}`}
                              ></span>
                              {value ? "Active" : "Inactive"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ── Input / Toggle ── */}
                      {field.type === "checkbox" ? (
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300"
                          style={{
                            background: "rgba(13, 17, 23, 0.6)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setEditFormData({
                                ...editFormData,
                                [field.name]: !value,
                              })
                            }
                            className="relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                              background: value
                                ? "linear-gradient(135deg, #10b981, #22c55e)"
                                : "#374151",
                              boxShadow: value
                                ? "0 4px 12px -2px rgba(16, 185, 129, 0.4)"
                                : "none",
                            }}
                          >
                            <span
                              className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
                                value ? "translate-x-7" : ""
                              }`}
                            />
                          </button>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-300 font-medium">
                              {value
                                ? "Resource is in use"
                                : "Resource is available"}
                            </span>
                            <span className="text-xs text-gray-500">
                              Toggle to change status
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type={field.type}
                            value={value ?? ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                [field.name]: e.target.value,
                              })
                            }
                            className="edit-modal-input w-full text-gray-200 rounded-xl px-4 py-3.5 text-sm placeholder:text-gray-600/80"
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required={isRequired}
                          />
                          {/* Optional badge */}
                          {!isRequired && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <span
                                className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 rounded-md"
                                style={{
                                  background: "rgba(31, 41, 55, 0.8)",
                                  border: "1px solid rgba(255, 255, 255, 0.06)",
                                }}
                              >
                                optional
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── Footer ── */}
              <div
                className="flex items-center justify-between gap-3 mt-8 pt-6"
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full edit-status-dot"></span>
                  <span className="text-xs text-gray-500 font-normal">
                    Unsaved changes
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-200 rounded-xl hover:bg-white/[0.04] transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="edit-modal-save px-7 py-2.5 text-sm font-semibold text-white rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      boxShadow: "0 8px 20px -6px rgba(99, 102, 241, 0.35)",
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
