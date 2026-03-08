import React, { useState, useEffect } from "react";
import { Server, Play, Square, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "../utils/api";

export default function UserOrdersPage() {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [powerLoading, setPowerLoading] = useState({});

  const [vmDetails, setVmDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch VMs
  useEffect(() => {
    async function fetchVMs() {
      try {
        const token = localStorage.getItem("rToken");

        // const res = await fetch(`${BASE_URL}/api/reseller/user/vms`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     "Content-Type": "application/json",
        //     "X-Reseller-Domain": window.location.origin,
        //   },
        // });
        // const data = await res.json();

        const data = await apiFetch("/api/reseller/user/vms");

        const formatted = data.map((vm) => ({
          vmid: vm.vmid,
          id: vm.id,
          name: vm.name,
          ip: vm.ipAddress,
          os: vm.osName,
          status: vm.status,
          liveStatus: vm.liveStatus,
          created: vm.assignedTime,
          originalData: vm,
        }));

        setOrders(formatted);
      } catch (err) {
        toast.error("Failed to fetch servers");
      } finally {
        setLoading(false);
      }
    }

    fetchVMs();
  }, []);

  // Power Action
  const handlePowerAction = async (order, action) => {
    const token = localStorage.getItem("rToken");

    try {
      setPowerLoading((prev) => ({ ...prev, [order.id]: action }));

      // const res = await fetch(
      //   `${BASE_URL}/api/reseller/user/vms/${order.id}/${action}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "X-Reseller-Domain": window.location.origin,
      //     },
      //   }
      // );

      await apiFetch(`/api/reseller/user/vms/${order.id}/${action}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Action failed");

      toast.success(`${action} request sent`);

      setOrders((prev) =>
        prev.map((vm) =>
          vm.id === order.id
            ? {
                ...vm,
                liveStatus:
                  action === "start"
                    ? "running"
                    : action === "stop"
                      ? "stopped"
                      : "rebooting",
              }
            : vm,
        ),
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPowerLoading((prev) => ({ ...prev, [order.id]: null }));
    }
  };

  const handleDetails = async (order) => {
    try {
      setDetailsLoading(true);

      const data = await apiFetch(`/api/reseller/user/vms/${order.id}/details`);

      setVmDetails({
        name: order.name,
        cpu: data.cpuCores,
        ram: data.ram,
        storage: data.storage,
        vmid: data.proxmoxVmid,
      });
    } catch (err) {
      toast.error("Failed to fetch VM details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-green-400";
      case "STOPPED":
        return "text-gray-400";
      default:
        return "text-yellow-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading servers...
      </div>
    );
  }

  return (
    <div className="bg-[#0e1525] min-h-screen text-white p-8">
      <Toaster />

      <h1 className="text-3xl font-bold mb-6">My Servers</h1>

      <div className="bg-[#151c2f] rounded-xl border border-indigo-900/40 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1a2337] text-gray-300 text-xs uppercase">
            <tr>
              <th className="p-4">Server</th>
              <th className="p-4">OS</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Created</th>
              <th className="p-4">Status</th>
              <th className="p-4">Live Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-indigo-900/20 hover:bg-indigo-900/10"
              >
                <td className="p-4 flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  {order.name}
                </td>

                <td className="p-4">{order.os}</td>

                <td className="p-4">
                  <code className="bg-[#0e1525] px-2 py-1 rounded text-xs">
                    {order.ip || "N/A"}
                  </code>
                </td>

                <td className="p-4">{formatDate(order.created)}</td>

                <td
                  className={`p-4 font-semibold ${statusColor(order.status)}`}
                >
                  {order.status}
                </td>

                <td className="p-4">{order.liveStatus?.toUpperCase()}</td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePowerAction(order, "start")}
                      disabled={powerLoading[order.id]}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                    >
                      <Play size={14} /> Start
                    </button>

                    <button
                      onClick={() => handlePowerAction(order, "stop")}
                      disabled={powerLoading[order.id]}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      <Square size={14} /> Stop
                    </button>

                    <button
                      onClick={() => handlePowerAction(order, "reboot")}
                      disabled={powerLoading[order.id]}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                    >
                      <RefreshCw size={14} /> Reboot
                    </button>

                    <button
                      onClick={() => handleDetails(order)}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center p-10 text-gray-400">No servers found</div>
        )}

        {vmDetails && (
          <div className="mt-6 bg-[#151c2f] border border-indigo-900/40 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              VM Details - {vmDetails.name}
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                CPU Cores:{" "}
                <span className="font-semibold">{vmDetails.cpu}</span>
              </div>
              <div>
                RAM: <span className="font-semibold">{vmDetails.ram} MB</span>
              </div>
              <div>
                Storage:{" "}
                <span className="font-semibold">{vmDetails.storage} GB</span>
              </div>
              <div>
                VMID: <span className="font-semibold">{vmDetails.vmid}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
