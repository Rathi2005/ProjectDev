import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, RefreshCw, Edit3, ShieldCheck } from 'lucide-react';
import { useVmActions } from '../../../hooks/admin/useVmActions';
import toast from 'react-hot-toast';

export default function MacChangeModal({ isOpen, onClose, order, onSuccess }) {
  const [confirmed, setConfirmed] = useState(false);
  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
  const [manualMac, setManualMac] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { changeMac } = useVmActions(BASE_URL);

  // Reset state when modal opens/changes order
  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setMode('auto');
      setManualMac('');
      setValidationError('');
    }
  }, [isOpen, order?.internalVmid]);

  if (!isOpen || !order) return null;

  const validateMac = (mac) => {
    const regex = /^([0-9A-Fa-f]{2}[:\-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac);
  };

  const handleApply = async () => {
    if (!confirmed) return;
    if (mode === 'manual' && !validateMac(manualMac)) {
      setValidationError('Invalid MAC address format (XX:XX:XX:XX:XX:XX)');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');

      await changeMac(order.internalVmid, mode === 'manual', manualMac);

      toast.success(`MAC Address updated for ${order.vmName || 'VM'}. The system is now rebooting.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('MAC Change Error:', err);
      setValidationError(err.message || 'Failed to update MAC address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#0e1525] border border-indigo-900/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="overflow-y-auto flex-1 p-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-indigo-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <RefreshCw className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Change MAC Address</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Warning Section */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-red-500 uppercase tracking-wider">Critical Warning</p>
              <p className="text-sm text-red-200/80 leading-relaxed">
                Changing the MAC address will <span className="text-red-400 font-bold underline">immediately reboot</span> your server. 
                Active network connections will be dropped.
              </p>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400">Assignment Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('auto')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  mode === 'auto' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <ShieldCheck className={`w-6 h-6 ${mode === 'auto' ? 'text-indigo-400' : 'text-gray-500'}`} />
                <span className="text-sm font-semibold">Auto Generate</span>
              </button>

              <button
                onClick={() => setMode('manual')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                  mode === 'manual' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white' 
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Edit3 className={`w-6 h-6 ${mode === 'manual' ? 'text-indigo-400' : 'text-gray-500'}`} />
                <span className="text-sm font-semibold">Manual Entry</span>
              </button>
            </div>
          </div>

          {/* Conditional Manual Input */}
          {mode === 'manual' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium text-gray-400">Manual MAC Address</label>
              <input
                type="text"
                placeholder="00:1A:2B:3C:4D:5E"
                value={manualMac}
                onChange={(e) => {
                  setManualMac(e.target.value.toUpperCase());
                  setValidationError('');
                }}
                className="w-full bg-[#070b14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg animate-pulse">
              {validationError}
            </p>
          )}

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-1">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:border-indigo-500 peer-checked:bg-indigo-500 transition-all flex items-center justify-center">
                <ShieldCheck className={`w-3 h-3 text-white transition-opacity ${confirmed ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors select-none">
              I understand that this action will reboot the server and I have saved my work.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-[#070b14] border-t border-indigo-900/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!confirmed || (mode === 'manual' && !manualMac) || isSubmitting}
            className={`flex-[2] px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              !confirmed || (mode === 'manual' && !manualMac) || isSubmitting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Apply Change'
            )}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
