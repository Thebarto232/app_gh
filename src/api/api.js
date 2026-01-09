const BASE_URL = "http://localhost:3000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  // Fusionamos los headers por defecto con los que vengan en options
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };

  // Preparamos la configuración final
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers // Si options trae headers, los agrega sin borrar el token
    }
  };

  try {
    const res = await fetch(BASE_URL + endpoint, config);

    // Si el backend responde error (ej: 401 No autorizado, 500 Error server)
    if (!res.ok) {
      // Intentamos leer el mensaje JSON del backend
      let errorMessage = "Error en la petición API";
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, leemos texto plano
        errorMessage = res.statusText;
      }
      
      // Si el error es 401 (Token inválido), sacamos al usuario
      if (res.status === 401) {
          console.warn("Sesión caducada. Redirigiendo al login...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/"; // Forzar recarga al login
          return;
      }

      throw new Error(errorMessage);
    }

    // Si no hay contenido (ej: 204 No Content), retornamos null
    if (res.status === 204) return null;

    return await res.json();
    
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error; // Re-lanzamos para que el componente lo maneje
  }
};