import { useState, useRef, useCallback } from "react";
import { createVM, verifyPayment } from "../services/PaymentService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const usePayment = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  const showError = useCallback((e) => {
    if (e?.status === 401) return "Session expired. Login again.";
    if (e?.status === 403) return "Access denied.";
    if (e?.status === 400) return e.message;
    if (e?.status === 500) return "Server error.";
    if (e instanceof TypeError) return "Network error.";
    return e?.message || "Something went wrong.";
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((paymentId, gateway) => {
    // Guard against duplicate intervals
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;

    let attempts = 0;
    const maxAttempts = 40; // ~2 min (40 × 3 sec)

    pollRef.current = setInterval(async () => {
      try {
        attempts++;

        const res = await verifyPayment(paymentId, gateway);

        if (
          res.status !== "PENDING"
        ) {
          stopPolling();
          setQrData(null);
          toast.success("Payment successful");
          navigate("/orders");
          return;
        }
        
        if (attempts >= maxAttempts) {
          stopPolling();
          setQrData(null);
          toast("Payment not confirmed yet. You can retry.");
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
      }
    }, 3000);
  }, [stopPolling, navigate]);

  const startPayment = useCallback(async (serverConfig, gateway, onCashfreePay) => {
    setLoading(true);
    try {
      const data = await createVM(serverConfig, gateway);

      // Case 1: Wallet full
      if (data.status === "COMPLETED") {
        navigate("/orders");
        return;
      }

      // Case 2: Paytm QR
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        setQrData({
          upiString: data.upiString,
          paymentId: data.paymentId,
        });
        startPolling(data.paymentId, "PAYTM");
        return;
      }

      // Case 3: Cashfree
      if (gateway === "CASHFREE" && data.paymentSessionId) {
        onCashfreePay(data.paymentSessionId);
      }
    } catch (e) {
      toast.error(showError(e));
    } finally {
      setLoading(false);
    }
  }, [navigate, startPolling, showError]);

  return {
    startPayment,
    qrData,
    setQrData,
    loading,
    startPolling,
    stopPolling,
  };
};