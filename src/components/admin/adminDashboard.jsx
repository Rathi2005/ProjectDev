import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./adminHeader";
import Footer from "../user/Footer";
import { 
  Users, 
  Server, 
  BarChart3, 
  CreditCard, 
  Activity, 
  Shield,
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
  Network,
  Settings,
  Eye,
  Download,
  MoreVertical,
  Search,
  Filter,
  X,
  User,
  Package,
  HardDrive,
  Calendar,
  Mail,
  Phone,
  Globe,
  Cpu,
  MemoryStick,
  Wifi
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 1254,
    activeServers: 342,
    totalRevenue: 45280,
    pendingIssues: 8,
    serverUtilization: 78,
    monthlyGrowth: 12.5
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all"); // all, users, servers, orders
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Mock data for search
  const [allData, setAllData] = useState({
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", status: "active", joined: "2024-01-15", plan: "Premium" },
      { id: 2, name: "Sarah Smith", email: "sarah@example.com", status: "active", joined: "2024-02-20", plan: "Basic" },
      { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "inactive", joined: "2024-01-05", plan: "Enterprise" },
      { id: 4, name: "Emma Wilson", email: "emma@example.com", status: "active", joined: "2024-03-10", plan: "Premium" },
      { id: 5, name: "Alex Chen", email: "alex@example.com", status: "active", joined: "2024-02-28", plan: "Basic" },
    ],
    servers: [
      { id: 101, name: "web-server-01", ip: "192.168.1.101", status: "running", region: "US East", type: "Dedicated vCPU", cpu: 4, ram: 8 },
      { id: 102, name: "db-server-01", ip: "192.168.1.102", status: "stopped", region: "EU West", type: "Shared vCPU", cpu: 2, ram: 4 },
      { id: 103, name: "app-server-01", ip: "192.168.1.103", status: "running", region: "Asia Pacific", type: "Dedicated vCPU", cpu: 8, ram: 16 },
      { id: 104, name: "cache-server-01", ip: "192.168.1.104", status: "maintenance", region: "US West", type: "Shared vCPU", cpu: 2, ram: 4 },
    ],
    orders: [
      { id: 1001, user: "John Doe", amount: 2999, status: "completed", date: "2024-03-15", type: "Server Upgrade" },
      { id: 1002, user: "Sarah Smith", amount: 1499, status: "pending", date: "2024-03-14", type: "New Server" },
      { id: 1003, user: "Mike Johnson", amount: 5999, status: "completed", date: "2024-03-13", type: "Enterprise Plan" },
      { id: 1004, user: "Emma Wilson", amount: 1999, status: "failed", date: "2024-03-12", type: "Server Renewal" },
    ]
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, user: "John Doe", action: "Created new server", time: "2 min ago", type: "success" },
    { id: 2, user: "Sarah Smith", action: "Payment failed", time: "15 min ago", type: "error" },
    { id: 3, user: "Mike Johnson", action: "Upgraded plan", time: "1 hour ago", type: "info" },
    { id: 4, user: "Emma Wilson", action: "Server rebooted", time: "2 hours ago", type: "warning" },
    { id: 5, user: "Alex Chen", action: "Account created", time: "5 hours ago", type: "success" },
  ]);

  const [serverLocations, setServerLocations] = useState([
    { region: "US East", servers: 45, status: "healthy", utilization: 82 },
    { region: "EU West", servers: 38, status: "healthy", utilization: 76 },
    { region: "Asia Pacific", servers: 29, status: "warning", utilization: 91 },
    { region: "US West", servers: 42, status: "healthy", utilization: 68 },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    let results = [];

    if (searchCategory === "all" || searchCategory === "users") {
      results = [
        ...results,
        ...allData.users
          .filter(user => 
            user.name.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query) ||
            user.plan.toLowerCase().includes(query)
          )
          .map(user => ({ ...user, type: "user" }))
      ];
    }

    if (searchCategory === "all" || searchCategory === "servers") {
      results = [
        ...results,
        ...allData.servers
          .filter(server => 
            server.name.toLowerCase().includes(query) || 
            server.ip.includes(query) ||
            server.region.toLowerCase().includes(query) ||
            server.type.toLowerCase().includes(query)
          )
          .map(server => ({ ...server, type: "server" }))
      ];
    }

    if (searchCategory === "all" || searchCategory === "orders") {
      results = [
        ...results,
        ...allData.orders
          .filter(order => 
            order.user.toLowerCase().includes(query) || 
            order.type.toLowerCase().includes(query) ||
            order.status.toLowerCase().includes(query) ||
            order.id.toString().includes(query)
          )
          .map(order => ({ ...order, type: "order" }))
      ];
    }

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  }, [searchQuery, searchCategory, allData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setIsSearchActive(true);
  };

  const handleSearchCategoryChange = (category) => {
    setSearchCategory(category);
    if (searchQuery) {
      setShowSearchResults(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    setIsSearchActive(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
      case "active":
      case "running":
      case "completed": 
        return "text-green-400 bg-green-400/10";
      case "warning":
      case "pending": 
        return "text-yellow-400 bg-yellow-400/10";
      case "critical":
      case "failed":
      case "inactive": 
        return "text-red-400 bg-red-400/10";
      case "stopped":
      case "maintenance": 
        return "text-gray-400 bg-gray-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getStatusIcon = (type, status) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4" />;
      case "server":
        return status === "running" ? 
          <Server className="w-4 h-4 text-green-400" /> : 
          <Server className="w-4 h-4 text-gray-400" />;
      case "order":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "success": return <div className="w-2 h-2 rounded-full bg-green-500"></div>;
      case "error": return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      case "warning": return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
      case "info": return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-gray-500"></div>;
    }
  };

  const handleResultClick = (result) => {
    switch (result.type) {
      case "user":
        navigate(`/admin/users/${result.id}`);
        break;
      case "server":
        navigate(`/admin/servers/${result.id}`);
        break;
      case "order":
        navigate(`/admin/orders/${result.id}`);
        break;
    }
    clearSearch();
  };

  const searchCategories = [
    { id: "all", label: "All", icon: <Search className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <User className="w-4 h-4" /> },
    { id: "servers", label: "Servers", icon: <Server className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <CreditCard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e1420] via-[#121a2a] to-[#0e1420] text-white flex flex-col">
      {/* Header with Search */}
      <AdminHeader title="Admin Dashboard" onLogout={handleLogout} />

      {/* Global Search Bar */}
      <div className="px-4 md:px-6 lg:px-8 mt-4 relative z-40">
        <div className="max-w-4xl mx-auto">
          <div className={`relative transition-all duration-300 ${isSearchActive ? 'scale-105' : ''}`}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                placeholder="Search across users, servers, orders..."
                className="w-full pl-12 pr-12 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Category Filters */}
            <div className="flex items-center gap-2 mt-3">
              {searchCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSearchCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    searchCategory === category.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </button>
              ))}
              <div className="ml-auto text-xs text-gray-500">
                {searchResults.length} results
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className={`p-4 hover:bg-gray-800/70 cursor-pointer transition-colors border-b border-gray-800/50 last:border-b-0 ${
                        index === 0 ? 'border-t-0' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          result.type === 'user' ? 'bg-blue-500/20' :
                          result.type === 'server' ? 'bg-green-500/20' :
                          'bg-purple-500/20'
                        }`}>
                          {getStatusIcon(result.type, result.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold truncate">
                              {result.type === 'user' && result.name}
                              {result.type === 'server' && result.name}
                              {result.type === 'order' && `Order #${result.id}`}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-400 mb-2">
                            {result.type === 'user' && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                <span>{result.email}</span>
                                <span className="mx-1">•</span>
                                <span>{result.plan}</span>
                              </div>
                            )}
                            
                            {result.type === 'server' && (
                              <div className="flex items-center flex-wrap gap-3">
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  <span>{result.region}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  <span>{result.cpu} vCPU</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MemoryStick className="w-3 h-3" />
                                  <span>{result.ram}GB RAM</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wifi className="w-3 h-3" />
                                  <span>{result.ip}</span>
                                </div>
                              </div>
                            )}
                            
                            {result.type === 'order' && (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{result.user}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{result.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3" />
                                  <span>₹{result.amount}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 flex items-center justify-between">
                            <span className="capitalize">{result.type}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Click to view details
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-3 bg-gray-800/50 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd> to view all results
                    </span>
                    <button 
                      onClick={() => {
                        // Navigate to search results page
                        navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}&category=${searchCategory}`);
                        clearSearch();
                      }}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View all results
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* No Results */}
            {showSearchResults && searchResults.length === 0 && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 p-6 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-2xl z-50 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-1">No results found</h4>
                <p className="text-gray-400 text-sm">
                  No matches for "<span className="text-white">{searchQuery}</span>" in {searchCategory}
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 mt-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin</h1>
          <p className="text-gray-400">Here's what's happening with your platform today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-indigo-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                +2.5%
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm mb-2">Total Users</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-3/4"></div>
            </div>
          </div>

          {/* Active Servers */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-green-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Server className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-400">
                {stats.activeServers} active
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">{stats.activeServers}</h3>
            <p className="text-gray-400 text-sm mb-2">Active Servers</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 w-[78%]"></div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-emerald-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400">
                ₹{stats.monthlyGrowth.toFixed(1)}%
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">₹{stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm mb-2">Monthly Revenue</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[65%]"></div>
            </div>
          </div>

          {/* Pending Issues */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] p-5 md:p-6 rounded-xl border border-gray-800/50 shadow-lg hover:shadow-red-500/10 transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-red-900/30 text-red-400">
                Needs attention
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-1">{stats.pendingIssues}</h3>
            <p className="text-gray-400 text-sm mb-2">Pending Issues</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-[18%]"></div>
            </div>
          </div>
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">System Performance</h3>
                <p className="text-gray-400 text-sm">Server utilization and response times</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-gray-400">CPU</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Memory</span>
                </div>
                <button className="ml-2 p-2 hover:bg-gray-800/50 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Chart Visualization */}
            <div className="h-64 md:h-72 flex items-end gap-2 md:gap-3 mb-6">
              {[65, 78, 82, 91, 74, 68, 72, 85, 88, 76, 82, 79].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500/30 to-indigo-500/10 rounded-t-lg"
                    style={{ height: `${value}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Avg Response</p>
                    <p className="text-lg font-semibold">42ms</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Uptime</p>
                    <p className="text-lg font-semibold">99.9%</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Bandwidth</p>
                    <p className="text-lg font-semibold">2.4TB</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Growth</p>
                    <p className="text-lg font-semibold">+12.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">Recent Activity</h3>
                <p className="text-gray-400 text-sm">Latest user actions</p>
              </div>
              <button className="text-sm text-indigo-400 hover:text-indigo-300">View all</button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
                  <div className="pt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.user}</p>
                    <p className="text-xs text-gray-400 truncate">{activity.action}</p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-5 border-t border-gray-800/50">
              <button className="w-full py-2.5 border border-gray-700 hover:border-indigo-500 text-gray-400 hover:text-indigo-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Export Activity Log
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search Prompts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Search Examples</h3>
          <div className="flex flex-wrap gap-2">
            {['john@example.com', 'web-server', 'pending orders', 'US East', 'Premium plan', 'failed payment'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  setSearchCategory('all');
                  setShowSearchResults(true);
                }}
                className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              >
                <Search className="w-3 h-3" />
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Server Locations & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Server Locations */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">Server Locations</h3>
                <p className="text-gray-400 text-sm">Regional distribution and health</p>
              </div>
              <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <Eye className="w-4 h-4" />
                View map
              </button>
            </div>
            
            <div className="space-y-4">
              {serverLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Server className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium">{location.region}</p>
                      <p className="text-xs text-gray-400">{location.servers} servers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{location.utilization}%</p>
                      <p className="text-xs text-gray-400">Utilization</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                      {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#1d2438] to-[#1a2237] rounded-xl border border-gray-800/50 p-5 md:p-6">
            <div className="mb-6">
              <h3 className="text-lg md:text-xl font-semibold mb-1">Quick Actions</h3>
              <p className="text-gray-400 text-sm">Frequently used admin tasks</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/admin/users")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-indigo-500/20 border border-gray-700 hover:border-indigo-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30">
                  <Users className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Manage Users</p>
                  <p className="text-xs text-gray-400">View and manage user accounts</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate("/admin/servers")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-green-500/20 border border-gray-700 hover:border-green-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30">
                  <Server className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Manage Servers</p>
                  <p className="text-xs text-gray-400">Monitor and control all servers</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate("/admin/billing")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-emerald-500/20 border border-gray-700 hover:border-emerald-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30">
                  <CreditCard className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Billing & Reports</p>
                  <p className="text-xs text-gray-400">View financial reports</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate("/admin/settings")}
                className="w-full flex items-center gap-3 p-4 bg-gray-800/30 hover:bg-purple-500/20 border border-gray-700 hover:border-purple-500 rounded-lg transition-all group"
              >
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30">
                  <Settings className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                </div>
                <div className="text-left">
                  <p className="font-medium">System Settings</p>
                  <p className="text-xs text-gray-400">Configure platform settings</p>
                </div>
              </button>
            </div>
            
            <div className="mt-6 pt-5 border-t border-gray-800/50">
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Security Status</p>
                  <p className="text-xs text-gray-400">All systems secure</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}