export function useVmActions(BASE_URL) {
  const [loading, setLoading] = useState({});

  async function power(orderId, action) {
    const token = localStorage.getItem("adminToken");
    setLoading(p => ({ ...p, [orderId]: action }));

    await fetch(
      `${BASE_URL}/admin/vms/order/${orderId}/power?action=${action}`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );

    setLoading(p => ({ ...p, [orderId]: null }));
  }

  async function destroy(orderId) {
    const token = localStorage.getItem("adminToken");
    await fetch(
      `${BASE_URL}/admin/vms/order/${orderId}/remove`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
  }

  return { power, destroy, loading };
}
