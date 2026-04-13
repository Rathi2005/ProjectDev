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
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;

    let attempts = 0;
    const maxAttempts = 40;

    pollRef.current = setInterval(async () => {
      try {
        // ✅ Check limit BEFORE making the network call
        if (attempts >= maxAttempts) {
          stopPolling();
          setQrData(null);
          toast("Payment not confirmed yet. You can retry.");
          return;
        }

        attempts++;
        const res = await verifyPayment(paymentId, gateway);

        if (res.status !== "PENDING") {
          stopPolling();
          setQrData(null);
          toast.success("Payment successful");
          navigate("/orders");
          return;
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
      }
    }, 3000);
  }, [stopPolling, navigate]);

  const startPayment = useCallback(async (serverConfig, gateway, onCashfreePay) => {
    setLoading(true);
    console.log("Starting payment with config:", serverConfig, "and gateway:", gateway.type);
    try {
      const data = await createVM(serverConfig, gateway.type);

      // Case 1: Wallet full payment
      if (data.status === "COMPLETED") {
        navigate("/orders");
        return;
      }

      // Case 2: Paytm QR
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        setQrData({
          upiString: data.upiString,
          paymentId: data.paymentId,
          // ✅ amount added — PaytmQRModal needs this to display ₹ value
          amount: data.remainingToPay ?? data.amount,
        });
        startPolling(data.paymentId, "PAYTM");
        return;
      }

      // Case 3: Cashfree — ✅ gateway.type instead of gateway
      if (gateway?.type === "CASHFREE" && data.paymentSessionId) {
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