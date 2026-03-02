import { DollarSign, TrendingUp, Shield } from "lucide-react";

export default function WalletBalances({ balance, cryptoBalance }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-gray-800 rounded-2xl p-6">
        <p className="text-gray-400 text-sm">Fiat Balance</p>
        <h2 className="text-4xl font-bold text-white mt-2">
          ${balance.toFixed(2)}
        </h2>
        <p className="text-green-400 text-sm mt-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          +12.5%
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-gray-800 rounded-2xl p-6">
        <p className="text-gray-400 text-sm">Crypto Balance</p>
        <h2 className="text-3xl font-bold text-white mt-2">
          {cryptoBalance} BTC
        </h2>
      </div>
    </div>
  );
}
