// SubUsers.jsx - Complete updated file with correct API integration
import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Pagination from "../../components/Pagination";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Hash,
  FileText,
  Server,
  IndianRupee,
  Globe,
  Clock,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const GET_USERS_API = `${BASE_URL}/api/reseller/admin/users`;
const GET_USER_COUNT_API = `${BASE_URL}/api/reseller/admin/users/count`;
const GET_USER_DETAIL_API = `${BASE_URL}/api/reseller/admin/users`;

const SubUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState(null);
  const [unassignedVMs, setUnassignedVMs] = useState([]);
  const [selectedVmId, setSelectedVmId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const ASSIGN_VM_API = `${BASE_URL}/api/reseller/admin/vms/assign`;
  const UNASSIGN_VM_API = `${BASE_URL}/api/reseller/admin/vms/available`;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    locked: 0,
  });

  useEffect(() => {
    fetchUserCount();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, size, searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const fetchUserCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Unauthorized");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (
        decoded.roles !== "ROLE_RESELLER_USER" &&
        decoded.roles !== "ROLE_RESELLER_ADMIN"
      ) {
        toast.error("Access denied");
        return;
      }

      const response = await fetch(GET_USER_COUNT_API, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStats((prev) => ({ ...prev, total: data.totalUsers || 0 }));
      }
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Unauthorized");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (
        decoded.roles !== "ROLE_RESELLER_USER" &&
        decoded.roles !== "ROLE_RESELLER_ADMIN"
      ) {
        toast.error("Access denied");
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("size", size);
      params.append("sortBy", "createdAt");
      params.append("direction", "desc");

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`${GET_USERS_API}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Transform the API response to our expected format
        const transformedUsers = (data.users || []).map((user) => ({
          id: user.userId,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          username: user.email?.split("@")[0] || "", // Generate username from email if not provided
          status: "ACTIVE", // Default status since not provided in API
          isLocked: false, // Default since not provided
          createdAt: user.createdAt,
          stats: {
            totalVMs: user.assignedVmCount || 0,
            activeVMs: user.assignedVmCount || 0, // Assuming all assigned VMs are active
          },
        }));

        setUsers(transformedUsers);
        setTotalItems(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);

        // Update stats with active users count (since we don't have status from API)
        setStats((prev) => ({
          ...prev,
          active: transformedUsers.length, // All fetched users are considered active
          pending: 0,
          locked: 0,
        }));
      } else {
        toast.error(data.message || "Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Something went wrong");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedVMs = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(UNASSIGN_VM_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUnassignedVMs(data.availableVms || []);
      } else {
        toast.error(data.message || "Failed to fetch VMs");
      }
    } catch (error) {
      toast.error("Error fetching VMs");
    }
  };

  const handleAssignVmClick = (user) => {
    setAssignUser(user);
    setShowAssignModal(true);
    fetchUnassignedVMs();
  };

  const handleAssignVM = async () => {
    if (!selectedVmId) {
      toast.error("Please select a VM");
      return;
    }

    const token = localStorage.getItem("token");
    setAssignLoading(true);

    try {
      const response = await fetch(ASSIGN_VM_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: assignUser.id,
          vmId: Number(selectedVmId),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("VM assigned successfully");
        setShowAssignModal(false);
        setSelectedVmId("");
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to assign VM");
      }
    } catch (error) {
      toast.error("Error assigning VM");
    } finally {
      setAssignLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoadingDetails(true);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${GET_USER_DETAIL_API}/${userId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Transform the detailed API response
        const detailedUser = {
          id: data.userProfile?.userId,
          firstName: data.userProfile?.firstName || "",
          lastName: data.userProfile?.lastName || "",
          email: data.userProfile?.email || "",
          username: data.userProfile?.email?.split("@")[0] || "",
          createdAt: data.userProfile?.registeredAt,
          billingAddress: data.billingDetails
            ? {
                companyName: data.billingDetails.companyName || "",
                streetAddress: data.billingDetails.streetAddress || "",
                city: data.billingDetails.city || "",
                state: data.billingDetails.state || "",
                country: data.billingDetails.country || "",
                postalCode: data.billingDetails.postcode || "",
                phoneNumber: data.billingDetails.phoneNumber || "",
              }
            : null,
          vms: (data.assignedVms || []).map((vm) => ({
            id: vm.vmid,
            name: vm.vmName,
            ipAddress: vm.vmIp,
            assignedDate: vm.assignedDate,
          })),
          stats: {
            totalVMs: data.assignedVms?.length || 0,
            activeVMs: data.assignedVms?.length || 0,
          },
        };

        setUserDetails(detailedUser);
      } else if (response.status === 403) {
        toast.error("You don't have permission to view this user's details");
      } else if (response.status === 404) {
        toast.error("User not found");
      } else {
        toast.error(data.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Something went wrong");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
    setShowUserDetails(true);
  };

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

  const getStatusBadge = (status, isLocked) => {
    if (isLocked) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          LOCKED
        </span>
      );
    }

    // Since we don't have status from API, show as active by default
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        ACTIVE
      </span>
    );
  };

  // Dynamically generate columns based on available data
  const getColumns = () => {
    if (users.length === 0) return [];

    const columns = [
      { key: "id", label: "ID", width: "w-20" },
      { key: "name", label: "User", width: "w-48" },
      { key: "email", label: "Email", width: "w-48" },
      { key: "username", label: "Username", width: "w-32" },
      { key: "status", label: "Status", width: "w-24" },
      { key: "createdAt", label: "Created", width: "w-32" },
      { key: "vms", label: "VMs", width: "w-24" },
    ];

    return columns;
  };

  const columns = getColumns();

  const renderCellContent = (user, columnKey) => {
    switch (columnKey) {
      case "id":
        return (
          <code className="bg-indigo-400/10 text-indigo-300 px-2 py-1 rounded text-xs font-mono">
            #{user.id}
          </code>
        );

      case "name":
        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-400/10 rounded-lg">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-400">@{user.username}</div>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div className="text-sm truncate max-w-[200px]">{user.email}</div>
          </div>
        );

      case "username":
        return (
          <div className="text-sm font-mono text-gray-300">
            @{user.username}
          </div>
        );

      case "status":
        return getStatusBadge(user.status, user.isLocked);

      case "createdAt":
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <div className="text-xs">{formatDate(user.createdAt)}</div>
          </div>
        );

      case "vms":
        return (
          <div>
            <div className="text-sm font-medium">
              {user.stats?.totalVMs || 0}
            </div>
          </div>
        );

      default:
        return String(user[columnKey] || "N/A");
    }
  };

  const handleExportCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = users
      .map((user) =>
        columns
          .map((col) => {
            const value = user[col.key];
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
    a.download = `sub-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-[#0e1525] text-gray-100 min-h-screen">
      <div>
        <Header />
      </div>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-400/10">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Users</h1>
                    <p className="text-gray-400">
                      Manage and monitor all sub-users within your reseller
                      account
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={fetchUsers}
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
                  disabled={users.length === 0}
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
                  <p className="text-gray-400 text-sm">Total Users</p>
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
                    {users.length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#151c2f] to-[#1e2640] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">This Page</p>
                  <p className="text-2xl font-bold text-white">
                    {users.length}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-purple-400" />
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
                  placeholder="Search users by name or email..."
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
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-400">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-blue-400/10 mb-4">
                  <User className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm
                    ? "No users match your search criteria"
                    : "No sub-users available in your account"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="bg-[#1a2337]">
                      <tr>
                        {columns.map((col, index) => (
                          <th
                            key={index}
                            className={`py-3 px-4 text-left text-gray-300 text-sm font-medium ${col.width}`}
                          >
                            {col.label}
                          </th>
                        ))}
                        <th className="py-3 px-4 text-left text-gray-300 text-sm font-medium w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-t border-indigo-900/20 hover:bg-indigo-900/10 transition-colors"
                        >
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="py-3 px-4 align-middle"
                            >
                              {renderCellContent(user, col.key)}
                            </td>
                          ))}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                              >
                                <Eye className="w-3 h-3" />
                                Details
                              </button>

                              <button
                                onClick={() => handleAssignVmClick(user)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                              >
                                <Server className="w-3 h-3" />
                                Assign VM
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 0 && (
                  <Pagination
                    currentPage={page + 1} // convert 0-based → 1-based
                    totalPages={totalPages}
                    totalItems={totalItems}
                    showingFrom={page * size + 1}
                    showingTo={Math.min((page + 1) * size, totalItems)}
                    onPageChange={(newPage) => {
                      setPage(newPage - 1); // convert 1-based → 0-based
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Summary Info */}
          {!loading && users.length > 0 && (
            <div className="mt-6 bg-[#151c2f] border border-indigo-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-medium text-gray-300">
                  Summary Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Total Users:</div>
                  <div className="text-white font-medium">{stats.total}</div>
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
                  <div className="text-white font-medium">CSV Available</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#151c2f] border-b border-indigo-900/30 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-400/10 rounded-lg">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">User Details</h2>
                  <p className="text-sm text-gray-400">
                    {loadingDetails
                      ? "Loading..."
                      : `Complete information for ${userDetails?.firstName} ${userDetails?.lastName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setUserDetails(null);
                }}
                className="p-2 hover:bg-indigo-600/20 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                    <p className="text-gray-400">Loading user details...</p>
                  </div>
                </div>
              ) : userDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-[#1a2337] rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          Full Name
                        </div>
                        <div className="text-sm font-medium">
                          {userDetails.firstName} {userDetails.lastName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          Username
                        </div>
                        <div className="text-sm font-medium">
                          @{userDetails.username}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Email</div>
                        <div className="text-sm font-medium">
                          {userDetails.email}
                        </div>
                      </div>
                      {userDetails.billingAddress?.phoneNumber && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">
                            Phone
                          </div>
                          <div className="text-sm font-medium">
                            {userDetails.billingAddress.phoneNumber}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Status</div>
                        <div>{getStatusBadge("ACTIVE", false)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">
                          User ID
                        </div>
                        <div className="text-sm font-medium">
                          #{userDetails.id}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Timeline */}
                  {userDetails.createdAt && (
                    <div className="bg-[#1a2337] rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        Account Timeline
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">
                            Registered At
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(userDetails.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Address */}
                  {userDetails.billingAddress && (
                    <div className="bg-[#1a2337] rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-400" />
                        Billing Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userDetails.billingAddress.companyName && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Company
                            </div>
                            <div className="text-sm font-medium">
                              {userDetails.billingAddress.companyName}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-gray-400 mb-1">
                            Street Address
                          </div>
                          <div className="text-sm font-medium">
                            {userDetails.billingAddress.streetAddress}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">
                            City/State
                          </div>
                          <div className="text-sm font-medium">
                            {userDetails.billingAddress.city},{" "}
                            {userDetails.billingAddress.state}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">
                            Country/Postal Code
                          </div>
                          <div className="text-sm font-medium">
                            {userDetails.billingAddress.country} -{" "}
                            {userDetails.billingAddress.postalCode}
                          </div>
                        </div>
                        {userDetails.billingAddress.phoneNumber && (
                          <div>
                            <div className="text-xs text-gray-400 mb-1">
                              Phone
                            </div>
                            <div className="text-sm font-medium">
                              {userDetails.billingAddress.phoneNumber}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assigned VMs */}
                  {userDetails.vms && userDetails.vms.length > 0 && (
                    <div className="bg-[#1a2337] rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Server className="w-4 h-4 text-purple-400" />
                        Assigned Virtual Machines ({userDetails.vms.length})
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#0e1525]">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs text-gray-400">
                                VM ID
                              </th>
                              <th className="px-3 py-2 text-left text-xs text-gray-400">
                                Name
                              </th>
                              <th className="px-3 py-2 text-left text-xs text-gray-400">
                                IP Address
                              </th>
                              <th className="px-3 py-2 text-left text-xs text-gray-400">
                                Assigned Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetails.vms.map((vm) => (
                              <tr
                                key={vm.id}
                                className="border-t border-indigo-900/20"
                              >
                                <td className="px-3 py-2 text-sm">#{vm.id}</td>
                                <td className="px-3 py-2 text-sm">{vm.name}</td>
                                <td className="px-3 py-2 text-sm font-mono">
                                  {vm.ipAddress}
                                </td>
                                <td className="px-3 py-2 text-sm">
                                  {formatDate(vm.assignedDate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No details available for this user
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[#151c2f] border-t border-indigo-900/30 p-6 flex justify-end">
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setUserDetails(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#151c2f] rounded-xl w-full max-w-md p-6 border border-indigo-900/30">
            <h2 className="text-lg font-bold mb-4">
              Assign VM to {assignUser?.firstName}
            </h2>

            <div className="mb-4">
              <label className="block text-sm mb-2 text-gray-400">
                Select VM
              </label>

              <select
                value={selectedVmId}
                onChange={(e) => setSelectedVmId(e.target.value)}
                disabled={unassignedVMs.length === 0}
                className="w-full px-3 py-2 bg-[#0e1525] border border-indigo-900/50 rounded-lg"
              >
                {unassignedVMs.length === 0 ? (
                  <option>No VMs Available</option>
                ) : (
                  <>
                    <option value="">Select VM</option>
                    {unassignedVMs.map((vm) => (
                      <option key={vm.id} value={vm.id}>
                        {vm.name} (IP: {vm.ipAddress})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignVM}
                disabled={assignLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                {assignLoading ? "Assigning..." : "Assign VM"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default SubUsers;
