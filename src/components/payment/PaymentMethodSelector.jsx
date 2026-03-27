import { useEffect, useState, useCallback, useMemo } from "react";
import { getGateways } from "../../services/PaymentService";
import {
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  CircleDollarSign,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  Circle,
} from "lucide-react";

const PaymentMethodSelector = ({ selected, setSelected }) => {
  const [gateways, setGateways] = useState([]);
  const [hoveredGateway, setHoveredGateway] = useState(null);

  useEffect(() => {
    getGateways().then((res) => {
      setGateways(res);
    });
  }, []);

  // Memoize gateway details function to prevent recreation
  const getGatewayDetails = useCallback((gateway) => {
    const gatewayLower = (gateway.type || "").toLowerCase();
    if (gatewayLower.includes("stripe") || gatewayLower.includes("card")) {
      return {
        icon: CreditCard,
        color: "text-blue-400",
        bgColor: "bg-blue-900/20",
        borderColor: "hover:border-blue-500",
        label: "Credit/Debit Card",
      };
    }
    if (gatewayLower.includes("paypal")) {
      return {
        icon: CircleDollarSign,
        color: "text-blue-500",
        bgColor: "bg-blue-900/20",
        borderColor: "hover:border-blue-500",
        label: "PayPal",
      };
    }
    if (gatewayLower.includes("razorpay")) {
      return {
        icon: Zap,
        color: "text-indigo-400",
        bgColor: "bg-indigo-900/20",
        borderColor: "hover:border-indigo-500",
        label: "Razorpay",
      };
    }
    if (gatewayLower.includes("phonepe")) {
      return {
        icon: Smartphone,
        color: "text-purple-400",
        bgColor: "bg-purple-900/20",
        borderColor: "hover:border-purple-500",
        label: "PhonePe",
      };
    }
    if (gatewayLower.includes("googlepay") || gatewayLower.includes("gpay")) {
      return {
        icon: Smartphone,
        color: "text-green-400",
        bgColor: "bg-green-900/20",
        borderColor: "hover:border-green-500",
        label: "Google Pay",
      };
    }
    if (gatewayLower.includes("paytm")) {
      return {
        icon: Wallet,
        color: "text-cyan-400",
        bgColor: "bg-cyan-900/20",
        borderColor: "hover:border-cyan-500",
        label: "Paytm",
      };
    }
    if (gatewayLower.includes("bank") || gatewayLower.includes("netbanking")) {
      return {
        icon: Banknote,
        color: "text-emerald-400",
        bgColor: "bg-emerald-900/20",
        borderColor: "hover:border-emerald-500",
        label: "Net Banking",
      };
    }
    if (gatewayLower.includes("crypto")) {
      return {
        icon: Shield,
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/20",
        borderColor: "hover:border-yellow-500",
        label: "Cryptocurrency",
      };
    }
    return {
      icon: CreditCard,
      color: "text-gray-400",
      bgColor: "bg-gray-800",
      borderColor: "hover:border-gray-500",
      label: gateway.name || gateway.type,
    };
  }, []);

  // Memoize description text getter
  const getDescriptionText = useCallback((gateway) => {
    const gatewayLower = (gateway.type || "").toLowerCase();
    if (gatewayLower.includes("card")) return "Pay with credit/debit card";
    if (gatewayLower.includes("paypal")) return "Fast & secure payments";
    if (gatewayLower.includes("phone")) return "Scan & pay with UPI";
    if (gatewayLower.includes("bank")) return "All major banks supported";
    return "Secure & instant payment";
  }, []);

  // Memoize handlers to prevent recreation
  const handleGatewayChange = useCallback(
    (gateway) => {
      setSelected((prev) => (prev === gateway ? null : gateway));
    },
    [setSelected],
  );

  const handleMouseEnter = useCallback((gateway) => {
    setHoveredGateway(gateway);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredGateway(null);
  }, []);

  // Memoize the rendered gateways list to prevent unnecessary re-renders
  const renderedGateways = useMemo(() => {
    if (gateways.length === 0) return null;

    return gateways.map((gateway) => {
      const gatewayType = gateway.type;
      const {
        icon: Icon,
        color,
        bgColor,
        borderColor,
        label,
      } = getGatewayDetails(gateway);
      const isSelected = selected === gatewayType;
      const isHovered = hoveredGateway === gatewayType;
      const descriptionText = getDescriptionText(gateway);

      return (
        <label
          key={gatewayType}
          className={`
            relative flex items-center gap-3 p-4 rounded-xl cursor-pointer
            transition-all duration-200 ease-in-out
            ${bgColor} bg-opacity-50
            border-2 
            ${
              isSelected
                ? `border-indigo-500 bg-indigo-900/20 shadow-lg shadow-indigo-500/10`
                : `border-gray-700 ${borderColor}`
            }
            ${isHovered && !isSelected ? "border-gray-600 bg-gray-800/50" : ""}
            hover:scale-[1.02] active:scale-[0.98]
          `}
          onMouseEnter={() => handleMouseEnter(gatewayType)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative">
            <input
              type="radio"
              name="payment-method"
              value={gatewayType}
              checked={isSelected}
              onChange={() => {}}
              onClick={() => handleGatewayChange(gatewayType)}
              className="peer sr-only"
            />
            <div
              className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${
                isSelected
                  ? "border-indigo-500 bg-indigo-500"
                  : "border-gray-500 bg-transparent"
              }
            `}
            >
              {isSelected && (
                <Circle className="w-3 h-3 text-white fill-current" />
              )}
            </div>
          </div>

          <div className={`p-2 rounded-lg ${bgColor} bg-opacity-100`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium text-white ${isSelected ? "text-indigo-300" : ""}`}
              >
                {label}
              </span>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-indigo-400 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{descriptionText}</p>
          </div>
        </label>
      );
    });
  }, [
    gateways,
    selected,
    hoveredGateway,
    getGatewayDetails,
    getDescriptionText,
    handleGatewayChange,
    handleMouseEnter,
    handleMouseLeave,
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-gray-300">
            Select Payment Method
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Secure Payment</span>
        </div>
      </div>

      {gateways.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500">Loading payment options...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">{renderedGateways}</div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
