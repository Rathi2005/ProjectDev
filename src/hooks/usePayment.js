import { useState, useRef, useCallback } from "react";
import { createVM, verifyPayment } from "../services/PaymentService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

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

      // Scenario B: Fully Paid (Zero Payment Flow)
      if (data.status === "COMPLETED") {
        Swal.fire({
          icon: "success",
          title: "Order Placed",
          text: data.message || "VM provisioning started successfully.",
          background: "#0e1525",
          color: "#e5e7eb",
          confirmButtonColor: "#6366f1",
        }).then(() => {
          navigate("/orders");
        });
        return;
      }

      // Handle Idempotent Retry or Generic Gateway Redirection (Scenario A & C)
      if (data.paymentUrl && data.paymentUrl !== "PAYTM_QR_FLOW") {
        // If it's Cashfree AND we have a sessionId, use the SDK
        if (gateway === "CASHFREE" && data.paymentSessionId) {
          onCashfreePay(data.paymentSessionId);
          return;
        }
        
        // Otherwise, redirect to the payment URL directly
        window.location.href = data.paymentUrl;
        return;
      }

      // Scenario A: Paytm QR Flow
      if (data.paymentUrl === "PAYTM_QR_FLOW") {
        setQrData({
          upiString: data.upiString,
          paymentId: data.paymentId,
        });
        startPolling(data.paymentId, "PAYTM");
        return;
      }

      // Fallback for Cashfree with SessionId but no paymentUrl field
      if (gateway === "CASHFREE" && data.paymentSessionId) {
        onCashfreePay(data.paymentSessionId);
        return;
      }

      throw new Error("Unexpected payment response format");
    } catch (e) {
      console.error("Payment Start Error:", e);
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