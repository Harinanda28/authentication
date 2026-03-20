const API_URL = "http://localhost:5000/api/dashboard";

export const fetchDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  return res.json();
};

export const fetchDashboardTrends = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/trends`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch trends");
  }

  return res.json();
};