const BASE_URL = "http://localhost:3000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE_URL + endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Error API");
  }

  return res.json();
};
