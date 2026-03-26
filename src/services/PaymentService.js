export const createVM = async (body, gateway) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/users/vms/create?gateway=${gateway}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
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
        data?.message ||
        data?.error ||
        `Request failed with status ${res.status}`,
    };
  }

  return data;
};

export const verifyPayment = async (paymentId, gateway) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/payments/${paymentId}/verify?gateway=${gateway}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  return res.json();
};

export const getGateways = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/user/payments/gateways`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
    }
  );

  return res.json();
};

export const walletTopUp = async (amount, gateway) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/api/wallet/top-up?gateway=${gateway}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ amount: Number(amount) }),
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
      message: data?.message || data?.error || `Request failed with status ${res.status}`,
    };
  }

  return data;
};