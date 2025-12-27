import { apiFetch } from "../api/api.js";

export const register = async (username, password, fk_id_rol) => {
    try {
        const data = await apiFetch("/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, password, fk_id_rol })
        });
        return data;
    } catch (error) {
        throw error;
    }
};