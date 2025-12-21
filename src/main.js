import './style.css'
import { login } from "./auth/login";
import { getEmpleados, createEmpleado } from "./empleados/empleados";

// LOGIN automático (prueba)
const init = async () => {
  try {
    const user = await login("admin", "admin123");
    console.log("Logueado como:", user);

    const empleados = await getEmpleados();
    console.log("Empleados:", empleados);

    const nuevo = await createEmpleado({
      documento: "555",
      nombres: "Pedro",
      apellidos: "Ramirez"
    });

    console.log("Empleado creado:", nuevo);
  } catch (error) {
    console.error(error.message);
  }
};

init();
