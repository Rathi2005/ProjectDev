import { useState, useMemo, useEffect, useCallback, memo } from "react";
import {
  Wallet,
  Tag,
  Loader2,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";
import PaymentMethodSelector from "./PaymentMethodSelector";

// Memoized components for better performance
const WalletOption = memo(
  ({ useWallet, setUseWallet, walletBalance, walletLoading, disabled }) => (
    <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-700/50 rounded-2xl p-4 hover:border-indigo-500/50 transition-all duration-200">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300" />
      <label className="flex items-center gap-3 cursor-pointer relative">
        <input
          type="checkbox"
          checked={useWallet}
          onChange={(e) => setUseWallet(e.target.checked)}
          disabled={disabled}
          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 focus:ring-2 disabled:opacity-50 transition-all duration-200"
        />
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all duration-200">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Wallet Balance</p>
            <p className="text-sm text-gray-400">
              {walletLoading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Fetching...
                </span>
              ) : (
                <span className="font-mono">₹{walletBalance.toFixed(2)}</span>
              )}
            </p>
          </div>
          {useWallet && (
            <div className="px-2 py-1 bg-indigo-500/20 rounded-lg">
              <span className="text-xs text-indigo-300 font-medium">
                Selected
              </span>
            </div>
          )}
        </div>
      </label>
    </div>
  ),
);

const CouponOption = memo(
  ({
    useCoupon,
    setUseCoupon,
    couponCode,
    setCouponCode,
    couponValidated,
    couponError,
    loading,
    validateCoupon,
    disabled,
  }) => (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-700/50 rounded-2xl p-4 hover:border-green-500/50 transition-all duration-200">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={useCoupon}
          onChange={(e) => setUseCoupon(e.target.checked)}
          disabled={disabled}
          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-0 focus:ring-2 disabled:opacity-50 transition-all duration-200"
        />
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-green-500/10 rounded-xl">
            <Tag className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Apply Coupon</p>
            <p className="text-sm text-gray-400">
              Get discounts with promo code
            </p>
          </div>
        </div>
      </label>

      {useCoupon && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
              }}
              placeholder="Enter coupon code"
              disabled={loading || couponValidated}
              className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
            />
            <button
              onClick={validateCoupon}
              disabled={!couponCode.trim() || loading || couponValidated}
              className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-medium text-white transition-all duration-200 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : couponValidated ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {couponError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-in fade-in duration-200">
              <p className="text-sm text-red-400">{couponError}</p>
            </div>
          )}

          {couponValidated && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-400 font-medium">
                  Coupon successfully applied!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ),
);

const PayButton = memo(({ onClick, disabled, loading, totalAmount }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="relative w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-[position:100%_0] rounded-2xl font-semibold text-white transition-all duration-300 disabled:from-gray-700 disabled:via-gray-800 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl active:scale-[0.98] overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    {loading ? (
      <span className="flex items-center justify-center gap-2 relative">
        <Loader2 className="w-5 h-5 animate-spin" />
        Processing Payment...
      </span>
    ) : (
      <span className="flex items-center justify-center gap-2 relative">
        <CreditCard className="w-5 h-5" />
        Pay ₹{totalAmount.toFixed(2)}
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
      </span>
    )}
  </button>
));

export default function CouponAndWallet({
  totalAmount,
  onCreateSession,
  onInstantSuccess,
  onCouponApply,
  disabled,
  gateway,
  setGateway,
  onClose,
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
    () =>
      disabled || (useCoupon && !couponValidated) || (!useWallet && !gateway),
    [disabled, useCoupon, couponValidated, useWallet, gateway],
  );

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = useCallback(async () => {
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
  }, []);

  const validateCoupon = useCallback(async () => {
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
  }, [couponCode, onCouponApply]);

  const handlePay = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await onCreateSession({
        useWallet,
        couponCode: useCoupon && couponValidated ? couponCode : null,
      });

      if (!res) {
        console.error("No response from onCreateSession");
        return;
      }

      onClose?.();

      if (res?.status === "COMPLETED") {
        if (onInstantSuccess) onInstantSuccess();
        return;
      }

      if (res?.paymentUrl === "PAYTM_QR_FLOW") {
        return;
      }

      if (res?.paymentSessionId) {
        const cashfree = window.Cashfree({
          mode: gateway?.mode?.toLowerCase(),
        });

        cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          redirectTarget: "_self",
          onClose: onInstantSuccess,
        });
      }
    } catch (err) {
      console.error(err);
      setCouponError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    onCreateSession,
    useWallet,
    useCoupon,
    couponValidated,
    couponCode,
    onInstantSuccess,
    gateway,
  ]);

  const handleCouponToggle = useCallback((checked) => {
    setUseCoupon(checked);
    if (!checked) {
      setCouponCode("");
      setCouponValidated(false);
      setCouponError("");
    }
  }, []);

  const handleCouponCodeChange = useCallback((e) => {
    setCouponCode(e.target.value);
    setCouponValidated(false);
    setCouponError("");
  }, []);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Payment Options</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Secure Payment</span>
        </div>
      </div>

      {/* Wallet Option */}
      <WalletOption
        useWallet={useWallet}
        setUseWallet={setUseWallet}
        walletBalance={walletBalance}
        walletLoading={walletLoading}
        disabled={disabled}
      />

      {/* Coupon Option */}
      <CouponOption
        useCoupon={useCoupon}
        setUseCoupon={handleCouponToggle}
        couponCode={couponCode}
        setCouponCode={handleCouponCodeChange}
        couponValidated={couponValidated}
        couponError={couponError}
        loading={loading}
        validateCoupon={validateCoupon}
        disabled={disabled}
      />

      {/* Payment Method Selector */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-700/50 rounded-2xl p-4">
        <PaymentMethodSelector selected={gateway} setSelected={setGateway} />
      </div>

      {/* Pay Button */}
      <PayButton
        onClick={handlePay}
        disabled={payDisabled}
        loading={loading}
        totalAmount={totalAmount}
      />

      {/* Payment Note */}
      <div className="text-center space-y-1">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <button className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Terms of Service
          </button>
        </p>
      </div>
    </div>
  );
}
