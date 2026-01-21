import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RefreshCw, X, Server, Cpu, HardDrive, MemoryStick, Globe, Calendar, Upload } from "lucide-react";

const DarkSwal = Swal.mixin({
  background: "#1e2640",
  color: "#ffffff",
  confirmButtonColor: "#6366f1",
});

export default function CreateVmModal({
  user,
  servers,
  BASE_URL,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    userId: user.id,
    serverId: "",
    vmName: "",
    planType: "",
    cpuPriceId: "",
    ramPriceId: "",
    diskPriceId: "",
    bandwidthPriceId: "",
    isoId: "",
    ipId: "",
    expiryDate: "",
  });

  const [cpuOptions, setCpuOptions] = useState([]);
  const [ramOptions, setRamOptions] = useState([]);
  const [diskOptions, setDiskOptions] = useState([]);
  const [bandwidthOptions, setBandwidthOptions] = useState([]);
  const [isoOptions, setIsoOptions] = useState([]);
  const [ipOptions, setIpOptions] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (user?.id) {
      setForm((f) => ({ ...f, userId: user.id }));
    }
  }, [user]);

  /* ---------------- PLAN PRICING ---------------- */
  useEffect(() => {
    if (!form.planType) return;

    const fetchPricing = async () => {
      setLoadingPricing(true);
      try {
        const type = form.planType.toLowerCase();
        const headers = { Authorization: `Bearer ${token}` };

        const [cpu, ram, disk, bw] = await Promise.all([
          fetch(`${BASE_URL}/api/pricing/${type}/cpu`, { headers }),
          fetch(`${BASE_URL}/api/pricing/${type}/ram`, { headers }),
          fetch(`${BASE_URL}/api/pricing/${type}/disk`, { headers }),
          fetch(`${BASE_URL}/api/pricing/${type}/bandwidth`, { headers }),
        ]);

        setCpuOptions(await cpu.json());
        setRamOptions(await ram.json());
        setDiskOptions(await disk.json());
        setBandwidthOptions(await bw.json());
      } catch {
        DarkSwal.fire("Error", "Failed to load pricing", "error");
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [form.planType]);

  /* ---------------- ISO + IPs ---------------- */
  useEffect(() => {
    if (!form.serverId) return;

    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${BASE_URL}/api/options/servers/${form.serverId}/isos/list`, {
      headers,
    })
      .then((r) => r.json())
      .then(setIsoOptions);

    fetch(`${BASE_URL}/api/admin/vms/${form.serverId}/available-ips`, {
      headers,
    })
      .then((r) => r.json())
      .then(setIpOptions);
  }, [form.serverId]);

  /* ---------------- SUBMIT ---------------- */
  const submitVm = async () => {
    if (
      !form.vmName ||
      !form.serverId ||
      !form.planType ||
      !form.cpuPriceId ||
      !form.ramPriceId ||
      !form.diskPriceId ||
      !form.bandwidthPriceId ||
      !form.ipId ||
      !form.expiryDate
    ) {
      DarkSwal.fire(
        "Missing Data",
        "Please fill all required fields",
        "warning",
      );
      return;
    }

    const payload = {
      userId: Number(form.userId),
      serverId: Number(form.serverId),
      vmName: form.vmName,
      planType: form.planType,

      cpuPriceId: Number(form.cpuPriceId),
      ramPriceId: Number(form.ramPriceId),
      diskPriceId: Number(form.diskPriceId),
      bandwidthPriceId: Number(form.bandwidthPriceId),

      isoId: form.isoId ? Number(form.isoId) : null,
      ipId: Number(form.ipId),

      expiryDate: `${form.expiryDate} 23:59:59`,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/admin/vms/manual-create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("VM creation failed");

      DarkSwal.fire("Success", "VM Created Successfully", "success");
      onSuccess();
      onClose();
    } catch (e) {
      DarkSwal.fire("Error", e.message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 w-full max-w-4xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-950">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New VM</h2>
            <p className="text-gray-400 text-sm mt-1">
              For user: <span className="text-blue-400 font-medium">{user.email}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Configuration Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Server className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Basic Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* VM Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VM Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., my-vm-01"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  onChange={(e) => setForm({ ...form, vmName: e.target.value })}
                />
              </div>

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
                    onChange={(e) => setForm({ ...form, serverId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select Server</option>
                    {servers.map((s) => (
                      <option key={s.id} value={s.id} className="bg-gray-900">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Plan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Type *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition"
                    onChange={(e) => setForm({ ...form, planType: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select Plan Type</option>
                    <option value="DEDICATED" className="bg-gray-900">Dedicated</option>
                    <option value="SHARED" className="bg-gray-900">Shared</option>
                  </select>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resource Configuration Section */}
          {form.planType && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Cpu className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Resource Configuration</h3>
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
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    value={form.cpuPriceId}
                    onChange={(e) => setForm({ ...form, cpuPriceId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select CPU</option>
                    {cpuOptions.map((c) => (
                      <option key={c.id} value={c.id} className="bg-gray-900">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RAM */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MemoryStick className="w-4 h-4 inline mr-2" />
                    RAM Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    value={form.ramPriceId}
                    onChange={(e) => setForm({ ...form, ramPriceId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select RAM</option>
                    {ramOptions.map((r) => (
                      <option key={r.id} value={r.id} className="bg-gray-900">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disk */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <HardDrive className="w-4 h-4 inline mr-2" />
                    Disk Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    value={form.diskPriceId}
                    onChange={(e) => setForm({ ...form, diskPriceId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select Disk</option>
                    {diskOptions.map((d) => (
                      <option key={d.id} value={d.id} className="bg-gray-900">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bandwidth */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Bandwidth Plan *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    value={form.bandwidthPriceId}
                    onChange={(e) => setForm({ ...form, bandwidthPriceId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select Bandwidth</option>
                    {bandwidthOptions.map((b) => (
                      <option key={b.id} value={b.id} className="bg-gray-900">
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Configuration Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Upload className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Advanced Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    onChange={(e) => setForm({ ...form, isoId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select ISO</option>
                    {isoOptions.map((i) => (
                      <option key={i.id} value={i.id} className="bg-gray-900">
                        {i.iso}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IP Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IP Address *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Globe className="w-5 h-5 text-gray-500" />
                  </div>
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    onChange={(e) => setForm({ ...form, ipId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Select IP Address</option>
                    {ipOptions.map((ip) => (
                      <option key={ip.id} value={ip.id} className="bg-gray-900">
                        {ip.ip}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitVm}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-900/25"
              >
                Create Virtual Machine
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}