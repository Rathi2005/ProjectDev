import { Plus, Upload, QrCode } from "lucide-react";

export default function WalletActions({
  onAddFunds,
  onWithdraw,
  onCryptoDeposit,
}) {
  return (
    <div className="bg-[#121a2a] border border-gray-800 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={onAddFunds}>Add Funds</button>
        <button onClick={onWithdraw}>Withdraw</button>
        <button onClick={onCryptoDeposit}>Crypto</button>
      </div>
    </div>
  );
}
