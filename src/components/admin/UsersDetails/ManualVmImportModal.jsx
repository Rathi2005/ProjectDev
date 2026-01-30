import {
  RefreshCw,
  X,
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Globe,
  Calendar,
  Upload,
  Database,
  Network,
  Settings,
  CheckCircle,
} from "lucide-react";

export default function ManualVmImportModal({
  show,
  onClose,
  selectedUser,
  form,
  setForm,
  servers,
  storageOptions,
  isos,
  submitManualVm,
  loadingPricing,
  cpuOptions,
  ramOptions,
  diskOptions,
  bandwidthOptions,
  formatBytes,
  loadingStorage,
}) {
  if (!show) return null;

  const planTypes = [
    { id: "DEDICATED", name: "Dedicated Resources" },
    { id: "SHARED", name: "Shared Resources" },
  ];

  // Calculate completion status for progress indicator
  const isStep1Complete = form.serverId && form.storageId;
  const isStep2Complete = form.planType;
  const isStep3Complete =
    form.cpuPriceId &&
    form.ramPriceId &&
    form.diskPriceId &&
    form.bandwidthPriceId;

  const cidrToSubnetMask = (cidr) => {
    const prefix = Number(cidr?.replace("/", ""));
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return "";

    let mask = [];
    let remaining = prefix;

    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, remaining);
      mask.push(bits === 0 ? 0 : 256 - Math.pow(2, 8 - bits));
      remaining -= bits;
    }

    return mask.join(".");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 w-full max-w-4xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">
                Manual VM Import
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded-full ${isStep1Complete ? "bg-green-500" : "bg-gray-600"}`}
                  ></div>
                  <span className="text-xs text-gray-400">1. Server</span>
                </div>
                <div className="w-4 h-px bg-gray-700"></div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded-full ${isStep2Complete ? "bg-green-500" : "bg-gray-600"}`}
                  ></div>
                  <span className="text-xs text-gray-400">2. Plan Type</span>
                </div>
                <div className="w-4 h-px bg-gray-700"></div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded-full ${isStep3Complete ? "bg-green-500" : "bg-gray-600"}`}
                  ></div>
                  <span className="text-xs text-gray-400">3. Resources</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Importing VM for{" "}
              <span className="text-emerald-400 font-medium">
                {selectedUser?.email}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-4"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Settings className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Step 1: Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* VM Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VM Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ubuntu Server 22.04"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  onChange={(e) => setForm({ ...form, vmName: e.target.value })}
                />
              </div>

              {/* VMID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VMID *
                </label>
                <input
                  type="text"
                  placeholder="e.g., 100"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  onChange={(e) => setForm({ ...form, vmid: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Server Configuration Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Step 2: Server Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Server Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Server className="w-5 h-5 text-gray-500" />
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition"
                    value={form.serverId}
                    onChange={(e) =>
                      setForm({ ...form, serverId: e.target.value })
                    }
                  >
                    <option value="" className="bg-gray-900">
                      Select Server
                    </option>
                    {servers.length > 0 ? (
                      servers.map((s) => (
                        <option key={s.id} value={s.id} className="bg-gray-900">
                          {s.name} ({s.location})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        Loading servers...
                      </option>
                    )}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {servers.length} servers available
                </p>
              </div>

              {/* Storage Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Storage *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Database className="w-5 h-5 text-gray-500" />
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition"
                    value={form.storageId}
                    onChange={(e) =>
                      setForm({ ...form, storageId: e.target.value })
                    }
                    disabled={loadingStorage || storageOptions.length === 0}
                  >
                    <option value="" className="bg-gray-900">
                      {loadingStorage ? "Loading storage..." : "Select Storage"}
                    </option>
                    {storageOptions.length > 0 ? (
                      storageOptions.map((storage) => (
                        <option
                          key={storage.id || storage.storage}
                          value={storage.id || storage.storage}
                          className="bg-gray-900"
                        >
                          {storage.label || storage.storage || `${storage.id}`}
                          {storage.size && ` (${formatBytes(storage.size)})`}
                          {storage.type && ` - ${storage.type}`}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        {form.serverId
                          ? storageOptions.length === 0
                            ? "No storage available"
                            : "Loading storage..."
                          : "Select server first"}
                      </option>
                    )}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.serverId
                    ? storageOptions.length > 0
                      ? `${storageOptions.length} storage option${storageOptions.length !== 1 ? "s" : ""}`
                      : loadingStorage
                        ? "Loading..."
                        : "No storage found"
                    : "Select server to view storage"}
                </p>
              </div>

              {/* ISO Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ISO Image (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Upload className="w-5 h-5 text-gray-500" />
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition"
                    value={form.isoId}
                    onChange={(e) =>
                      setForm({ ...form, isoId: e.target.value })
                    }
                  >
                    <option value="" className="bg-gray-900">
                      Select ISO
                    </option>
                    {isos.length > 0 ? (
                      isos.map((iso) => (
                        <option
                          key={iso.id || iso.iso}
                          value={iso.id}
                          className="bg-gray-900"
                        >
                          {iso.iso}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        {form.serverId
                          ? isos.length === 0
                            ? "No ISOs available for this server"
                            : "Loading ISOs..."
                          : "Select a server first"}
                      </option>
                    )}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.serverId
                    ? isos.length > 0
                      ? `${isos.length} ISO${isos.length !== 1 ? "s" : ""} available`
                      : "No ISOs found"
                    : "Select server to view ISOs"}
                </p>
              </div>
            </div>
          </div>

          {/* Plan Type Selection Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Step 3: Select Plan Type
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Plan Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resource Type *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none transition"
                    value={form.planType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        planType: e.target.value,
                        cpuPriceId: "",
                        ramPriceId: "",
                        diskPriceId: "",
                        bandwidthPriceId: "",
                      })
                    }
                  >
                    <option value="" className="bg-gray-900">
                      Select plan type
                    </option>
                    {planTypes.map((plan) => (
                      <option
                        key={plan.id}
                        value={plan.id}
                        className="bg-gray-900"
                      >
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {form.planType
                    ? `Selected: ${form.planType.toLowerCase()} resources`
                    : "Choose between dedicated or shared resources"}
                </p>
              </div>

              {/* Pricing Status Display */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pricing Status
                </label>
                <div className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg">
                  {loadingPricing ? (
                    <div className="flex items-center gap-2 text-blue-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">
                        Loading {form.planType.toLowerCase()} pricing...
                      </span>
                    </div>
                  ) : form.planType ? (
                    <div className="text-sm text-green-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {form.planType.toLowerCase()} pricing loaded
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        CPU: {cpuOptions.length} plans | RAM:{" "}
                        {ramOptions.length} plans | Disk: {diskOptions.length}{" "}
                        plans | Bandwidth: {bandwidthOptions.length} plans
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

          {/* Resource Configuration Section */}
          {form.planType && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Cpu className="w-5 h-5 text-cyan-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Step 4: Resource Allocation ({form.planType.toLowerCase()})
                </h3>
                {loadingPricing && (
                  <RefreshCw className="w-4 h-4 text-gray-400 animate-spin ml-2" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CPU */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Cpu className="w-4 h-4 inline mr-2" />
                    CPU Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    value={form.cpuPriceId}
                    onChange={(e) =>
                      setForm({ ...form, cpuPriceId: e.target.value })
                    }
                    disabled={loadingPricing || cpuOptions.length === 0}
                  >
                    <option value="" className="bg-gray-900">
                      {loadingPricing ? "Loading..." : "Select CPU Plan"}
                    </option>
                    {cpuOptions.length > 0 ? (
                      cpuOptions.map((c) => (
                        <option key={c.id} value={c.id} className="bg-gray-900">
                          {c.label}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        {loadingPricing
                          ? "Loading..."
                          : "No CPU plans available"}
                      </option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {cpuOptions.length} CPU plan
                    {cpuOptions.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* RAM */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MemoryStick className="w-4 h-4 inline mr-2" />
                    RAM Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    value={form.ramPriceId}
                    onChange={(e) =>
                      setForm({ ...form, ramPriceId: e.target.value })
                    }
                    disabled={loadingPricing || ramOptions.length === 0}
                  >
                    <option value="" className="bg-gray-900">
                      {loadingPricing ? "Loading..." : "Select RAM Plan"}
                    </option>
                    {ramOptions.length > 0 ? (
                      ramOptions.map((r) => (
                        <option key={r.id} value={r.id} className="bg-gray-900">
                          {r.label}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        {loadingPricing
                          ? "Loading..."
                          : "No RAM plans available"}
                      </option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {ramOptions.length} RAM plan
                    {ramOptions.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Disk */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <HardDrive className="w-4 h-4 inline mr-2" />
                    Disk Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    value={form.diskPriceId}
                    onChange={(e) =>
                      setForm({ ...form, diskPriceId: e.target.value })
                    }
                    disabled={loadingPricing || diskOptions.length === 0}
                  >
                    <option value="" className="bg-gray-900">
                      {loadingPricing ? "Loading..." : "Select Disk Plan"}
                    </option>
                    {diskOptions.length > 0 ? (
                      diskOptions.map((d) => (
                        <option key={d.id} value={d.id} className="bg-gray-900">
                          {d.label}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        {loadingPricing
                          ? "Loading..."
                          : "No Disk plans available"}
                      </option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {diskOptions.length} Disk plan
                    {diskOptions.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Bandwidth */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Bandwidth Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    value={form.bandwidthPriceId}
                    onChange={(e) =>
                      setForm({ ...form, bandwidthPriceId: e.target.value })
                    }
                    disabled={loadingPricing || bandwidthOptions.length === 0}
                  >
                    <option value="" className="bg-gray-900">
                      {loadingPricing ? "Loading..." : "Select Bandwidth Plan"}
                    </option>
                    {bandwidthOptions.length > 0 ? (
                      bandwidthOptions.map((b) => (
                        <option key={b.id} value={b.id} className="bg-gray-900">
                          {b.label}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled className="bg-gray-900">
                        {loadingPricing
                          ? "Loading..."
                          : "No Bandwidth plans available"}
                      </option>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {bandwidthOptions.length} Bandwidth plan
                    {bandwidthOptions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Network Configuration Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Network className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Step 5: Network Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* IP Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IP Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Globe className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., 192.168.1.100"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    value={form.ipAddress}
                    onChange={(e) =>
                      setForm({ ...form, ipAddress: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* MAC Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  MAC Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Network className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., BC:24:11:AA:BB:CC"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    value={form.macAddress}
                    onChange={(e) =>
                      setForm({ ...form, macAddress: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* CIDR */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CIDR
                </label>
                <input
                  type="text"
                  placeholder="/24"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  // value={form.cidr}
                  onChange={(e) => {
                    const cidr = e.target.value;
                    setForm({
                      ...form,
                      cidr,
                      subnetMask: cidrToSubnetMask(cidr),
                    });
                  }}
                />
              </div>

              {/* Gateway */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gateway
                </label>
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.1"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  value={form.gateway}
                  onChange={(e) =>
                    setForm({ ...form, gateway: e.target.value })
                  }
                />
              </div>

              {/* Subnet Mask */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subnet Mask
                </label>
                <input
                  type="text"
                  placeholder="e.g., 255.255.255.0"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  value={form.subnetMask}
                  disabled
                  onChange={(e) =>
                    setForm({ ...form, subnetMask: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Expiration Date Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Step 6: Expiration Date
              </h3>
            </div>

            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expires At
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition [color-scheme:dark]"
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Required fields: VM Name, VMID, Server, Plan Type, and all
              resource plans
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors flex-1 sm:flex-none"
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
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-1 sm:flex-none"
              >
                <Upload className="w-4 h-4" />
                Import VM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
