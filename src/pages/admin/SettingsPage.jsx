import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/admin/adminHeader";
import Footer from "../../components/user/Footer";
import {
  Search,
  Settings,
  Package,
  Layers,
  Clock,
  Server,
  Percent,
  Shield,
  Sliders,
  Puzzle,
  Box,
  Database,
  Mail,
  CreditCard,
  Building2,
  User,
  Trash,
  Globe,
  Wifi,
  Lock,
  Key,
  Users,
  ShieldAlert,
  BarChart,
  BookOpen,
  HelpCircle,
  FileText,
  Zap,
  Award,
  Gift,
  TrendingUp,
  DollarSign,
  Cloud,
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  Megaphone,
  RefreshCw,
  ChevronDown,
  Link,
  Share2,
  Code,
  Terminal,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminSettingsDashboard() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({});

  const categories = [
    "All",
    "System",
    "Apps & Integrations",
    "User Management",
    "Products & Services",
    "Billing & Payments",
    "Support",
    "API & Security",
    "Reports & Analytics",
  ];

  // Enhanced settings cards with redirect URLs
  const settingsCards = [
    // System Settings
    {
      title: "General Settings",
      desc: "Company details, lifecycle logic, and expiration policies",
      icon: Building2,
      category: "System",
      url: "/admin/settings/general",
      color: "from-blue-500 to-indigo-500",
      stats: "Last updated 2 days ago",
    },
    {
      title: "Mail Settings",
      desc: "SMTP configuration and email server credentials",
      icon: Mail,
      category: "System",
      url: "/admin/settings/mail",
      color: "from-green-500 to-emerald-500",
      stats: "SMTP configured",
    },
    {
      title: "Payment Gateways",
      desc: "Configure Cashfree, Razorpay, and Stripe integrations",
      icon: CreditCard,
      category: "Billing & Payments",
      url: "/admin/settings/payment-gateways",
      color: "from-purple-500 to-pink-500",
      stats: "3 gateways available",
    },
    {
      title: "Users",
      desc: "Manage user accounts, roles, access control, and activity monitoring",
      icon: User,
      category: "User Management",
      url: "/admin/settings/users-overview",
      color: "from-blue-600 to-cyan-500",
      stats: "Manage all users",
    },
    {
      title: "Deleted VMs",
      desc: "View and manage permanently or recently deleted virtual machines",
      icon: Trash,
      category: "Products & Services",
      url: "/admin/settings/deleted-vms",
      color: "from-red-600 to-rose-500",
      stats: "Removed Virtual Machines",
    },
    {
      title: "Garbage Records",
      desc: "Identify and clean orphaned, failed, or inconsistent system records",
      icon: HardDrive,
      category: "Products & Services",
      url: "/admin/settings/garbage-records",
      color: "from-amber-500 to-orange-500",
      stats: "Cleanup & Optimization",
    },
  ];

  // Filter cards based on category and search
  const filteredCards = settingsCards.filter((card) => {
    const matchesCategory =
      activeCategory === "All" || card.category === activeCategory;
    const matchesSearch =
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group cards by category for better organization
  const groupedCards = filteredCards.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {});

  const handleCardClick = (url) => {
    navigate(url);
  };

  const toggleSection = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="bg-[#0a0f1e] text-gray-100 min-h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-indigo-900/30">
        <Header />
      </div>

      {/* Notification Toast */}
      <div className="fixed top-20 right-4 z-50">
        {/* Add notification component here if needed */}
      </div>

      <main className="flex-1 mt-[72px] flex">
        {/* Enhanced Sidebar */}
        <aside className="w-72 bg-[#0f1425] border-r border-indigo-900/40 p-6 hidden md:block overflow-y-auto">
          {/* Categories with icons */}
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-3">
              Categories
            </h3>
            <ul className="space-y-1">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? settingsCards.length
                    : settingsCards.filter((c) => c.category === cat).length;

                return (
                  <li
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`cursor-pointer px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between
                      ${
                        activeCategory === cat
                          ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 border border-indigo-500/30"
                          : "text-gray-400 hover:bg-indigo-900/20 hover:text-gray-200"
                      }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeCategory === cat
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* Header Section with Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                System Settings
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Configure and manage your system settings •{" "}
                {filteredCards.length} options available
              </p>
            </div>
          </div>

          {/* Settings Display */}
          {activeCategory === "All" ? (
            // ✅ Simple Grid (NO category headings)
            <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.title}
                  onClick={() => handleCardClick(card.url)}
                  className="group relative bg-[#0f1425] border border-indigo-900/40 rounded-xl p-6 hover:bg-gradient-to-br hover:from-indigo-600/10 hover:to-purple-600/10 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                    <div
                      className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} rounded-full blur-2xl`}
                    ></div>
                  </div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-lg`}
                      >
                        <card.icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            card.stats?.includes("configured")
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>

                    <h3 className="text-base font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">
                      {card.title}
                    </h3>

                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {card.desc}
                    </p>

                    <div className="mt-4 pt-4 border-t border-indigo-900/40 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {card.stats}
                      </span>
                      <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Configure →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ✅ Grouped View (for specific category)
            Object.entries(groupedCards).map(([category, cards]) => (
              <div key={category} className="mb-8">
                <div
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => toggleSection(category)}
                >
                  <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    <span>{category}</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full">
                      {cards.length}
                    </span>
                  </h2>
                  <button className="text-gray-500 hover:text-gray-400">
                    {expandedSections[category] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {(!expandedSections[category] ||
                  expandedSections[category] === undefined) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cards.map((card) => (
                      <div
                        key={card.title}
                        onClick={() => handleCardClick(card.url)}
                        className="group relative bg-[#0f1425] border border-indigo-900/40 rounded-xl p-6 hover:bg-gradient-to-br hover:from-indigo-600/10 hover:to-purple-600/10 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg overflow-hidden"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                          <div
                            className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} rounded-full blur-2xl`}
                          ></div>
                        </div>

                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`bg-gradient-to-br ${card.color} p-3 rounded-xl shadow-lg`}
                            >
                              <card.icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  card.stats?.includes("configured")
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                                }`}
                              ></span>
                              <span className="text-xs text-gray-500">
                                Live
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base font-semibold text-gray-200 group-hover:text-indigo-400 transition-colors">
                            {card.title}
                          </h3>

                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                            {card.desc}
                          </p>

                          <div className="mt-4 pt-4 border-t border-indigo-900/40 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {card.stats}
                            </span>
                            <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Configure →
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Empty State */}
          {filteredCards.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-[#0f1425] rounded-full p-6 mb-4">
                <Search className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No settings found
              </h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-4 px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl hover:bg-indigo-600/30 transition-all"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
