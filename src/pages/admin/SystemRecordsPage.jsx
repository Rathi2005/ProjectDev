// SystemRecordsPage.jsx - Complete updated file
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Database,
  Users,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Calendar,
  IndianRupee,
  User,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Hash,
  FileText,
  Building,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Eye,
} from "lucide-react";

const DarkSwal = Swal.mixin({
  background: "#1e2640",
  color: "#ffffff",
  confirmButtonColor: "#6366f1",
  cancelButtonColor: "#4b5563",
});

export default function SystemRecordsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    revenue: 0,
  });

  const [showVmModal, setShowVmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    userId: "",
    serverId: "",
    zoneId: "",
    vmid: "",
    vmName: "",
    planType: "", 
    cpuPriceId: "",
    ramPriceId: "",
    diskPriceId: "",
    bandwidthPriceId: "",
    isoId: "",
    storageId: "",
    ipAddress: "",
    macAddress: "",
    cidr: "/24",
    gateway: "",
    subnetMask: "",
    expiresAt: "",
    storageId: "",
  });

  const [servers, setServers] = useState([]);
  const [cpuOptions, setCpuOptions] = useState([]);
  const [ramOptions, setRamOptions] = useState([]);
  const [diskOptions, setDiskOptions] = useState([]);
  const [bandwidthOptions, setBandwidthOptions] = useState([]);
  const [isos, setIsos] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [storageOptions, setStorageOptions] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Plan types for step 3
  const planTypes = [
    { id: "DEDICATED", name: "Dedicated Resources" },
    { id: "SHARED", name: "Shared Resources" },
  ];

  const pageType = location.pathname.includes("deleted-vms")
    ? "deleted-vms"
    : location.pathname.includes("garbage-records")
      ? "garbage-records"
      : "users-overview";

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    fetchRecords();
  }, [pageType]);

  // Fetch ISOs when server is selected (Step 2)
  useEffect(() => {
    if (!form.serverId) {
      setIsos([]);
      setStorageOptions([]);
      setForm((f) => ({ ...f, zoneId: "", storageId: "" }));
      return;
    }

    const token = localStorage.getItem("adminToken");

    // Find zoneId from selected server
    const selectedServer = servers.find(
      (s) => s.id.toString() === form.serverId.toString(),
    );
    if (selectedServer && selectedServer.zoneId) {
      setForm((f) => ({ ...f, zoneId: selectedServer.zoneId }));
    }

    // Fetch ISOs
    fetch(`${BASE_URL}/api/options/servers/${form.serverId}/isos/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch ISOs: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const isoArray = normalizeToArray(data);
        setIsos(isoArray);
      })
      .catch((error) => {
        console.error("Error fetching ISOs:", error);
        setIsos([]);
      });

    // Fetch storage details
    setLoadingStorage(true);
    fetch(`${BASE_URL}/api/admin/servers/${form.serverId}/disk-details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch storage: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const storageArray = normalizeToArray(data);
        setStorageOptions(storageArray);
      })
      .catch((error) => {
        console.error("Error fetching storage:", error);
        setStorageOptions([]);
      })
      .finally(() => {
        setLoadingStorage(false);
      });
  }, [form.serverId, servers]);

  // Fetch pricing when plan type is selected (Step 4)
  useEffect(() => {
    if (!form.planType) {
      setCpuOptions([]);
      setRamOptions([]);
      setDiskOptions([]);
      setBandwidthOptions([]);
      return;
    }

    const fetchPricing = async () => {
      setLoadingPricing(true);
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Adjust API endpoints based on plan type
        const pricingType = form.planType.toLowerCase();
        const [cpuRes, ramRes, diskRes, bandwidthRes] = await Promise.all([
          fetch(`${BASE_URL}/api/pricing/${pricingType}/cpu`, { headers }),
          fetch(`${BASE_URL}/api/pricing/${pricingType}/ram`, { headers }),
          fetch(`${BASE_URL}/api/pricing/${pricingType}/disk`, { headers }),
          fetch(`${BASE_URL}/api/pricing/${pricingType}/bandwidth`, {
            headers,
          }),
        ]);

        const cpuJson = await cpuRes.json();
        const ramJson = await ramRes.json();
        const diskJson = await diskRes.json();
        const bandwidthJson = await bandwidthRes.json();

        setCpuOptions(normalizeToArray(cpuJson));
        setRamOptions(normalizeToArray(ramJson));
        setDiskOptions(normalizeToArray(diskJson));
        setBandwidthOptions(normalizeToArray(bandwidthJson));
      } catch (error) {
        console.error("Error fetching pricing:", error);
        DarkSwal.fire("Error", "Failed to fetch pricing options", "error");
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [form.planType]);

  useEffect(() => {
    setShowVmModal(false);
    setSelectedUser(null);
    setServers([]);
    setCpuOptions([]);
    setRamOptions([]);
    setDiskOptions([]);
    setBandwidthOptions([]);
    setIsos([]);
    setForm({
      userId: "",
      serverId: "",
      zoneId: "",
      vmid: "",
      vmName: "",
      planType: "",
      cpuPriceId: "",
      ramPriceId: "",
      diskPriceId: "",
      bandwidthPriceId: "",
      isoId: "",
      storageId: "",
      ipAddress: "",
      macAddress: "",
      cidr: "/24",
      gateway: "",
      subnetMask: "",
      expiresAt: "",
    });
  }, [pageType]);

  const normalizeToArray = (data) => {
    if (!data) {
      return [];
    }
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (typeof data === "object") {
      // Check if it's empty object
      if (Object.keys(data).length === 0) {
        return [];
      }
      // Try to extract array from object
      const values = Object.values(data);

      if (values.length > 0 && Array.isArray(values[0])) {
        const flattened = values.flat();

        return flattened;
      }
      return values;
    }
    return [];
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");

      let endpoint = "";
      switch (pageType) {
        case "deleted-vms":
          endpoint = `${BASE_URL}/api/admin/records/deleted-vms`;
          break;
        case "garbage-records":
          endpoint = `${BASE_URL}/api/admin/garbage/records`;
          break;
        case "users-overview":
          endpoint = `${BASE_URL}/api/admin/users/overview`;
          break;
        default:
          return;
      }

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();

        // Handle different API response formats
        let processedData = [];

        if (pageType === "users-overview") {
          // Format 1: Direct array of user objects
          if (Array.isArray(data)) {
            processedData = data.map((user) => ({
              id: user.userId || user.id,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              billingAddress: user.billingAddress || {},
              vms: user.vms || [],
              totalVMs: user.vms?.length || 0,
              activeVMs:
                user.vms?.filter(
                  (vm) => vm.status === "ACTIVE" || vm.liveState === "running",
                ).length || 0,
              totalSpent: calculateUserSpent(user.vms || []),
            }));
          }
        } else if (pageType === "deleted-vms") {
          // Format for deleted VMs
          if (Array.isArray(data)) {
            processedData = data.map((vm) => ({
              id: vm.id,
              deletionStatus: vm.deletionStatus || "deleted",
              originalVmId: vm.originalVmId,
              orderId: vm.orderId,
              vmid: vm.vmid,
              name: vm.name,
              ipAddress: vm.ipAddress || "N/A",
              cores: vm.cores,
              ramMb: vm.ramMb,
              diskGb: vm.diskGb,
              serverName: vm.serverName || "N/A",
              serverNode: vm.serverNode,
              location: vm.location,
              isoName: vm.isoName,
              planType: vm.planType,
              priceTotal: vm.priceTotal,
              provisionedMonths: vm.provisionedMonths || 1,
              userId: vm.userId,
              userEmail: vm.userEmail || "N/A",
              userFullName: vm.userFullName || "N/A",
              billingCompanyName: vm.billingCompanyName || "N/A",
              originalCreatedAt: vm.originalCreatedAt,
              deletionTimestamp: vm.deletionTimestamp,
            }));
          }
        } else if (pageType === "garbage-records") {
          // Format for garbage records
          if (Array.isArray(data)) {
            processedData = data.map((record) => ({
              id: record.id,
              orderTransactionId: record.orderTransactionId || "N/A",
              originalVmId: record.originalVmId,
              vmName: record.vmName,
              userEmail: record.userEmail || "N/A",
              ipAddress: record.ipAddress || "N/A",
              macAddress: record.macAddress || "N/A",
              proxmoxVmId: record.proxmoxVmId,
              cores: record.cores,
              ramMb: record.ramMb,
              diskGb: record.diskGb,
              planType: record.planType,
              amountRupees: record.amountRupees,
              originalCreatedAt: record.originalCreatedAt,
              failureTimestamp: record.failureTimestamp,
              reason: record.reason,
              status: "failed", // All garbage records are failed
            }));
          }
        }

        setRecords(processedData);

        // Calculate stats
        calculateStats(processedData);
      } else {
        throw new Error("Failed to fetch records");
      }
    } catch (error) {
      DarkSwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch records",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateUserSpent = (vms) => {
    return vms.reduce((total, vm) => {
      return total + (vm.price || 0);
    }, 0);
  };

  const calculateStats = (data) => {
    if (pageType === "users-overview") {
      setStats({
        total: data.length,
        active: data.filter((user) => user.activeVMs > 0).length,
        pending: 0,
        revenue: data.reduce((sum, user) => sum + user.totalSpent, 0),
      });
    } else if (pageType === "deleted-vms") {
      setStats({
        total: data.length,
        active: 0,
        pending: 0,
        revenue: data.reduce((sum, vm) => sum + (vm.priceTotal || 0), 0),
      });
    } else if (pageType === "garbage-records") {
      setStats({
        total: data.length,
        active: 0,
        pending: 0,
        revenue: data.reduce(
          (sum, record) => sum + (record.amountRupees || 0),
          0,
        ),
      });
    }
  };

  const getPageConfig = () => {
    switch (pageType) {
      case "deleted-vms":
        return {
          title: "Deleted Virtual Machines",
          subtitle: "List of permanently deleted VMs with complete audit trail",
          icon: <Trash2 className="w-6 h-6 text-red-400" />,
          color: "text-red-400",
          bgColor: "bg-red-400/10",
          columns: [
            { key: "name", label: "VM Name", width: "w-48" },
            { key: "vmid", label: "VM ID", width: "w-24" },
            { key: "userFullName", label: "User", width: "w-48" },
            { key: "deletionTimestamp", label: "Deleted At", width: "w-40" },
            { key: "reason", label: "Reason", width: "w-40" },
          ],
        };
      case "garbage-records":
        return {
          title: "Failed Provisioning Records",
          subtitle: "VMs that failed during provisioning process",
          icon: <Database className="w-6 h-6 text-orange-400" />,
          color: "text-orange-400",
          bgColor: "bg-orange-400/10",
          columns: [
            { key: "vmName", label: "VM Name", width: "w-48" },
            { key: "reason", label: "Failure Reason", width: "w-64" },
            { key: "userEmail", label: "User Email", width: "w-48" },
            { key: "failureTimestamp", label: "Failed At", width: "w-40" },
            { key: "amountRupees", label: "Amount", width: "w-32" },
          ],
        };
      case "users-overview":
        return {
          title: "Users Overview",
          subtitle: "Complete user database with infrastructure details",
          icon: <Users className="w-6 h-6 text-blue-400" />,
          color: "text-blue-400",
          bgColor: "bg-blue-400/10",
          columns: [
            { key: "name", label: "User Details", width: "w-64" },
            { key: "email", label: "Contact", width: "w-64" },
            { key: "vms", label: "Infrastructure", width: "w-48" },
            { key: "billing", label: "Billing Info", width: "w-64" },
            { key: "stats", label: "Statistics", width: "w-48" },
          ],
        };
      default:
        return {
          title: "System Records",
          subtitle: "View system records",
          icon: <Database className="w-6 h-6 text-gray-400" />,
          color: "text-gray-400",
          bgColor: "bg-gray-400/10",
          columns: [],
        };
    }
  };

  const config = getPageConfig();

  const filteredRecords = records.filter((record) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search across all string properties
    return Object.values(record).some((value) => {
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchLower);
      }
      if (typeof value === "number") {
        return value.toString().includes(searchLower);
      }
      if (Array.isArray(value)) {
        return value.some((item) =>
          JSON.stringify(item).toLowerCase().includes(searchLower),
        );
      }
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value).toLowerCase().includes(searchLower);
      }
      return false;
    });
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const openManualVmModal = async (user) => {
    setSelectedUser(user);
    setForm((f) => ({ ...f, userId: user.id }));
    setShowVmModal(true);

    const token = localStorage.getItem("adminToken");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Step 1: Fetch servers
      const serversRes = await fetch(
        `${BASE_URL}/api/options/servers/by-location`,
        { headers },
      );
      const serversJson = await serversRes.json();

      // Convert servers object to array
      const serversArray = [];
      if (serversJson && typeof serversJson === "object") {
        Object.values(serversJson).forEach((locationServers) => {
          if (Array.isArray(locationServers)) {
            // Add zoneId from server object to each server
            serversArray.push(
              ...locationServers.map((server) => ({
                ...server,
                // Ensure zoneId is properly extracted
                zoneId: server.zoneId || server.zone || null,
              })),
            );
          }
        });
      }
      setServers(serversArray);
    } catch (error) {
      DarkSwal.fire("Error", "Failed to fetch server options", "error");
    }
  };

  const submitManualVm = async () => {
    const token = localStorage.getItem("adminToken");

    // 🔥 Normalize payload BEFORE sending
    const payload = {
      userId: Number(form.userId),
      serverId: Number(form.serverId),
      zoneId: Number(form.zoneId),

      vmid: Number(form.vmid),
      vmName: form.vmName,

      planType: form.planType,

      cpuPriceId: Number(form.cpuPriceId),
      ramPriceId: Number(form.ramPriceId),
      diskPriceId: Number(form.diskPriceId),
      bandwidthPriceId: Number(form.bandwidthPriceId),

      isoId: form.isoId ? Number(form.isoId) : null,
      storageId: Number(form.storageId),

      ipAddress: form.ipAddress || null,
      macAddress: form.macAddress || null,
      cidr: form.cidr,
      gateway: form.gateway || null,
      subnetMask: form.subnetMask || null,

      expiresAt: form.expiresAt ? `${form.expiresAt}T00:00:00` : null,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/admin/manual/import-vm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Request failed with status ${res.status}`,
        );
      }

      DarkSwal.fire("Success", "VM Imported Successfully", "success");
      setShowVmModal(false);
      fetchRecords();
    } catch (error) {
      console.error("Manual VM import error:", error);
      DarkSwal.fire("Error", error.message, "error");
    }
  };

  // Render cell content based on page type
  const renderCellContent = (record, column) => {
    switch (pageType) {
      case "deleted-vms":
        switch (column.key) {
          case "name":
            return (
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {record.name || "Unnamed VM"}
                  </div>
                  <div className="text-xs text-gray-400">
                    Order #{record.orderId} • VM #{record.originalVmId}
                  </div>
                </div>
              </div>
            );
          case "vmid":
            return (
              <code className="bg-red-400/10 text-red-300 px-2 py-1 rounded text-xs font-mono">
                {record.vmid || "N/A"}
              </code>
            );
          case "userFullName":
            return (
              <div>
                <div className="font-medium">{record.userFullName}</div>
                <div className="text-xs text-gray-400 truncate">
                  {record.userEmail}
                </div>
                {record.billingCompanyName && (
                  <div className="text-xs text-gray-500">
                    {record.billingCompanyName}
                  </div>
                )}
              </div>
            );
          case "deletionTimestamp":
            return (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <div className="text-sm">
                  <div>{formatDate(record.deletionTimestamp)}</div>
                  <div className="text-xs text-gray-400">
                    Created: {record.originalCreatedAt?.split("T")[0]}
                  </div>
                </div>
              </div>
            );
          case "reason":
            return (
              <div>
                <div className="text-sm">
                  {record.deletionStatus || "Manual Deletion"}
                </div>
                <div className="text-xs text-gray-400">
                  {record.provisionedMonths} month(s)
                </div>
              </div>
            );
          default:
            return String(record[column.key] || "N/A");
        }

      case "garbage-records":
        switch (column.key) {
          case "vmName":
            return (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="font-medium">
                    {record.vmName || "Unnamed VM"}
                  </div>
                  <div className="text-xs text-gray-400">
                    Transaction: {record.orderTransactionId || "N/A"}
                  </div>
                </div>
              </div>
            );
          case "reason":
            return (
              <div>
                <div className="text-sm font-medium text-orange-300">
                  {record.reason || "Unknown Error"}
                </div>
                <div className="text-xs text-gray-400">
                  Proxmox ID: {record.proxmoxVmId || "N/A"}
                </div>
              </div>
            );
          case "userEmail":
            return (
              <div>
                <div className="text-sm truncate">{record.userEmail}</div>
                <div className="text-xs text-gray-400">
                  VM ID: {record.originalVmId}
                </div>
              </div>
            );
          case "failureTimestamp":
            return (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <div className="text-sm">
                  <div>{formatDate(record.failureTimestamp)}</div>
                  <div className="text-xs text-gray-400">
                    Created: {record.originalCreatedAt?.split("T")[0]}
                  </div>
                </div>
              </div>
            );
          case "amountRupees":
            return (
              <div className="font-medium text-green-300">
                {formatCurrency(record.amountRupees)}
              </div>
            );
          default:
            return String(record[column.key] || "N/A");
        }

      case "users-overview":
        switch (column.key) {
          case "name":
            return (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold">
                    {record.firstName} {record.lastName}
                  </div>
                  <div className="text-sm text-gray-400">
                    User ID: {record.id}
                  </div>
                </div>
              </div>
            );
          case "email":
            return (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div className="text-sm break-all">{record.email}</div>
                </div>
                {record.billingAddress?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <div className="text-xs text-gray-400">
                      {record.billingAddress.phoneNumber}
                    </div>
                  </div>
                )}
              </div>
            );
          case "vms":
            return (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{record.totalVMs} VMs</span>
                </div>
                <div className="text-xs text-gray-400">
                  {record.activeVMs} active •{" "}
                  {record.totalVMs - record.activeVMs} inactive
                </div>
                {record.vms.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {record.vms.slice(0, 2).map((vm, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-gray-800/50 px-2 py-1 rounded"
                      >
                        {vm.vmName || "Unnamed"} • {vm.status || "Unknown"}
                      </div>
                    ))}
                    {record.vms.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{record.vms.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          case "billing":
            return (
              <div>
                {record.billingAddress?.companyName && (
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-3 h-3 text-gray-400" />
                    <div className="text-sm">
                      {record.billingAddress.companyName}
                    </div>
                  </div>
                )}
                {record.billingAddress?.streetAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <div className="text-xs text-gray-400 truncate">
                      {record.billingAddress.streetAddress}
                    </div>
                  </div>
                )}
                {record.billingAddress?.taxId && (
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="w-3 h-3 text-gray-400" />
                    <div className="text-xs text-gray-400">
                      Tax ID: {record.billingAddress.taxId}
                    </div>
                  </div>
                )}
              </div>
            );
          case "stats":
            return (
              <div>
                <div className="text-sm font-medium text-emerald-300">
                  {formatCurrency(record.totalSpent)}
                </div>
                <div className="text-xs text-gray-400">Total spent</div>
                <div className="mt-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Active VMs:</span>
                    <span className="font-medium">{record.activeVMs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total VMs:</span>
                    <span className="font-medium">{record.totalVMs}</span>
                  </div>
                </div>
              </div>
            );
          default:
            return String(record[column.key] || "N/A");
        }

      default:
        return String(record[column.key] || "N/A");
    }
  };

  const handleExportCSV = () => {
    // CSV export implementation
    const headers = config.columns.map((col) => col.label).join(",");
    const rows = filteredRecords
      .map((record) =>
        config.columns
          .map((col) => {
            const value = record[col.key];
            return typeof value === "object" ? JSON.stringify(value) : value;
          })
          .join(","),
      )
      .join("\n");

    const csvContent = headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageType}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0e1525]/90 backdrop-blur-md border-b border-indigo-900/30">
        <Header />
      </div>

      <main className="flex-1 mt-[72px] p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-xl ${config.bgColor}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      {config.title}
                    </h1>
                    <p className="text-gray-400">{config.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchRecords}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={filteredRecords.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Hash className="w-8 h-8 text-indigo-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-xl font-bold text-emerald-300">
                    {formatCurrency(stats.revenue)}
                  </p>
                </div>
                <IndianRupee className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Filtered</p>
                  <p className="text-2xl font-bold text-white">
                    {filteredRecords.length}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0e1525] border border-indigo-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 bg-[#0e1525] border border-indigo-900/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Records</option>
                  <option value="recent">Recent (Last 7 days)</option>
                  <option value="old">Older than 7 days</option>
                  {pageType === "deleted-vms" && (
                    <option value="manual">Manual Deletion</option>
                  )}
                  {pageType === "garbage-records" && (
                    <option value="timeout">Timeout Errors</option>
                  )}
                  {pageType === "users-overview" && (
                    <option value="active">Active Users</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-400">Loading records...</p>
                </div>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <div
                  className={`inline-block p-4 rounded-full mb-4 ${config.bgColor}`}
                >
                  {config.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Records Found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm
                    ? "No records match your search criteria"
                    : "No records available for this category"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-[#1a2337]">
                      <tr>
                        {config.columns.map((col, index) => (
                          <th
                            key={index}
                            className={`py-3 px-4 text-left text-gray-300 text-sm font-medium ${col.width}`}
                          >
                            {col.label}
                          </th>
                        ))}
                        <th className="py-3 px-4 text-left text-gray-300 text-sm font-medium w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record, index) => (
                        <tr
                          key={index}
                          className="border-t border-indigo-900/20 hover:bg-indigo-900/10 transition-colors group"
                        >
                          {config.columns.map((col, colIndex) => (
                            <td key={colIndex} className="py-3 px-4 align-top">
                              {renderCellContent(record, col)}
                            </td>
                          ))}

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-2">
                              {/* View Details – available for all pages */}
                              <button
                                onClick={() => {
                                  Swal.fire({
                                    title: `${
                                      pageType === "deleted-vms"
                                        ? "Deleted VM"
                                        : pageType === "garbage-records"
                                          ? "Failed Record"
                                          : "User"
                                    } Details`,
                                    html: `
            <pre class="text-xs bg-gray-900 p-4 rounded max-h-96 overflow-auto">
${JSON.stringify(record, null, 2)}
            </pre>
          `,
                                    width: "800px",
                                    confirmButtonText: "Close",
                                    background: "#1e2640",
                                    color: "#ffffff",
                                  });
                                }}
                                className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 rounded flex items-center gap-1 justify-center"
                              >
                                <Eye className="w-3 h-3" />
                                Details
                              </button>

                              {/* ✅ ADD VM BUTTON – USERS OVERVIEW ONLY */}
                              {pageType === "users-overview" && (
                                <button
                                  onClick={() => openManualVmModal(record)}
                                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-1 justify-center"
                                >
                                  <Server className="w-3 h-3" />
                                  Add VM
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-indigo-900/30">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {filteredRecords.length} of {records.length}{" "}
                      records
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-sm border border-indigo-900/50 rounded disabled:opacity-50">
                        Previous
                      </button>
                      <span className="text-sm">Page 1 of 1</span>
                      <button className="px-3 py-1 text-sm border border-indigo-900/50 rounded disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Additional Info Section */}
          {!loading && filteredRecords.length > 0 && (
            <div className="mt-6 bg-[#151c2f] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-medium text-gray-300">
                  Summary Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Data Type:</div>
                  <div className="text-white font-medium capitalize">
                    {pageType.replace("-", " ")}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Last Updated:</div>
                  <div className="text-white font-medium">
                    {new Date().toLocaleDateString()}{" "}
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Export Format:</div>
                  <div className="text-white font-medium">
                    CSV, JSON Available
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {pageType === "users-overview" && showVmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#1a2332] to-[#151c2f] w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-[#1a2332] to-[#151c2f]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Manual VM Import
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Importing VM for{" "}
                      <span className="text-emerald-400 font-medium">
                        {selectedUser?.email}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${form.serverId ? "bg-green-500" : "bg-gray-600"}`}
                        ></div>
                        <span className="text-xs text-gray-400">1. Server</span>
                      </div>
                      <div className="w-4 h-px bg-gray-700"></div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${form.planType ? "bg-green-500" : "bg-gray-600"}`}
                        ></div>
                        <span className="text-xs text-gray-400">
                          2. Plan Type
                        </span>
                      </div>
                      <div className="w-4 h-px bg-gray-700"></div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${form.cpuPriceId && form.ramPriceId && form.diskPriceId && form.bandwidthPriceId ? "bg-green-500" : "bg-gray-600"}`}
                        ></div>
                        <span className="text-xs text-gray-400">
                          3. Resources
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVmModal(false)}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="space-y-6">
                  {/* Step 1: Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Step 1: Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          VM Name
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="e.g., Ubuntu Server 22.04"
                          onChange={(e) =>
                            setForm({ ...form, vmName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          VMID
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          placeholder="e.g., 100"
                          onChange={(e) =>
                            setForm({ ...form, vmid: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Server Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                        />
                      </svg>
                      Step 2: Server Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Server
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
                          value={form.serverId}
                          onChange={(e) =>
                            setForm({ ...form, serverId: e.target.value })
                          }
                        >
                          <option
                            value=""
                            className="bg-[#0e1525] text-gray-400"
                          >
                            Select a server
                          </option>
                          {servers.length > 0 ? (
                            servers.map((s) => (
                              <option
                                key={s.id}
                                value={s.id}
                                className="bg-[#0e1525] text-white"
                              >
                                {s.name} ({s.location})
                              </option>
                            ))
                          ) : (
                            <option
                              value=""
                              disabled
                              className="bg-[#0e1525] text-gray-400"
                            >
                              Loading servers...
                            </option>
                          )}
                        </select>
                        <p className="text-xs text-gray-500">
                          {servers.length} servers available
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Storage Id
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
                          value={form.storageId}
                          onChange={(e) =>
                            setForm({ ...form, storageId: e.target.value })
                          }
                          disabled={
                            loadingStorage || storageOptions.length === 0
                          }
                        >
                          <option
                            value=""
                            className="bg-[#0e1525] text-gray-400"
                          >
                            {loadingStorage
                              ? "Loading storage..."
                              : "Select Storage"}
                          </option>
                          {storageOptions.length > 0 ? (
                            storageOptions.map((storage) => (
                              <option
                                key={storage.id || storage.storage}
                                value={storage.id || storage.storage}
                                className="bg-[#0e1525] text-white"
                              >
                                {storage.label ||
                                  storage.storage ||
                                  `${storage.id}`}
                                {storage.size &&
                                  ` (${formatBytes(storage.size)})`}
                                {storage.type && ` - ${storage.type}`}
                              </option>
                            ))
                          ) : (
                            <option
                              value=""
                              disabled
                              className="bg-[#0e1525] text-gray-400"
                            >
                              {form.serverId
                                ? storageOptions.length === 0
                                  ? "No storage available"
                                  : "Loading storage..."
                                : "Select server first"}
                            </option>
                          )}
                        </select>
                        <p className="text-xs text-gray-500">
                          {form.serverId
                            ? storageOptions.length > 0
                              ? `${storageOptions.length} storage option(s)`
                              : loadingStorage
                                ? "Loading..."
                                : "No storage found"
                            : "Select server to view storage"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          ISO Image
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
                          value={form.isoId}
                          onChange={(e) =>
                            setForm({ ...form, isoId: e.target.value })
                          }
                        >
                          <option
                            value=""
                            className="bg-[#0e1525] text-gray-400"
                          >
                            Select ISO (Optional)
                          </option>
                          {isos.length > 0 ? (
                            isos.map((iso) => (
                              <option
                                key={iso.id || iso.iso}
                                value={iso.id}
                                className="bg-[#0e1525] text-white"
                              >
                                {iso.iso}
                              </option>
                            ))
                          ) : (
                            <option
                              value=""
                              disabled
                              className="bg-[#0e1525] text-gray-400"
                            >
                              {form.serverId
                                ? isos.length === 0
                                  ? "No ISOs available for this server"
                                  : "Loading ISOs..."
                                : "Select a server first"}
                            </option>
                          )}
                        </select>
                        <p className="text-xs text-gray-500">
                          {form.serverId
                            ? isos.length > 0
                              ? `${isos.length} ISO(s) available`
                              : "No ISOs found"
                            : "Select server to view ISOs"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Plan Type Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Step 3: Select Plan Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Resource Type
                        </label>
                        <select
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none cursor-pointer"
                          value={form.planType}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              planType: e.target.value,
                              // Clear previously selected resources when plan type changes
                              cpuPriceId: "",
                              ramPriceId: "",
                              diskPriceId: "",
                              bandwidthPriceId: "",
                            })
                          }
                        >
                          <option
                            value=""
                            className="bg-[#0e1525] text-gray-400"
                          >
                            Select plan type
                          </option>
                          {planTypes.map((plan) => (
                            <option
                              key={plan.id}
                              value={plan.id}
                              className="bg-[#0e1525] text-white"
                            >
                              {plan.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500">
                          {form.planType
                            ? `Selected: ${form.planType.toLowerCase()} resources`
                            : "Choose between dedicated or shared resources"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Pricing Status
                        </label>
                        <div className="px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg">
                          {loadingPricing ? (
                            <div className="flex items-center gap-2 text-blue-400">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span className="text-sm">
                                Loading {form.planType.toLowerCase()} pricing...
                              </span>
                            </div>
                          ) : form.planType ? (
                            <div className="text-sm text-green-400">
                              ✓ {form.planType.toLowerCase()} pricing loaded
                              <div className="text-xs text-gray-400 mt-1">
                                CPU: {cpuOptions.length} plans | RAM:{" "}
                                {ramOptions.length} plans | Disk:{" "}
                                {diskOptions.length} plans | Bandwidth:{" "}
                                {bandwidthOptions.length} plans
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">
                              Select plan type to load pricing
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Resource Allocation (only show if plan type selected) */}
                  {form.planType && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Step 4: Resource Allocation (
                        {form.planType.toLowerCase()})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            CPU Plan
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition appearance-none cursor-pointer"
                            value={form.cpuPriceId}
                            onChange={(e) =>
                              setForm({ ...form, cpuPriceId: e.target.value })
                            }
                            disabled={loadingPricing || cpuOptions.length === 0}
                          >
                            <option
                              value=""
                              className="bg-[#0e1525] text-gray-400"
                            >
                              {loadingPricing
                                ? "Loading..."
                                : "Select CPU Plan"}
                            </option>
                            {cpuOptions.length > 0 ? (
                              cpuOptions.map((c) => (
                                <option
                                  key={c.id}
                                  value={c.id}
                                  className="bg-[#0e1525] text-white"
                                >
                                  {c.label}
                                </option>
                              ))
                            ) : (
                              <option
                                value=""
                                disabled
                                className="bg-[#0e1525] text-gray-400"
                              >
                                {loadingPricing
                                  ? "Loading..."
                                  : "No CPU plans available"}
                              </option>
                            )}
                          </select>
                          <p className="text-xs text-gray-500">
                            {cpuOptions.length} CPU plans
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            RAM Plan
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition appearance-none cursor-pointer"
                            value={form.ramPriceId}
                            onChange={(e) =>
                              setForm({ ...form, ramPriceId: e.target.value })
                            }
                            disabled={loadingPricing || ramOptions.length === 0}
                          >
                            <option
                              value=""
                              className="bg-[#0e1525] text-gray-400"
                            >
                              {loadingPricing
                                ? "Loading..."
                                : "Select RAM Plan"}
                            </option>
                            {ramOptions.length > 0 ? (
                              ramOptions.map((r) => (
                                <option
                                  key={r.id}
                                  value={r.id}
                                  className="bg-[#0e1525] text-white"
                                >
                                  {r.label}
                                </option>
                              ))
                            ) : (
                              <option
                                value=""
                                disabled
                                className="bg-[#0e1525] text-gray-400"
                              >
                                {loadingPricing
                                  ? "Loading..."
                                  : "No RAM plans available"}
                              </option>
                            )}
                          </select>
                          <p className="text-xs text-gray-500">
                            {ramOptions.length} RAM plans
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Disk Plan
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition appearance-none cursor-pointer"
                            value={form.diskPriceId}
                            onChange={(e) =>
                              setForm({ ...form, diskPriceId: e.target.value })
                            }
                            disabled={
                              loadingPricing || diskOptions.length === 0
                            }
                          >
                            <option
                              value=""
                              className="bg-[#0e1525] text-gray-400"
                            >
                              {loadingPricing
                                ? "Loading..."
                                : "Select Disk Plan"}
                            </option>
                            {diskOptions.length > 0 ? (
                              diskOptions.map((d) => (
                                <option
                                  key={d.id}
                                  value={d.id}
                                  className="bg-[#0e1525] text-white"
                                >
                                  {d.label}
                                </option>
                              ))
                            ) : (
                              <option
                                value=""
                                disabled
                                className="bg-[#0e1525] text-gray-400"
                              >
                                {loadingPricing
                                  ? "Loading..."
                                  : "No Disk plans available"}
                              </option>
                            )}
                          </select>
                          <p className="text-xs text-gray-500">
                            {diskOptions.length} Disk plans
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">
                            Bandwidth Plan
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition appearance-none cursor-pointer"
                            value={form.bandwidthPriceId}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                bandwidthPriceId: e.target.value,
                              })
                            }
                            disabled={
                              loadingPricing || bandwidthOptions.length === 0
                            }
                          >
                            <option
                              value=""
                              className="bg-[#0e1525] text-gray-400"
                            >
                              {loadingPricing
                                ? "Loading..."
                                : "Select Bandwidth Plan"}
                            </option>
                            {bandwidthOptions.length > 0 ? (
                              bandwidthOptions.map((b) => (
                                <option
                                  key={b.id}
                                  value={b.id}
                                  className="bg-[#0e1525] text-white"
                                >
                                  {b.label}
                                </option>
                              ))
                            ) : (
                              <option
                                value=""
                                disabled
                                className="bg-[#0e1525] text-gray-400"
                              >
                                {loadingPricing
                                  ? "Loading..."
                                  : "No Bandwidth plans available"}
                              </option>
                            )}
                          </select>
                          <p className="text-xs text-gray-500">
                            {bandwidthOptions.length} Bandwidth plans
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Network Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Step 5: Network Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* IP Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          IP Address
                        </label>
                        <input
                          value={form.ipAddress}
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg
                   text-white placeholder-gray-500 focus:outline-none
                   focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 192.168.1.100"
                          onChange={(e) =>
                            setForm({ ...form, ipAddress: e.target.value })
                          }
                        />
                      </div>

                      {/* MAC Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          MAC Address
                        </label>
                        <input
                          value={form.macAddress}
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg
      text-white placeholder-gray-500 focus:outline-none
      focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., BC:24:11:AA:BB:CC"
                          onChange={(e) =>
                            setForm({ ...form, macAddress: e.target.value })
                          }
                        />
                      </div>

                      {/* CIDR */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          CIDR
                        </label>
                        <input
                          value={form.cidr}
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg
                   text-white placeholder-gray-500 focus:outline-none
                   focus:ring-2 focus:ring-amber-500"
                          placeholder="/24"
                          onChange={(e) =>
                            setForm({ ...form, cidr: e.target.value })
                          }
                        />
                      </div>

                      {/* Gateway */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Gateway
                        </label>
                        <input
                          value={form.gateway}
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg
                   text-white placeholder-gray-500 focus:outline-none
                   focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 192.168.1.1"
                          onChange={(e) =>
                            setForm({ ...form, gateway: e.target.value })
                          }
                        />
                      </div>

                      {/* Subnet Mask */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Subnet Mask
                        </label>
                        <input
                          value={form.subnetMask}
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg
                   text-white placeholder-gray-500 focus:outline-none
                   focus:ring-2 focus:ring-amber-500"
                          placeholder="e.g., 255.255.255.0"
                          onChange={(e) =>
                            setForm({ ...form, subnetMask: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 6: Expiration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Step 6: Expiration Date
                    </h3>
                    <div className="w-full md:w-1/2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Expires At
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 bg-[#0e1525] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition [color-scheme:dark]"
                          onChange={(e) =>
                            setForm({ ...form, expiresAt: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-800 bg-gradient-to-r from-[#151c2f] to-[#1a2332]">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-400">
                    Required fields: VM Name, VMID, Server, Plan Type, and all
                    resource plans
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowVmModal(false)}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors flex-1 sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitManualVm}
                      disabled={
                        !form.vmName ||
                        !form.vmid ||
                        !form.serverId ||
                        !form.planType ||
                        !form.cpuPriceId ||
                        !form.ramPriceId ||
                        !form.diskPriceId ||
                        !form.bandwidthPriceId ||
                        !form.storageId
                      }
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg font-medium shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Import VM
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
