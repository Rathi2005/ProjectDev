import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Activity } from "lucide-react";

export default function VMPerformanceModal({
  isOpen,
  onClose,
  vmid,
  serverId,
  vmName,
}) {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center">
      {/* Modal */}
      <div className="bg-[#0e1525] w-full max-w-5xl mx-4 rounded-2xl border border-indigo-900/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-indigo-900/30">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                VM Performance
              </h2>
              <p className="text-xs text-gray-400">
                {vmName} • VMID {vmid} • Server {serverId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="CPU Usage" />
            <ChartCard title="Memory Usage" />
            <ChartCard title="Disk I/O" />
            <ChartCard title="Network Traffic" />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ChartCard({ title }) {
  return (
    <div className="bg-[#151c2f] border border-indigo-900/30 rounded-xl p-4 h-[220px] flex items-center justify-center">
      <div className="text-center">
        <Activity className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-xs text-gray-500 mt-1">
          Chart will be rendered here
        </p>
      </div>
    </div>
  );
}
