import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

export default function ManageResourcesPage({
  title,
  endpoint,
  fields,
  showExisting = true,
  extraForm = null,
}) {
  const { id } = useParams();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const ISO_OS_TYPES = [
    "WINDOWS",
    "UBUNTU",
    "UBUNTU_LEGACY",
    "DEBIAN",
    "RHEL_NM",
    "OPENSUSE",
  ];

  const [rows, setRows] = useState([]);
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ipMode, setIpMode] = useState("single");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔄 RESOLVE FIELDS BASED ON ENDPOINT AND MODE
  const resolvedFields = useMemo(() => {
    if (endpoint === "/ips") {
      return ipMode === "single" ? ipSingleFields : ipRangeFields;
    }
    if (endpoint === "/isos") {
      return [
        { name: "iso", label: "ISO Name", type: "text" },
        { name: "vmid", label: "VMID", type: "text" },
        {
          name: "osType",
          label: "OS Type",
          type: "iso-select",
          // options: ISO_OS_TYPES,
        },
      ];
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
            const totalIps = end - start + 1;

            if (totalIps > 256) {
              const confirm = await Swal.fire({
                title: "Large IP Range",
                text: `You are about to create ${totalIps} IPs. This may take a while. Continue?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Continue",
                cancelButtonText: "Cancel",
                background: "#1e2640",
                color: "#fff",
              });

              if (!confirm.isConfirmed) continue;
            }

            // Create IPs in batches
            const batchSize = 50;
            for (let i = start; i <= end; i += batchSize) {
              const batchEnd = Math.min(i + batchSize - 1, end);
              const batchPromises = [];

              for (let j = i; j <= batchEnd; j++) {
                const ip = numberToIp(j);
                const payload = {
                  ip: ip,
                  cidr: cidr,
                  subnetMask: subnetMask,
                  gateway: row.gateway.trim(),
                  mac: null,
                  inUse: false,
                };

                batchPromises.push(
                  fetch(`${BASE_URL}/api/admin/zones/${id}/ips`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                  }),
                );
              }

              await Promise.all(batchPromises);
            }
          }
        }
      }
      // ==================== DISK HANDLING ====================
      else if (extraForm === "disks") {
        for (const row of rows) {
          const payload = {
            diskName: row.diskName,
            maxVms: Number(row.maxVms) || 0,
            usableDiskPercentage: Number(row.usableDiskPercentage) || 100,
          };

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

          if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to add disk: ${error}`);
          }
        }
      }
      // ==================== OTHER RESOURCES (ISOs, etc.) ====================
      else if (endpoint === "/isos") {
        for (const row of rows) {
          if (!row.iso || !row.vmid || !row.osType) {
            toast.error("Please fill ISO, VMID and OS Type");
            continue;
          }

          const payload = {
            iso: row.iso.trim(),
            vmid: row.vmid.trim(),
            osType: row.osType,
          };

          const res = await fetch(`${BASE_URL}/api/admin/servers/${id}/isos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to add ISO: ${error}`);
          }
        }
      }

      await reloadData();
      setRows([getEmptyRow()]);
      toast.success(`${title} added successfully!`);
    } catch (err) {
      toast.error("Error adding item:", err);
      toast.error(err.message || `Failed to add ${title}`);
    } finally {
      setSaving(false);
    }
  };

  // ✏️ EDIT HANDLER FOR ALL RESOURCE TYPES
  const handleEdit = async (item) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("No admin token found.");
      return;
    }

    try {
      // ==================== IP EDIT ====================
      if (endpoint === "/ips") {
        // 1️⃣ IP
        const { value: ip } = await Swal.fire({
          title: "Edit IP Address",
          input: "text",
          inputValue: item.ip,
          confirmButtonText: "Next",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return "IP is required";
            if (!validateIp(value)) return "Invalid IP address";
            return null;
          },
          background: "#1e2640",
          color: "#fff",
        });
        if (!ip) return;

        // 2️⃣ CIDR
        const { value: cidr } = await Swal.fire({
          title: "Edit CIDR",
          input: "text",
          inputValue: item.cidr || "/24",
          confirmButtonText: "Next",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!/^\/\d{1,2}$/.test(value)) return "Invalid CIDR format";
            return null;
          },
          background: "#1e2640",
          color: "#fff",
        });
        if (!cidr) return;

        // 3️⃣ Subnet Mask
        const { value: subnetMask } = await Swal.fire({
          title: "Edit Subnet Mask",
          input: "text",
          inputValue: item.subnetMask || cidrToSubnet(cidr),
          confirmButtonText: "Next",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!validateIp(value)) return "Invalid subnet mask";
            return null;
          },
          background: "#1e2640",
          color: "#fff",
        });
        if (!subnetMask) return;

        // 4️⃣ Gateway
        const { value: gateway } = await Swal.fire({
          title: "Edit Gateway",
          input: "text",
          inputValue: item.gateway,
          confirmButtonText: "Next",
          showCancelButton: true,
          inputValidator: (value) => {
            if (!validateIp(value)) return "Invalid gateway IP";
            return null;
          },
          background: "#1e2640",
          color: "#fff",
        });
        if (!gateway) return;

        // 5️⃣ MAC
        const { value: mac } = await Swal.fire({
          title: "Edit MAC Address",
          input: "text",
          inputValue: item.mac || "",
          inputPlaceholder: "Optional",
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });
        if (mac === undefined) return;

        // 6️⃣ In Use (FINAL STEP)
        const { value: inUse } = await Swal.fire({
          title: "Mark as In Use?",
          input: "select",
          inputOptions: {
            true: "Yes - In Use",
            false: "No - Available",
          },
          inputValue: item.inUse ? "true" : "false",
          confirmButtonText: "Save", // ✅ FINAL BUTTON
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });
        if (inUse === null) return;

        // 🚀 SAVE
        await fetch(`${BASE_URL}/api/admin/zones/${id}/ips/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ip: ip.trim(),
            cidr,
            subnetMask,
            gateway,
            mac: mac?.trim() || null,
            inUse: inUse === "true",
          }),
        });

        await reloadData();
        toast.success("IP updated successfully!");
        return;
      }

      // ==================== ISO EDIT ====================
      if (endpoint === "/isos") {
        // 1️⃣ ISO NAME
        const { value: iso } = await Swal.fire({
          title: "Edit ISO Name",
          input: "text",
          inputValue: item.iso,
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
          inputValidator: (value) => {
            if (!value) return "ISO name is required";
            return null;
          },
        });
        if (!iso) return;

        // 2️⃣ VMID
        const { value: vmid } = await Swal.fire({
          title: "Edit VMID",
          input: "text",
          inputValue: item.vmid,
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
          inputValidator: (value) => {
            if (!value) return "VMID is required";
            return null;
          },
        });
        if (!vmid) return;

        // 3️⃣ OS TYPE (DROPDOWN)
        const { value: osType } = await Swal.fire({
          title: "Select OS Type",
          input: "select",
          inputOptions: ISO_OS_TYPES.reduce((acc, os) => {
            acc[os] = os;
            return acc;
          }, {}),
          inputValue: item.osType || "",
          confirmButtonText: "Save",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
          inputValidator: (value) => {
            if (!value) return "OS Type is required";
            return null;
          },
        });
        if (!osType) return;

        // 🚀 SAVE
        await fetch(`${BASE_URL}/api/admin/servers/${id}/isos/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            iso: iso.trim(),
            vmid: vmid.trim(),
            osType,
          }),
        });

        await reloadData();
        toast.success("ISO updated successfully!");
        return;
      }

      // ==================== DISK EDIT ====================
      if (extraForm === "disks") {
        const diskId = item.id || item.ID || item.Id || item.storage_id;
        if (!diskId) {
          toast.error("Disk ID not found");
          return;
        }

        const { value: type } = await Swal.fire({
          title: "What do you want to edit?",
          input: "select",
          inputOptions: {
            vms: "Max VMs",
            percentage: "Usable Percentage",
          },
          inputPlaceholder: "Select field",
          confirmButtonText: "Next",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });

        if (!type) return;

        const { value: newVal } = await Swal.fire({
          title: "Enter new value",
          input: "number",
          confirmButtonText: "Save",
          showCancelButton: true,
          background: "#1e2640",
          color: "#fff",
        });

        if (newVal === null) return;

        let url = "";
        let body = {};

        if (type === "vms") {
          url = `${BASE_URL}/api/admin/servers/${id}/storage/${diskId}/max-vms`;
          body = { maxVms: Number(newVal) };
        } else {
          url = `${BASE_URL}/api/admin/servers/${id}/storage/${diskId}/percentage`;
          body = { usableDiskPercentage: Number(newVal) };
        }

        await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        await reloadData();
        toast.success("Disk updated successfully!");
        return;
      }
    } catch (err) {
      toast.error("Update failed");
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
      } else if (endpoint === "/isos") {
        deleteUrl = `${BASE_URL}/api/admin/servers/${id}/isos/${item.id}`;
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

  // UI RENDERING
  const totalPages = Math.ceil(existing.length / itemsPerPage);
  const displayed = existing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get fields for display
  const currentFields = resolvedFields;

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
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-6">
          {title} for {endpoint === "/ips" ? "Zone" : "Server"} #{id}
        </h1>

        {/* ADD FORM SECTION */}
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
                          ) : f.type === "iso-select" ? (
                            // ✅ ISO ONLY DROPDOWN
                            <select
                              value={row[f.name]}
                              onChange={(e) =>
                                handleChange(i, f.name, e.target.value)
                              }
                              required
                              className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2"
                            >
                              <option value="">Select OS Type</option>
                              {ISO_OS_TYPES.map((os) => (
                                <option key={os} value={os}>
                                  {os}
                                </option>
                              ))}
                            </select>
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
                            const newRows = rows.filter((_, idx) => idx !== i);
                            setRows(newRows.length ? newRows : [getEmptyRow()]);
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
                      ) : f.type === "iso-select" ? (
                        // ✅ ISO ONLY (MOBILE)
                        <select
                          value={row[f.name]}
                          onChange={(e) =>
                            handleChange(i, f.name, e.target.value)
                          }
                          required={f.name !== "mac"}
                          className="w-full bg-[#0e1525] border border-indigo-900/40 text-gray-200 rounded-lg px-3 py-2"
                        >
                          <option value="">Select OS Type</option>
                          {ISO_OS_TYPES.map((os) => (
                            <option key={os} value={os}>
                              {os}
                            </option>
                          ))}
                        </select>
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
                disabled={saving}
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

        {/* EXISTING ENTRIES SECTION */}
        {(showExisting || extraForm === "disks") && (
          <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] rounded-2xl p-4 md:p-6 shadow-2xl border border-indigo-900/40">
            <h2
              className={`text-xl md:text-2xl font-semibold mb-4 ${
                extraForm === "disks" ? "text-green-400" : "text-indigo-400"
              }`}
            >
              {extraForm === "disks" ? "Available Disks" : "Existing Entries"}
              <span className="text-sm text-gray-400 ml-3">
                ({existing.length} total)
              </span>
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="ml-3 text-gray-300">Loading...</span>
              </div>
            ) : existing.length === 0 ? (
              <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-700 rounded-xl">
                No records found.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-indigo-900/40">
                  <table className="min-w-[600px] w-full text-left border-collapse">
                    <thead className="bg-[#151c2f] text-gray-300 uppercase text-xs md:text-sm tracking-wider">
                      <tr>
                        {Object.keys(displayed[0]).map((key) => (
                          <th
                            key={key}
                            className="px-3 md:px-6 py-2 md:py-3 border-b border-indigo-900/40"
                          >
                            {key}
                          </th>
                        ))}
                        <th className="px-3 md:px-6 py-2 md:py-3 border-b border-indigo-900/40 text-center">
                          Actions
                        </th>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {existing.length > itemsPerPage && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 md:px-4 md:py-2 rounded-md border border-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-2 py-1 md:px-3 md:py-1 rounded-md border text-xs md:text-sm ${
                          currentPage === i + 1
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-[#1a2035] border-indigo-800 text-gray-300 hover:bg-indigo-700/40"
                        }`}
                      >
                        {i + 1}
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
    </div>
  );
}
