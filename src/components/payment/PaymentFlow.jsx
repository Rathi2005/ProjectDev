import React, { useState } from "react";
import Swal from "sweetalert2";
import PaymentMethodSelector from "./PaymentMethodSelector";

const PaymentFlow = ({ onCreateSession, onClose, onShowQR }) => {
  const [loading, setLoading] = useState(false);
  const [gateway, setGateway] = useState(null);
  const [useWallet, setUseWallet] = useState(false);

  const handlePayNow = async () => {
    if (loading) return;

    try {
      setLoading(true);
      if (!gateway && !useWallet) {
        Swal.fire("Error", "Please select payment method", "error");
        return;
      }

      const data = await onCreateSession({
        gateway: gateway?.type || "CASHFREE", // Fallback to CASHFREE if wallet covers entirely
        useWallet: useWallet,
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
          paymentId: data.paymentId || data.id || data.orderId,
          amount: data.remainingToPay,
          walletUsed: data.walletAmountUsed,
        });
        return;
      }

      // ✅ CASE 3: CASHFREE
      if (data.paymentSessionId) {
        const cashfree = window.Cashfree({
          mode: gateway?.mode?.toLowerCase(),
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
      {/* 💼 Wallet Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ease-in-out border-indigo-500/20 bg-indigo-900/10 hover:bg-indigo-900/20 relative group text-white">
        <input
          type="checkbox"
          checked={useWallet}
          onChange={(e) => setUseWallet(e.target.checked)}
          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-2 transition-all duration-200"
        />
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">Use Wallet Balance</span>
          <span className="text-xs text-gray-400">If available, funds will be deducted automatically</span>
        </div>
      </label>

      {/* 🔥 Payment Methods UI */}
      <PaymentMethodSelector selected={gateway} setSelected={setGateway} />

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
