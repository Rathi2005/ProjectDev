import { useState } from "react";
import Swal from "sweetalert2";

const DarkSwal = Swal.mixin({
  background: "#1e2640",
  color: "#ffffff",
  confirmButtonColor: "#6366f1",
  cancelButtonColor: "#4b5563",
});

export default function ResellerActionButton({
  user,
  BASE_URL,
  onUpgrade,
  onSuccess
}) {

  const [loading, setLoading] = useState(false);

  const revokeReseller = async () => {

    const confirm = await DarkSwal.fire({
      title: "Revoke Reseller?",
      text: "This will delete domain and proxy configuration.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Revoke"
    });

    if (!confirm.isConfirmed) return;

    try {

      setLoading(true);

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${BASE_URL}/api/admin/resellers/${user.id}/revoke`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to revoke reseller");
      }

      await DarkSwal.fire(
        "Success",
        data.message,
        "success"
      );

      onSuccess(); // reload table

    } catch (err) {

      DarkSwal.fire(
        "Error",
        err.message,
        "error"
      );

    } finally {
      setLoading(false);
    }
  };

  // USER IS RESELLER → SHOW REVOKE
  if (user.reseller) {
    return (
      <button
        disabled={loading}
        onClick={revokeReseller}
        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
      >
        {loading ? "Revoking..." : "Revoke"}
      </button>
    );
  }

  // USER NOT RESELLER → SHOW UPGRADE
  return (
    <button
      onClick={() => onUpgrade(user)}
      className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 rounded"
    >
      Upgrade
    </button>
  );
}