import { apiFetch } from "../api/api.js";

// CAMBIO: Recibimos 'email' en lugar de 'username'
export const login = async (email, password) => {
  
  const data = await apiFetch("/auth/login", {
    method: "POST",
    // CAMBIO CRÍTICO: Enviamos la clave "email" que espera tu nueva BD
    body: JSON.stringify({ 
        email: email, 
        password: password 
    })
  });

  // Guardamos sesión
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};