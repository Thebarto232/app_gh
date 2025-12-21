import { getDashboardData } from "./dashboard.service.js";

const initDashboard = async () => {
  try {
    const data = await getDashboardData();

    document.getElementById("totalEmpleados").textContent =
      data?.totalEmpleados ?? 0;

    document.getElementById("totalUsuarios").textContent =
      data?.totalUsuarios ?? 0;

    document.getElementById("empleadosActivos").textContent =
      data?.empleadosActivos ?? 0;

  } catch (error) {
    console.error("Error cargando dashboard", error);
    document.querySelector(".dashboard").innerHTML =
      "<p>Error al cargar información del dashboard</p>";
  }
};

// Acciones rápidas (mejor práctica)
const goToModule = (label) => {
  const items = [...document.querySelectorAll(".sidebar li")];
  const target = items.find(li => li.textContent === label);
  target?.click();
};

document.getElementById("btnEmpleados")?.addEventListener("click", () => {
  goToModule("Empleados");
});

document.getElementById("btnUsuarios")?.addEventListener("click", () => {
  goToModule("Usuarios");
});

// Esperar DOM
document.addEventListener("DOMContentLoaded", initDashboard);
