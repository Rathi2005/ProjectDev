import React, { useState } from "react";
import Swal from "sweetalert2";
import PaymentMethodSelector from "./PaymentMethodSelector";

const PaymentFlow = ({ onCreateSession, onClose, onShowQR }) => {
  const [loading, setLoading] = useState(false);
  const [gateway, setGateway] = useState("CASHFREE");

  const handlePayNow = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const data = await onCreateSession({
        gateway,
        useWallet: false,
      });

      if (!data) return;

      // ✅ CASE 1: Wallet full payment
      if (data.status === "COMPLETED") {
        Swal.fire({
          icon: "success",
          title: "Payment Successful",
          text: data.message,
          background: "#0e1525",
          color: "#e5e7eb",
          confirmButtonColor: "#6366f1",
          timer: 2000,
          showConfirmButton: true,
        });

        onClose();
        return;
      }

      // ✅ CASE 2: PAYTM QR FLOW
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        onShowQR({
          upiString: data.upiString,
          paymentId: data.paymentId,
          amount: data.remainingToPay,
        });
        return;
      }

      // ✅ CASE 3: CASHFREE
      if (data.paymentSessionId) {
        const cashfree = window.Cashfree({
          mode:
            import.meta.env.VITE_CASHFREE_MODE === "production"
              ? "production"
              : "sandbox",
        });

        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self",
          onClose,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: err.message,
        background: "#0e1525",
        color: "#e5e7eb",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 🔥 Payment Methods UI */}
      <PaymentMethodSelector
        selected={gateway}
        setSelected={setGateway}
      />

      {/* 🔘 Pay Button */}
      <button
        onClick={handlePayNow}
        disabled={loading}
        className="group relative w-full px-4 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg 
                className="animate-spin h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
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
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
              <span>Pay Now</span>
            </>
          )}
        </div>
        
        {/* Subtle hover effect overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </button>
    </div>
  );
};

export default PaymentFlow;