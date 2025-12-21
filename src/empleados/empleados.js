import { apiFetch } from "../api/api";

export const getEmpleados = async () => {
  return await apiFetch("/empleados");
};

export const createEmpleado = async (empleado) => {
  return await apiFetch("/empleados", {
    method: "POST",
    body: JSON.stringify(empleado)
  });
};
