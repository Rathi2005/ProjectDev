import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function WalletTransactions({ transactions }) {
  return (
    <div className="space-y-4">
      {transactions.map(tx => (
        <div
          key={tx.id}
          className="flex justify-between p-3 rounded-xl hover:bg-gray-900/30"
        >
          <div>
            <p className="text-white font-medium">{tx.description}</p>
            <p className="text-xs text-gray-400">{tx.date}</p>
          </div>
          <div className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
            {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
