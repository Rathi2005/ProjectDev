import React, { useState } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { Network } from 'lucide-react';
import { useVmActions } from '../../hooks/admin/useVmActions';

export default function MacAddressManager({ orderId, onSuccess, isAdmin = true }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const { changeMac, regenerateUserMac, loading } = useVmActions(`${BASE_URL}/api`);
  const isLoading = loading[orderId] === "mac_change" || loading[orderId] === "mac_regen";

  const DarkSwal = Swal.mixin({
    background: "#1e2640",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#4b5563",
    buttonsStyling: true,
  });

  const handleMacChange = async () => {
    let isManual = false;
    let manualMac = '';

    if (isAdmin) {
      // Stage 1 for Admin: Ask if manual or auto
      const { value: mode } = await DarkSwal.fire({
        title: 'Change MAC Address',
        text: 'Do you want to generate a random MAC address or enter one manually?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Random Auto-Generate',
        cancelButtonText: 'Manual Entry',
        cancelButtonColor: '#10b981', // green for manual
        reverseButtons: true
      });

      if (mode === undefined) return; // user closed modal

      isManual = !mode;

      if (isManual) {
        const { value: enteredMac } = await DarkSwal.fire({
          title: 'Manual MAC Address',
          input: 'text',
          inputLabel: 'Enter custom MAC (e.g. 00:11:22:33:44:55)',
          inputPlaceholder: 'XX:XX:XX:XX:XX:XX',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return 'You need to enter a MAC address!';
            }
            const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
            if (!regex.test(value)) {
              return 'Invalid format. Use XX:XX:XX:XX:XX:XX';
            }
          }
        });

        if (!enteredMac) return; // user cancelled
        manualMac = enteredMac;
      }
    } else {
      // User mode: Only confirm generation
      const { isConfirmed } = await DarkSwal.fire({
        title: 'Regenerate Network Interace',
        text: 'Are you sure you want to trigger a regeneration of your MAC address?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel',
      });

      if (!isConfirmed) return;
    }

    // Stage 2: Reboot Warning Confirmation
    const confirm = await DarkSwal.fire({
      title: 'Warning: Reboot Required',
      html: `Changing the network MAC address will <b>immediately reboot</b> your server. Expect up to 15 seconds of downtime.<br><br>Are you sure you want to continue?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Change & Reboot'
    });

    if (!confirm.isConfirmed) return;

    // Stage 3: Execution
    try {
      DarkSwal.fire({
        title: "Updating MAC Address",
        text: "Please wait while the MAC address updates and the server reboots... This might take 10-15 seconds.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let responseData;
      if (isAdmin) {
        responseData = await changeMac(orderId, isManual, manualMac);
      } else {
        responseData = await regenerateUserMac(orderId);
      }

      DarkSwal.fire({
        icon: "success",
        title: "Success",
        text: "Network MAC regenerated successfully. Server is rebooting.",
        timer: 4000,
        showConfirmButton: false,
      });

      if (responseData?.newMac) {
        toast.success(`New MAC Address: ${responseData.newMac}`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const is400 = err.message.startsWith('400:');
      const is500 = err.message.startsWith('500:');
      const cleanMessage = err.message.split(': ').slice(1).join(': ') || err.message;
      
      if (is400) {
        toast.error("Malformed MAC Address provided.");
      } else if (is500) {
        toast.error("Server/Proxmox is unreachable.");
      } else {
        toast.error(cleanMessage || "Failed to update MAC Address.");
      }
      
      DarkSwal.fire({
        icon: "error",
        title: "Failed",
        text: cleanMessage || "Could not change the MAC address.",
      });
    }
  };

  return (
    <button
      onClick={handleMacChange}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 p-3 ${
        isAdmin 
          ? "border rounded-lg font-medium transition-colors border-indigo-600/30 w-full md:w-auto h-full"
          : "bg-[#0e1525] hover:bg-indigo-900/20 border border-indigo-900/50 rounded-lg text-indigo-300 text-sm transition-colors w-full"
      } ${
        isLoading 
          ? "bg-indigo-600/10 text-indigo-500 opacity-50 cursor-not-allowed" 
          : isAdmin ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400" : ""
      }`}
    >
      <Network className="w-4 h-4" />
      {isLoading ? "Updating..." : "Regenerate MAC"}
    </button>
  );
}
