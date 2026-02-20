import React, { useState, useEffect } from "react";
import Header from "../../../components/admin/adminHeader";
import Footer from "../../../components/user/Footer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Ticket,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  User,
  Wallet,
} from "lucide-react";

const CouponManagementPage = () => {
  // State for overview stats
  const [stats, setStats] = useState({
    totalActive: 0,
    global: 0,
    userSpecific: 0,
    expired: 0,
  });

  // State for form
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrderAmount: "",
    assignedUserId: null,
    usageLimitType: "UNLIMITED",
    perUserLimit: "",
    validUntil: "",
    isGlobalVisible: true,
  });

  // State for coupons table
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showUsageLogs, setShowUsageLogs] = useState(false);

  const [page, setPage] = useState(0); // 0-based
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const BASE_API_URL = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, [page, size, search]);

  useEffect(() => {
    calculateStats();
  }, [coupons]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_API_URL}/api/admin/coupons?page=${page}&size=${size}&search=${search || ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      const data = await response.json();

      setCoupons(data.coupons || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // This would come from API in real implementation
    const calculatedStats = {
      totalActive: coupons.filter((c) => c.active).length,
      global: coupons.filter((c) => !c.assignedUserId).length,
      userSpecific: coupons.filter((c) => c.assignedUserId).length,
      expired: coupons.filter((c) => {
        if (!c.validUntil) return false;
        return new Date(c.validUntil) < new Date();
      }).length,
    };
    setStats(calculatedStats);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.usageLimitType === "FIXED_PER_USER" &&
      !formData.perUserLimit
    ) {
      alert("Per user limit is required");
      return;
    }

    const payload = {
      code: formData.code,
      type: formData.type,
      value: Number(formData.value),
      minOrderAmount: formData.minOrderAmount
        ? Number(formData.minOrderAmount)
        : null,
      assignedUserId:
        formData.assignedUserId === null
          ? null
          : Number(formData.assignedUserId),
      usageLimitType: formData.usageLimitType,
      perUserLimit:
        formData.usageLimitType === "FIXED_PER_USER"
          ? Number(formData.perUserLimit)
          : null,
      validUntil: formData.validUntil
        ? new Date(formData.validUntil).toISOString().slice(0, 19)
        : null,

      isGlobalVisible:
        formData.assignedUserId === null ? formData.isGlobalVisible : false,
    };

    try {
      const response = await fetch(`${BASE_API_URL}/api/admin/coupons/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Coupon created successfully!");
        setFormData({
          code: "",
          type: "PERCENTAGE",
          value: "",
          minOrderAmount: "",
          assignedUserId: null,
          usageLimitType: "UNLIMITED",
          perUserLimit: "",
          validUntil: "",
          globalVisible: true,
        });
        fetchCoupons();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      alert("Failed to create coupon");
    }
  };

  const handleFormChange = (field, value) => {
    let updatedValue = value;

    if (field === "code") {
      updatedValue = value.toUpperCase();
    }

    if (field === "usageLimitType" && value !== "FIXED_PER_USER") {
      setFormData((prev) => ({
        ...prev,
        usageLimitType: value,
        perUserLimit: "",
      }));
      return;
    }

    if (field === "assignedUserId") {
      setFormData((prev) => ({
        ...prev,
        assignedUserId: value,
        isGlobalVisible: value === null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: updatedValue,
    }));
  };

  const toggleCouponStatus = async (couponId, currentStatus) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "disable" : "enable"} this coupon?`,
      )
    )
      return;

    try {
      const response = await fetch(
        `${BASE_API_URL}/api/admin/coupons/${couponId}/toggle`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Error toggling coupon status:", error);
    }
  };

  const formatValue = (type, value) => {
    switch (type) {
      case "PERCENTAGE":
        return `${value}%`;
      case "FLAT":
        return `₹${value}`;
      case "OVERRIDE":
        return `₹${value}`;
      default:
        return value;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "FLAT":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "OVERRIDE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (coupon) => {
    if (!coupon.active) return "bg-red-500/20 text-red-400 border-red-500/30";
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  const getUsageLimitText = (coupon) => {
    switch (coupon.usageLimitType) {
      case "UNLIMITED":
        return "Unlimited";
      case "ONCE_PER_USER":
        return "Once/user";
      case "FIXED_PER_USER":
        return `${coupon.perUserLimit}x/user`;
      default:
        return coupon.usageLimitType;
    }
  };

  return (
    <div>
      <div>
        <Header />
      </div>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/settings")}
                className="group flex items-center justify-center w-10 h-10 rounded-xl hover:bg-emerald-500/10 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              </button>

              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <Wallet className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Coupon Management
                </h1>
                <p className="text-gray-400 mt-1">
                  Create and manage promotional codes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1️⃣ Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Active Coupons</p>
                <p className="text-2xl font-bold mt-2">{stats.totalActive}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-green-400 text-sm">Active Coupons</p>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Global Coupons</p>
                <p className="text-2xl font-bold mt-2">{stats.global}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Visible to all users</p>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">User-Specific</p>
                <p className="text-2xl font-bold mt-2">{stats.userSpecific}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Private offers</p>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Expired/Disabled</p>
                <p className="text-2xl font-bold mt-2">{stats.expired}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">No longer active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2️⃣ Create Coupon Form */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Create New Coupon
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleFormChange("code", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SAVE50 (auto-uppercased)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique code for customers to enter
                </p>
              </div>

              {/* Coupon Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coupon Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="OVERRIDE">Override Price (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discount Value *
                    <span className="ml-2 text-gray-500">
                      {formData.type === "PERCENTAGE" ? "%" : "₹"}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleFormChange("value", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={formData.type === "PERCENTAGE" ? "20" : "500"}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {/* Minimum Order Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Order Amount
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      handleFormChange("minOrderAmount", e.target.value)
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1000"
                    step="0.01"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Coupon will apply only if cart total ≥ this amount
                  </p>
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Audience
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.assignedUserId === null}
                      onChange={() => handleFormChange("assignedUserId", null)}
                      className="text-blue-500"
                    />
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" /> Global (All Users)
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.assignedUserId !== null}
                      onChange={() => handleFormChange("assignedUserId", "")}
                      className="text-blue-500"
                    />
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" /> Assigned User
                    </span>
                  </label>
                </div>
                {formData.assignedUserId !== null && (
                  <input
                    type="number"
                    value={formData.assignedUserId}
                    onChange={(e) =>
                      handleFormChange("assignedUserId", e.target.value)
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="User ID (e.g., 55)"
                  />
                )}
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usage Limit *
                </label>
                <select
                  value={formData.usageLimitType}
                  onChange={(e) =>
                    handleFormChange("usageLimitType", e.target.value)
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="UNLIMITED">Unlimited Uses</option>
                  <option value="ONCE_PER_USER">Once Per User</option>
                  <option value="FIXED_PER_USER">Fixed Per User</option>
                </select>
                {formData.usageLimitType === "FIXED_PER_USER" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Per User Limit *
                    </label>
                    <input
                      type="number"
                      value={formData.perUserLimit}
                      onChange={(e) =>
                        handleFormChange("perUserLimit", e.target.value)
                      }
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 5"
                      min="1"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Validity & Visibility */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) =>
                      handleFormChange("validUntil", e.target.value)
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visibility
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isGlobalVisible}
                      onChange={(e) =>
                        handleFormChange("isGlobalVisible", e.target.checked)
                      }
                      disabled={!!formData.assignedUserId}
                      className="rounded text-blue-500"
                    />
                    <span className="text-gray-300">
                      Show in Public Offers{" "}
                      {formData.assignedUserId &&
                        "(Auto-disabled for private coupons)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Create Coupon
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      code: "",
                      type: "PERCENTAGE",
                      value: "",
                      minOrderAmount: "",
                      assignedUserId: null,
                      usageLimitType: "UNLIMITED",
                      perUserLimit: "",
                      validUntil: "",
                      globalVisible: true,
                    })
                  }
                  className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* 3️⃣ Coupons Table */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All Coupons</h2>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by coupon code"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0); // 🔥 reset pagination on new search
                    }}
                    className="max-w-sm pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-600 rounded-lg flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3 px-2">Code</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Value</th>
                    <th className="pb-3 px-2">Scope</th>
                    <th className="pb-3 px-2">Usage</th>
                    <th className="pb-3 px-2">Expiry</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Min Order</th>
                    <th className="pb-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-gray-800 hover:bg-gray-800/30"
                    >
                      <td className="py-4 px-2 font-mono font-bold">
                        {coupon.code}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-2 py-1 rounded-full border text-xs ${getTypeColor(coupon.type)}`}
                        >
                          {coupon.type}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-bold">
                        {formatValue(coupon.type, coupon.value)}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-2 py-1 rounded-full border text-xs ${coupon.assignedUserId ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}
                        >
                          {coupon.assignedUserId
                            ? `User #${coupon.assignedUserId}`
                            : "Global"}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="px-2 py-1 bg-gray-700/50 rounded text-xs">
                          {getUsageLimitText(coupon)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {coupon.validUntil ? (
                          new Date(coupon.validUntil).toLocaleDateString()
                        ) : (
                          <span className="text-gray-500">∞</span>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-2 py-1 rounded-full border text-xs ${getStatusColor(coupon)}`}
                        >
                          {!coupon.active
                            ? "Disabled"
                            : coupon.validUntil &&
                                new Date(coupon.validUntil) < new Date()
                              ? "Expired"
                              : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {coupon.minOrderAmount
                          ? `₹${coupon.minOrderAmount}`
                          : "—"}
                      </td>

                      <td className="py-4 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              toggleCouponStatus(coupon.id, coupon.active)
                            }
                            className="p-1.5 hover:bg-gray-700 rounded"
                            title={coupon.active ? "Disable" : "Enable"}
                          >
                            {coupon.active ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-400">
                Showing {page * size + 1}–
                {Math.min((page + 1) * size, totalItems)} of {totalItems}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="px-3 py-1 text-sm">
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {coupons.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No coupons found. Create your first coupon!
              </div>
            )}
          </div>
        </div>

        {/* 4️⃣ & 5️⃣ - Coupon Details & Usage Logs Modal */}
        {selectedCoupon && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="flex-shrink-0 p-6 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">
                    {showUsageLogs ? "📜 Usage Logs" : "👁️ Coupon Details"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Code: {selectedCoupon.code}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUsageLogs(!showUsageLogs)}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-sm"
                  >
                    {showUsageLogs ? "View Details" : "View Logs"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCoupon(null);
                      setShowUsageLogs(false);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6">
                {showUsageLogs ? (
                  // Usage Logs View
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900/50 rounded-xl">
                      <h4 className="font-bold mb-3">Usage Statistics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-400">Total Uses</p>
                          <p className="text-2xl font-bold">42</p>
                        </div>
                        <div className="p-3 bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-400">Unique Users</p>
                          <p className="text-2xl font-bold">18</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold mb-3">Recent Usage</h4>
                      <div className="space-y-2">
                        {/* Sample usage logs - would come from API */}
                        {[1, 2, 3].map((log) => (
                          <div
                            key={log}
                            className="p-3 bg-gray-900/30 rounded-lg border border-gray-800"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  User #{selectedCoupon.assignedUserId || "123"}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Order #ORD-2024-00{log}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-400">
                                  -₹{(selectedCoupon.value * log).toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-400">
                                  2024-01-{10 + log} 14:30
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Coupon Details View
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <p className="text-sm text-gray-400">Coupon Type</p>
                        <p className="text-lg font-bold mt-1">
                          <span
                            className={`px-2 py-1 rounded-full border text-xs ${getTypeColor(selectedCoupon.type)}`}
                          >
                            {selectedCoupon.type}
                          </span>
                        </p>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-xl">
                        <p className="text-sm text-gray-400">Discount Value</p>
                        <p className="text-2xl font-bold mt-1">
                          {formatValue(
                            selectedCoupon.type,
                            selectedCoupon.value,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-xl">
                      <h4 className="font-bold mb-3">Scope & Limits</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">
                            Target Audience:
                          </span>
                          <span className="font-medium">
                            {selectedCoupon.assignedUserId
                              ? `User #${selectedCoupon.assignedUserId}`
                              : "All Users"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Usage Limit:</span>
                          <span className="font-medium">
                            {getUsageLimitText(selectedCoupon)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Visibility:</span>
                          <span className="font-medium">
                            {selectedCoupon.isGlobalVisible
                              ? "Public Offer"
                              : "Private"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-900/50 rounded-xl">
                      <h4 className="font-bold mb-3">Validity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span className="font-medium">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expires:</span>
                          <span className="font-medium">
                            {selectedCoupon.validUntil
                              ? new Date(
                                  selectedCoupon.validUntil,
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span
                            className={`px-2 py-1 rounded-full border text-xs ${getStatusColor(selectedCoupon)}`}
                          >
                            {!selectedCoupon.active
                              ? "Disabled"
                              : selectedCoupon.validUntil &&
                                  new Date(selectedCoupon.validUntil) <
                                    new Date()
                                ? "Expired"
                                : "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <h4 className="font-bold mb-3">API Parameters</h4>
                      <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(
                          {
                            code: selectedCoupon.code,
                            type: selectedCoupon.type,
                            value: selectedCoupon.value,
                            minOrderAmount: selectedCoupon.minOrderAmount,
                            assignedUserId: selectedCoupon.assignedUserId,
                            usageLimitType: selectedCoupon.usageLimitType,
                            perUserLimit: selectedCoupon.perUserLimit,
                            validUntil: selectedCoupon.validUntil,
                            globalVisible: selectedCoupon.globalVisible,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 p-4 border-t border-gray-700">
                <div className="flex justify-between">
                  <button
                    onClick={() =>
                      toggleCouponStatus(
                        selectedCoupon.id,
                        selectedCoupon.active,
                      )
                    }
                    className={`px-4 py-2 rounded-lg font-medium ${selectedCoupon.active ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}
                  >
                    {selectedCoupon.active
                      ? "🚫 Disable Coupon"
                      : "✅ Enable Coupon"}
                  </button>
                  <button
                    onClick={() => {
                      // Copy coupon code to clipboard
                      navigator.clipboard.writeText(selectedCoupon.code);
                      alert("Copied to clipboard!");
                    }}
                    className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default CouponManagementPage;
