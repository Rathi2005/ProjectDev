export const retryPayment = async (orderId, gateway, useWallet) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/user/payments/${orderId}/retry?gateway=${gateway}&useWalletBalance=${useWallet}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw {
      status: res.status,
      message:
        data?.error ||
        data?.message ||
        `Request failed with status ${res.status}`,
    };
  }

  return data;
};