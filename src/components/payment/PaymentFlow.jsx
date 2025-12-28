import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Loader2,
  IndianRupee,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";

const PaymentFlow = ({ onCreateSession, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handlePayNow = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const paymentSessionId = await onCreateSession();
      if (!paymentSessionId) throw new Error("No payment session received");

      const cashfree = window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || "sandbox",
      });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
        onClose,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err.message,
        background: "#0e1525",
        color: "#e5e7eb",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayNow}
      disabled={loading}
      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
};

export default PaymentFlow;