import React, { useEffect, useState } from "react";
import Header from "../components/user/Header";
import {
  Tag,
  Copy,
  Calendar,
  IndianRupee,
  Percent,
  Check,
  Sparkles,
  Gift,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Credits() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${BASE_URL}/api/coupons`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch coupons");

        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error("Unable to load coupons");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [BASE_URL]);

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success("Coupon code copied to clipboard!");

    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getCouponColor = (type) => {
    if (type === "PERCENTAGE") return "from-purple-500 to-pink-500";
    if (type === "FIXED" && coupons.value > 500)
      return "from-orange-500 to-red-500";
    return "from-indigo-500 to-blue-500";
  };

  const getCouponIcon = (type, value) => {
    if (type === "PERCENTAGE" && value >= 50)
      return <Sparkles className="w-5 h-5" />;
    if (type === "FIXED" && value > 500) return <Gift className="w-5 h-5" />;
    return <Tag className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1525] via-[#0c1220] to-[#090e1a] text-gray-100">
      <Header />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "linear-gradient(135deg, #151c2f 0%, #1e293b 100%)",
            color: "#fff",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          },
        }}
      />

      <main className="p-4 sm:p-6 max-w-full mx-auto">
        {/* Animated Header */}
        <div className="mb-8 sm:mb-10 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20"></div>
          <div className="relative bg-[#151c2f]/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Tag className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                My Coupons
              </h1>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-indigo-300">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span>{coupons.length} active coupons</span>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-[#151c2f]/50 rounded-xl p-5 border border-gray-800 animate-pulse"
              >
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-24 bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
                </div>
                <div className="h-4 w-full bg-gray-700 rounded mb-3"></div>
                <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && coupons.length === 0 && (
          <div className="max-w-md mx-auto text-center py-16 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl rounded-full"></div>
              <div className="relative p-6 bg-gradient-to-br from-[#151c2f] to-[#1a2238] rounded-2xl border border-gray-800">
                <Tag className="w-16 h-16 mx-auto text-indigo-400/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No coupons available
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  New coupons appear here as they become available
                </p>
                <button
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coupons Grid */}
        {!loading && coupons.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon, idx) => {
              const isExpiring =
                coupon.validUntil &&
                new Date(coupon.validUntil) <
                  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

              return (
                <div key={idx} className="group relative">
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>

                  <div
                    className="relative bg-gradient-to-br from-[#151c2f] to-[#1a2238]
                rounded-xl p-5 border border-gray-800/50
                hover:border-indigo-500/30 transition-all duration-300
                flex flex-col h-full min-h-[200px]"
                  >
                    {/* Premium badge */}
                    {coupon.type === "FIXED" && coupon.value > 500 && (
                      <div className="absolute -top-2 -right-2">
                        <div className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold rounded-lg flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span>PREMIUM</span>
                        </div>
                      </div>
                    )}

                    {/* Code with gradient */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${getCouponColor(coupon.type)}`}
                        >
                          {getCouponIcon(coupon.type, coupon.value)}
                        </div>
                        <div>
                          <div className="font-mono text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {coupon.code}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">CODE</div>
                        </div>
                      </div>

                      <button
                        onClick={() => copyCode(coupon.code, idx)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          copiedIndex === idx
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300"
                        }`}
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex-1">
                      {/* Description */}
                      {coupon.description && (
                        <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                          {coupon.description}
                        </p>
                      )}

                      {/* Discount Value */}
                      <div className="mb-4">
                        <div
                          className={`text-2xl font-bold bg-gradient-to-r ${getCouponColor(coupon.type)} bg-clip-text text-transparent`}
                        >
                          {coupon.type === "PERCENTAGE"
                            ? `${coupon.value}% OFF`
                            : `₹${coupon.value} OFF`}
                        </div>
                        {coupon.type === "PERCENTAGE" && coupon.value >= 50 && (
                          <div className="text-xs text-pink-400 flex items-center gap-1 mt-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Mega Discount!</span>
                          </div>
                        )}
                      </div>

                      {/* Conditions */}
                      <div className="space-y-2 mb-4">
                        {coupon.minOrderAmount && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Min. Order</span>
                            <span className="font-medium">
                              ₹{coupon.minOrderAmount}
                            </span>
                          </div>
                        )}

                        {coupon.maxDiscount && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Max Discount</span>
                            <span className="font-medium">
                              ₹{coupon.maxDiscount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="mt-auto">
                      <div className="pt-4 border-t border-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {coupon.validUntil ? (
                              <div>
                                <div className="text-gray-400">Valid until</div>
                                <div
                                  className={`font-medium ${isExpiring ? "text-orange-400" : "text-gray-300"}`}
                                >
                                  {formatDate(coupon.validUntil)}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-gray-400">Expiry</div>
                                <div className="font-medium text-green-400">
                                  No expiry
                                </div>
                              </div>
                            )}
                          </div>

                          {isExpiring && (
                            <div className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-lg border border-orange-500/30">
                              Expiring soon
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Usage indicator */}
                      {coupon.usageLimit && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Usage</span>
                            <span>
                              {coupon.usedCount || 0}/{coupon.usageLimit}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{
                                width: `${((coupon.usedCount || 0) / coupon.usageLimit) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Text */}
        {!loading && coupons.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              Click the copy icon to copy coupon codes. Paste them during
              checkout.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
