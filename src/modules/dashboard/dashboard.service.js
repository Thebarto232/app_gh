import { apiFetch } from "../../core/api/api.js";

export const getDashboardData = async () => {
  return await apiFetch("/dashboard");
};
