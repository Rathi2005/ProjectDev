import { useState, useRef } from "react";
import { createVM, verifyPayment } from "../services/PaymentService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const usePayment = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);
  const navigate = useNavigate();
  const showError = (e) => {
    if (e?.status === 401) return "Session expired. Login again.";
    if (e?.status === 403) return "Access denied.";
    if (e?.status === 400) return e.message;
    if (e?.status === 500) return "Server error.";
    if (e instanceof TypeError) return "Network error.";

    return e?.message || "Something went wrong.";
  };

  const startPayment = async (serverConfig, gateway, onCashfreePay) => {
    setLoading(true);

    try {
      const data = await createVM(serverConfig, gateway);

      // ✅ Case 1: Wallet full
      if (data.status === "COMPLETED") {
        navigate("/orders");
        return;
      }

      // ✅ Case 2: Paytm QR
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        setQrData({
          upiString: data.upiString,
          paymentId: data.paymentSessionId,
        });

        startPolling(data.paymentSessionId, "PAYTM");
        return;
      }

      // ✅ Case 3: Cashfree
      if (gateway === "CASHFREE" && data.paymentSessionId) {
        onCashfreePay(data.paymentSessionId);
      }
    } catch (e) {
      toast.error(showError(e));
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentId, gateway) => {
    let attempts = 0;
    const maxAttempts = 20; // ~1 min (20 × 3 sec)

    pollRef.current = setInterval(async () => {
      try {
        attempts++;

        const res = await verifyPayment(paymentId, gateway);

        if (
          res.status === "PAID_AND_PROVISIONING" ||
          res.status === "RENEWAL_SUCCESS"
        ) {
          clearInterval(pollRef.current);
          toast.success("Payment successful");
          navigate("/orders");
        }

        // ⛔ stop after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          toast("Payment not confirmed yet. You can retry.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return {
    startPayment,
    qrData,
    setQrData,
    loading,
    stopPolling,
  };
};
