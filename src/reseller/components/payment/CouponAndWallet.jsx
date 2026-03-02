import { useState, useMemo, useEffect } from "react";
import { Wallet, Tag, Loader2, CreditCard, CheckCircle } from "lucide-react";

export default function CouponAndWallet({
  totalAmount,
  onCreateSession,
  onInstantSuccess,
  onCouponApply,
  disabled,
}) {
  const [useWallet, setUseWallet] = useState(false);
  const [useCoupon, setUseCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidated, setCouponValidated] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  const payDisabled = useMemo(
    () => disabled || (useCoupon && !couponValidated),
    [disabled, useCoupon, couponValidated],
  );

  useEffect(() => {
      fetchWalletBalance();
  },[]);

  const fetchWalletBalance = async () => {
    setWalletLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/wallet`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setWalletBalance(Number(data.balance || 0));
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
    } finally {
      setWalletLoading(false);
    }
  };


  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    try {
      await onCouponApply(couponCode.trim());

      setCouponValidated(true);
      setCouponError("");
    } catch (err) {
      setCouponValidated(false);
      setCouponError(err.message || "Invalid coupon code");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const paymentSessionId = await onCreateSession({
        useWallet,
        couponCode: useCoupon && couponValidated ? couponCode : null,
      });

      if (!paymentSessionId) {
        onInstantSuccess();
        return;
      }

      const cashfree = window.Cashfree({
        mode:
          import.meta.env.VITE_CASHFREE_MODE === "production"
            ? "production"
            : "sandbox",
      });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
        onClose: onInstantSuccess,
      });
    } catch (err) {
      setCouponError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Wallet Option */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useWallet}
            onChange={(e) => setUseWallet(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 accent-indigo-600 disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="font-medium text-white">Use Wallet Balance</p>
              <p className="text-sm text-gray-400">
                {walletLoading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching balance...
                  </span>
                ) : (
                  `Available: ₹${walletBalance.toFixed(2)}`
                )}
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Coupon Option */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={useCoupon}
            onChange={(e) => {
              const checked = e.target.checked;
              setUseCoupon(checked);
              if (!checked) {
                setCouponCode("");
                setCouponValidated(false);
                setCouponError("");
              }
            }}
            disabled={disabled}
            className="w-5 h-5 accent-indigo-600 disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-medium text-white">Apply Coupon</p>
              <p className="text-sm text-gray-400">
                Enter promo code for discount
              </p>
            </div>
          </div>
        </label>

        {useCoupon && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponValidated(false);
                  setCouponError("");
                }}
                placeholder="Enter coupon code"
                disabled={loading || couponValidated}
                className="flex-1 bg-[#0a0f1c] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                onClick={validateCoupon}
                disabled={!couponCode.trim() || loading || couponValidated}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                ) : couponValidated ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                ) : (
                  "Apply"
                )}
              </button>
            </div>

            {couponError && (
              <p className="text-sm text-red-400">{couponError}</p>
            )}

            {couponValidated && (
              <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
                <p className="text-sm text-green-400 font-medium">
                  ✓ Coupon successfully applied
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={payDisabled || loading}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold text-white transition-all duration-300 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay ₹{totalAmount.toFixed(2)}
          </span>
        )}
      </button>

      {/* Payment Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our Terms of Service
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Secure payment powered by Cashfree
        </p>
      </div>
    </div>
  );
}
