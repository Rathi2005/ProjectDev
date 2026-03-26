import React, { memo, useState, useCallback } from "react";
import { IndianRupee } from "lucide-react";
import CouponAndWallet from "./CouponAndWallet";
import PaymentMethodSelector from "./PaymentMethodSelector";

const PaymentModal = memo(function PaymentModal({
  open,
  onClose,
  priceBreakdown,
  priceLoading,
  onCreateSession,
  onCouponApply,
}) {
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN
  const [gateway, setGateway] = useState("CASHFREE");

  const handleCreateSessionWithGateway = useCallback(
    (data) => {
      return onCreateSession({
        ...data,
        gateway,
      });
    },
    [onCreateSession, gateway],
  );

  // ✅ Early return AFTER all hooks
  if (!open || !priceBreakdown) return null;

  return (
    <div
      className="
  fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm
  flex items-center justify-center p-4
  transition-opacity duration-200 ease-out
"
    >
      <div
        className="
  bg-gradient-to-b from-[#0e1525] to-[#151c2f]
  w-full max-w-md rounded-xl
  border border-indigo-900/50
  shadow-2xl shadow-indigo-900/20
  overflow-hidden
  transform transition-transform duration-200 ease-out
  scale-100
"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-indigo-900/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-900/30 rounded-lg">
              <IndianRupee className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Complete Payment</h2>
              <p className="text-sm text-gray-400">
                Complete your upgrade securely
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Payment Summary */}
          {priceBreakdown && (
            <div className="mt-3 space-y-2 text-sm text-gray-400 mb-4">
              {" "}
              <div className="flex justify-between">
                <span>Original Amount</span>
                <span>₹{priceBreakdown.originalAmount.toFixed(2)}</span>
              </div>
              {priceBreakdown.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>
                    Discount{" "}
                    {priceBreakdown.couponCode &&
                      `(${priceBreakdown.couponCode})`}
                  </span>
                  <span>- ₹{priceBreakdown.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.unusedCreditAdjusted > 0 && (
                <div className="flex justify-between text-indigo-300">
                  <span>Wallet Credit</span>
                  <span>
                    - ₹{priceBreakdown.unusedCreditAdjusted.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-white border-t border-indigo-900/30 pt-3">
                {" "}
                <span>Final Payable</span>
                <span>₹{priceBreakdown.payableAmount.toFixed(2)}</span>
              </div>
              {priceBreakdown.couponStatus === "APPLIED" && (
                <p className="text-green-400 text-xs mt-1">
                  Coupon applied successfully
                </p>
              )}
            </div>
          )}

          {/* CouponAndWallet Component */}
          <CouponAndWallet
            totalAmount={priceBreakdown.originalAmount}
            disabled={priceLoading}
            onCouponApply={onCouponApply}
            gateway={gateway}
            setGateway={setGateway}
            onCreateSession={handleCreateSessionWithGateway}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
});

export default PaymentModal;
