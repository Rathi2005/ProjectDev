import { useEffect, useState } from "react";
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
  Radio,
  CheckCircle2,
} from "lucide-react";

const PaymentMethodSelector = ({ selected, setSelected }) => {
  const [gateways, setGateways] = useState([]);
  const [hoveredGateway, setHoveredGateway] = useState(null);

  useEffect(() => {
    getGateways().then((res) => {
      setGateways(res);
    });
  }, []);

  // Map gateway names to icons and colors
  const getGatewayDetails = (gateway) => {
    const gatewayLower = gateway.toLowerCase();
    
    if (gatewayLower.includes("stripe") || gatewayLower.includes("card")) {
      return {
        icon: CreditCard,
        color: "text-blue-400",
        bgColor: "bg-blue-900/20",
        borderColor: "hover:border-blue-500",
        label: "Credit/Debit Card"
      };
    }
    if (gatewayLower.includes("paypal")) {
      return {
        icon: CircleDollarSign,
        color: "text-blue-500",
        bgColor: "bg-blue-900/20",
        borderColor: "hover:border-blue-500",
        label: "PayPal"
      };
    }
    if (gatewayLower.includes("razorpay")) {
      return {
        icon: Zap,
        color: "text-indigo-400",
        bgColor: "bg-indigo-900/20",
        borderColor: "hover:border-indigo-500",
        label: "Razorpay"
      };
    }
    if (gatewayLower.includes("phonepe")) {
      return {
        icon: Smartphone,
        color: "text-purple-400",
        bgColor: "bg-purple-900/20",
        borderColor: "hover:border-purple-500",
        label: "PhonePe"
      };
    }
    if (gatewayLower.includes("googlepay") || gatewayLower.includes("gpay")) {
      return {
        icon: Smartphone,
        color: "text-green-400",
        bgColor: "bg-green-900/20",
        borderColor: "hover:border-green-500",
        label: "Google Pay"
      };
    }
    if (gatewayLower.includes("paytm")) {
      return {
        icon: Wallet,
        color: "text-cyan-400",
        bgColor: "bg-cyan-900/20",
        borderColor: "hover:border-cyan-500",
        label: "Paytm"
      };
    }
    if (gatewayLower.includes("bank") || gatewayLower.includes("netbanking")) {
      return {
        icon: Banknote,
        color: "text-emerald-400",
        bgColor: "bg-emerald-900/20",
        borderColor: "hover:border-emerald-500",
        label: "Net Banking"
      };
    }
    if (gatewayLower.includes("crypto")) {
      return {
        icon: Shield,
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/20",
        borderColor: "hover:border-yellow-500",
        label: "Cryptocurrency"
      };
    }
    return {
      icon: CreditCard,
      color: "text-gray-400",
      bgColor: "bg-gray-800",
      borderColor: "hover:border-gray-500",
      label: gateway
    };
  };

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
        <div className="grid grid-cols-1 gap-3">
          {gateways.map((gateway) => {
            const { icon: Icon, color, bgColor, borderColor, label } = getGatewayDetails(gateway);
            const isSelected = selected === gateway;
            const isHovered = hoveredGateway === gateway;

            return (
              <label
                key={gateway}
                className={`
                  relative flex items-center gap-3 p-4 rounded-xl cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${bgColor} bg-opacity-50
                  border-2 
                  ${isSelected 
                    ? `border-indigo-500 bg-indigo-900/20 shadow-lg shadow-indigo-500/10` 
                    : `border-gray-700 ${borderColor}`
                  }
                  ${isHovered && !isSelected ? 'border-gray-600 bg-gray-800/50' : ''}
                  hover:scale-[1.02] active:scale-[0.98]
                `}
                onMouseEnter={() => setHoveredGateway(gateway)}
                onMouseLeave={() => setHoveredGateway(null)}
              >
                <div className="relative">
                  <input
                    type="radio"
                    name="payment-method"
                    value={gateway}
                    checked={isSelected}
                    onChange={() => setSelected(gateway)}
                    className="peer sr-only"
                  />
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all duration-200
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-gray-500 bg-transparent'
                    }
                  `}>
                    {isSelected && <Radio className="w-3 h-3 text-white" />}
                  </div>
                </div>

                <div className={`p-2 rounded-lg ${bgColor} bg-opacity-100`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-white ${isSelected ? 'text-indigo-300' : ''}`}>
                      {label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {gateway.toLowerCase().includes("card") && "Pay with credit/debit card"}
                    {gateway.toLowerCase().includes("paypal") && "Fast & secure payments"}
                    {gateway.toLowerCase().includes("phone") && "Scan & pay with UPI"}
                    {gateway.toLowerCase().includes("bank") && "All major banks supported"}
                    {!gateway.toLowerCase().includes("card") && 
                     !gateway.toLowerCase().includes("paypal") && 
                     !gateway.toLowerCase().includes("phone") && 
                     !gateway.toLowerCase().includes("bank") && 
                     "Secure & instant payment"}
                  </p>
                </div>

                {isSelected && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></div>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;