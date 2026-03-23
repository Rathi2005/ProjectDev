import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  X,
  QrCode,
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2, // Add this missing import
} from "lucide-react";

const PaytmQRModal = ({
  qrData,
  onClose,
  onSuccess,
  onExpire,
  stopPolling,
}) => {
  const [qrImage, setQrImage] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState("waiting"); // waiting, processing, success, expired
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    if (qrData?.upiString) {
      QRCode.toDataURL(qrData.upiString, {
        width: 280,
        margin: 2,
        color: {
          dark: "#6366f1",
          light: "#ffffff",
        },
      })
        .then(setQrImage)
        .catch((error) => {
          console.error("Error generating QR code:", error);
        });
    }
  }, [qrData]);

  // Timer for payment expiration
  useEffect(() => {
    if (paymentStatus !== "waiting") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("expired");
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus, onExpire]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const copyUpiId = () => {
    if (qrData?.upiId) {
      navigator.clipboard.writeText(qrData.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenApp = () => {
    if (qrData.upiString) {
      // Try to open UPI app
      window.location.href = qrData.upiString;

      // Fallback: If app doesn't open, show copy UPI ID option
      setTimeout(() => {
        if (document.hasFocus()) {
          // App didn't open, show a toast or something
          console.log("App didn't open automatically");
        }
      }, 2000);
    }
  };

  if (!qrData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-br from-[#121a2a] to-[#0a0f1c] rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-700 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pay with Paytm</h2>
                <p className="text-xs text-gray-400">Scan QR code to pay</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-xl transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Banner */}
          {paymentStatus === "success" && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-sm text-green-400 font-medium">
                  Payment Successful!
                </p>
              </div>
            </div>
          )}

          {paymentStatus === "expired" && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400 font-medium">
                  QR Code Expired. Please try again.
                </p>
              </div>
            </div>
          )}

          {/* Timer */}
          {paymentStatus === "waiting" && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-mono text-white">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-gray-400">remaining</span>
              </div>
            </div>
          )}

          {/* QR Code Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div
                className={`
                p-4 bg-white rounded-2xl shadow-xl transition-all duration-300
              `}
              >
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="Payment QR Code"
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                  </div>
                )}
              </div>

              {paymentStatus === "waiting" && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <div className="bg-indigo-500 rounded-full p-1">
                    <QrCode className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* UPI Details */}
            {qrData.upiId && (
              <div className="mt-5 w-full">
                <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">UPI ID</span>
                    <button
                      onClick={copyUpiId}
                      className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-mono text-white break-all">
                    {qrData.upiId}
                  </p>
                </div>
              </div>
            )}

            {/* Amount */}
            {qrData.amount && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">Amount to Pay</p>
                <p className="text-2xl font-bold text-white">
                  ₹{qrData.amount}
                </p>
              </div>
            )}

            {/* Status Messages */}
            {paymentStatus === "waiting" && (
              <div className="mt-5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-300">
                    Waiting for payment confirmation...
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Open Paytm app, scan QR code, and complete payment
                </p>
              </div>
            )}

            {paymentStatus === "processing" && (
              <div className="mt-5 text-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-300">Verifying payment...</p>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="mt-5 text-center animate-in zoom-in duration-300">
                <div className="inline-flex p-3 bg-green-500/20 rounded-full mb-3">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
                <p className="text-white font-medium">Payment Received!</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your server will be ready shortly
                </p>
              </div>
            )}

            {paymentStatus === "expired" && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => {
                    setPaymentStatus("waiting");
                    setTimeLeft(300);
                    onClose();
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-all"
                >
                  Generate New QR
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {paymentStatus === "waiting" && (
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/30">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleOpenApp}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Paytm App
              </button>
              <button
                onClick={() => {
                  stopPolling?.(); 
                  onClose(); 
                }}
                className="w-full py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium transition-all"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="px-6 py-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaytmQRModal;
