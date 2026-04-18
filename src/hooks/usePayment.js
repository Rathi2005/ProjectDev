/**
 * usePayment hook — VM purchase + payment verification polling.
 *
 * D-1 CRITICAL FIX (Payment Verification):
 * Old behavior: `verifyPayment()` returned `res.json()` without checks.
 *   If server returned {} or HTML, `res.status !== "PENDING"` was truthy
 *   → false "Payment successful" toast shown to user.
 *
 * New behavior:
 *   1. verifyPayment() validates response has `status` field (ApiError if not)
 *   2. This hook explicitly checks for CONFIRMED/SUCCESS states
 *   3. ApiError from verifyPayment stops polling with error toast
 *   4. Network errors stop polling (no infinite retries)
 *
 * Error handling:
 *   - showError checks both Error instances and legacy { status, message } objects
 *   - All errors are surfaced to user via toast
 */

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
    if (e?.status >= 500) return "Server error.";
    if (e instanceof TypeError) return "Network error.";
    return e?.message || "Something went wrong.";
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (paymentId, gateway) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
      if (!paymentId) {
        console.error("Cannot start polling: paymentId is undefined");
        return;
      }

      let attempts = 0;
      const maxAttempts = 100; // ~5 mins at 3s interval

      pollRef.current = setInterval(async () => {
        try {
          if (attempts >= maxAttempts) {
            stopPolling();
            setQrData(null);
            toast("Payment not confirmed yet. You can retry.");
            return;
          }

          attempts++;
          
          // verifyPayment now throws ApiError on:
          // - HTTP errors (4xx/5xx)
          // - Non-JSON responses
          // - Missing `status` field in response
          const res = await verifyPayment(paymentId, gateway);

          const successStates = ["SUCCESS", "COMPLETED", "PAID", "WALLET_TOPPED_UP", "PAID_AND_PROVISIONING"];
          const failureStates = ["FAILED", "CANCELLED", "EXPIRED"];

          if (successStates.includes(res.status)) {
            stopPolling();
            setQrData(null);
            toast.success("Payment successful");
            navigate("/orders");
            return;
          }

          if (failureStates.includes(res.status)) {
            stopPolling();
            setQrData(null);
            toast.error(`Payment ${res.status.toLowerCase()}`);
            return;
          }
        } catch (err) {
          // D-1 FIX: API errors STOP polling and SHOW the error.
          console.error("Payment polling failed:", err);
          stopPolling();
          setQrData(null);
          toast.error(showError(err));
        }
      }, 3000);
    },
    [stopPolling, navigate, showError],
  );

  const startPayment = useCallback(
    async (serverConfig, gateway, onCashfreePay) => {
      setLoading(true);
      console.log(
        "Starting payment with config:",
        serverConfig,
        "and gateway:",
        gateway?.type,
      );
      try {
        const data = await createVM(serverConfig, gateway?.type);

        // Case 1: Wallet full
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
          if (gateway?.type === "CASHFREE" && data.paymentSessionId) {
            onCashfreePay(data.paymentSessionId);
            return;
          }

          // Otherwise, redirect to the payment URL directly
          window.location.href = data.paymentUrl;
          return;
        }

        // Scenario A: Paytm QR Flow
        if (data.paymentUrl === "PAYTM_QR_FLOW") {
          // IMPORTANT: paymentSessionId is a session string (e.g. "BULK-..."), NOT a numeric ID.
          // The verify endpoint /api/payments/{paymentId}/verify expects a numeric Long.
          // Only use fields that contain the numeric database payment ID.
          const resolvedPaymentId = data.paymentId || data.id || data.orderId;
          
          setQrData({
            upiString: data.upiString,
            paymentId: resolvedPaymentId,
            // ✅ amount added — PaytmQRModal needs this to display ₹ value
            amount: data.remainingToPay ?? data.amount,
          });
          
          if (resolvedPaymentId) {
            startPolling(resolvedPaymentId, "PAYTM");
          } else {
            console.error("No payment ID found in createVM response", data);
            toast.error("Could not initiate payment tracking.");
          }
          return;
        }

        // Case 3: Cashfree
        if (gateway?.type === "CASHFREE" && data.paymentSessionId) {
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
    },
    [navigate, startPolling, showError],
  );

  return {
    startPayment,
    qrData,
    setQrData,
    loading,
    startPolling,
    stopPolling,
  };
};
