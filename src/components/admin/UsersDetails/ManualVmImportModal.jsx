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
  return (
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
                  <span className="text-xs text-gray-400">2. Plan Type</span>
                </div>
                <div className="w-4 h-px bg-gray-700"></div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded-full ${form.cpuPriceId && form.ramPriceId && form.diskPriceId && form.bandwidthPriceId ? "bg-green-500" : "bg-gray-600"}`}
                  ></div>
                  <span className="text-xs text-gray-400">3. Resources</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onClose()}
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
                    onChange={(e) => setForm({ ...form, vmid: e.target.value })}
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
                    <option value="" className="bg-[#0e1525] text-gray-400">
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
                    disabled={loadingStorage || storageOptions.length === 0}
                  >
                    <option value="" className="bg-[#0e1525] text-gray-400">
                      {loadingStorage ? "Loading storage..." : "Select Storage"}
                    </option>
                    {storageOptions.length > 0 ? (
                      storageOptions.map((storage) => (
                        <option
                          key={storage.id || storage.storage}
                          value={storage.id || storage.storage}
                          className="bg-[#0e1525] text-white"
                        >
                          {storage.label || storage.storage || `${storage.id}`}
                          {storage.size && ` (${formatBytes(storage.size)})`}
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
                    <option value="" className="bg-[#0e1525] text-gray-400">
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
                    <option value="" className="bg-[#0e1525] text-gray-400">
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
                  Step 4: Resource Allocation ({form.planType.toLowerCase()})
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
                      <option value="" className="bg-[#0e1525] text-gray-400">
                        {loadingPricing ? "Loading..." : "Select CPU Plan"}
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
                      <option value="" className="bg-[#0e1525] text-gray-400">
                        {loadingPricing ? "Loading..." : "Select RAM Plan"}
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
                      disabled={loadingPricing || diskOptions.length === 0}
                    >
                      <option value="" className="bg-[#0e1525] text-gray-400">
                        {loadingPricing ? "Loading..." : "Select Disk Plan"}
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
                      disabled={loadingPricing || bandwidthOptions.length === 0}
                    >
                      <option value="" className="bg-[#0e1525] text-gray-400">
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
                    onChange={(e) => setForm({ ...form, cidr: e.target.value })}
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
                onClick={() => onClose()}
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
  );
}
