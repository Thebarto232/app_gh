import { apiFetch } from "../../api/api.js";

// --- SERVICIOS API ---
export const getEmpleados = async () => await apiFetch("/empleados");

export const createEmpleado = async (empleado) => {
    return await apiFetch("/empleados", {
        method: "POST",
        body: JSON.stringify(empleado)
    });
};

export const getHijos = async (cedula) => await apiFetch(`/empleados/hijos/${cedula}`);

export const createHijo = async (hijoData) => {
    return await apiFetch("/empleados/hijos", {
        method: "POST",
        body: JSON.stringify(hijoData)
    });
};

// Variable global para filtrar en tiempo real
let empleadosData = [];

// --- INICIALIZACIÓN ---
export const initModuloEmpleados = async () => {
    const modal = document.getElementById('modalEmpleado');
    const form = document.getElementById('formEmpleado');
    const inputBusqueda = document.getElementById('inputBusqueda');
    const btnNuevo = document.getElementById('btnNuevoEmpleado');
    const btnCerrar = document.getElementById('btnCerrarEmpleado');

    // Cargar selectores del formulario (Deptos, Areas, etc.)
    await loadFormSelectors();

    // Control de Modal
    if (btnNuevo) btnNuevo.onclick = () => modal.classList.remove('hidden');
    if (btnCerrar) btnCerrar.onclick = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    // Buscador en tiempo real (Cédula o Nombre)
    if (inputBusqueda) {
        inputBusqueda.onkeyup = (e) => {
            const term = e.target.value.toLowerCase();
            const filtrados = empleadosData.filter(emp => 
                emp.id_cedula.toLowerCase().includes(term) || 
                emp.apellidos_nombre.toLowerCase().includes(term)
            );
            renderTabla(filtrados);
        };
    }

    // Registro de nuevo empleado
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const nuevoEmpleado = {
                id_cedula: document.getElementById('id_cedula').value,
                apellidos_nombre: document.getElementById('apellidos_nombre').value,
                fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
                fecha_ingreso: document.getElementById('fecha_ingreso').value,
                fk_id_depto: document.getElementById('fk_id_depto').value,
                fk_id_area: document.getElementById('fk_id_area').value,
                fk_id_perfil: document.getElementById('fk_id_perfil').value,
                fk_id_eps: document.getElementById('fk_id_eps').value,
                fk_id_pension: document.getElementById('fk_id_pension').value,
                fk_id_nivel: document.getElementById('fk_id_nivel').value,
                fk_id_profesion: document.getElementById('fk_id_profesion').value
            };

            const result = await createEmpleado(nuevoEmpleado);
            if (result) {
                alert("Colaborador guardado exitosamente");
                modal.classList.add('hidden');
                form.reset();
                await cargarYRenderizar(); 
            }
        };
    }

    await cargarYRenderizar();
};

// --- CARGA DE SELECTORES ---
const loadFormSelectors = async () => {
    try {
        const [deptos, eps, pensiones, areas, perfiles, niveles, profesiones] = await Promise.all([
            apiFetch("/dashboard/catalogos/departamentos"),
            apiFetch("/dashboard/catalogos/eps"),
            apiFetch("/dashboard/catalogos/pensiones"),
            apiFetch("/dashboard/catalogos/areas"),
            apiFetch("/dashboard/catalogos/perfiles"),
            apiFetch("/dashboard/catalogos/niveles"),
            apiFetch("/dashboard/catalogos/profesiones")
        ]);

        const fill = (id, data) => {
            const select = document.getElementById(id);
            if (select && data) {
                select.innerHTML = `<option value="">Seleccione...</option>`;
                data.forEach(item => {
                    select.innerHTML += `<option value="${item.id}">${item.nombre}</option>`;
                });
            }
        };

        fill('fk_id_depto', deptos);
        fill('fk_id_eps', eps);
        fill('fk_id_pension', pensiones);
        fill('fk_id_area', areas);
        fill('fk_id_perfil', perfiles);
        fill('fk_id_nivel', niveles);
        fill('fk_id_profesion', profesiones);
    } catch (error) {
        console.error("Error cargando catálogos:", error);
    }
};

// --- GESTIÓN DE HIJOS (WINDOW) ---
window.verDetalleEmpleado = async (cedula, nombre) => {
    const modalDetalle = document.getElementById('modalDetalle');
    const contenedorHijos = document.getElementById('listaHijosDetalle');
    const tituloFicha = document.getElementById('tituloFicha');
    
    if (tituloFicha) tituloFicha.innerText = `Ficha: ${nombre}`;
    if (contenedorHijos) contenedorHijos.innerHTML = "<p class='p-2 animate-pulse text-blue-500'>Cargando...</p>";
    
    modalDetalle.classList.remove('hidden');

    const hijos = await getHijos(cedula);
    
    contenedorHijos.innerHTML = hijos.length > 0 
        ? hijos.map(h => `
            <div class="flex justify-between items-center p-3 border-b border-gray-100 text-sm hover:bg-white transition-all">
                <div>
                    <span class="font-bold text-gray-700 block">${h.nombre_hijo}</span>
                    <span class="text-[10px] text-gray-400 uppercase font-black">${h.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
                </div>
                <span class="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded">${h.fecha}</span>
            </div>`).join('')
        : '<p class="text-gray-400 text-sm p-5 text-center italic">No hay registros familiares.</p>';
    
    document.getElementById('formHijo').setAttribute('data-padre', cedula);
};

window.agregarHijoRapido = async () => {
    const formHijo = document.getElementById('formHijo');
    const cedulaPadre = formHijo.getAttribute('data-padre');
    const inputNombre = document.getElementById('h_nombre');
    const inputFecha = document.getElementById('h_fecha');
    const inputGen = document.getElementById('h_genero');

    const data = {
        nombre_hijo: inputNombre.value.trim(),
        fecha_nacimiento: inputFecha.value,
        genero: inputGen.value,
        fk_id_cedula_padre: cedulaPadre
    };

    if (!data.nombre_hijo || !data.fecha_nacimiento) {
        alert("Complete el nombre y fecha del menor");
        return;
    }

    const res = await createHijo(data);
    if (res) {
        inputNombre.value = "";
        const nombreEmp = document.getElementById('tituloFicha').innerText.replace('Ficha: ', '');
        window.verDetalleEmpleado(cedulaPadre, nombreEmp);
    }
};

// --- RENDERIZADO ---
async function cargarYRenderizar() {
    empleadosData = await getEmpleados();
    renderTabla(empleadosData);
}

function renderTabla(data) {
    const lista = document.getElementById('listaEmpleados');
    if (!lista) return;

    lista.innerHTML = data.map(emp => `
        <tr class="hover:bg-blue-50/40 transition-colors group border-b border-gray-50 last:border-0">
            <td class="px-6 py-5 text-gray-500 font-mono text-sm font-medium">${emp.id_cedula}</td>
            <td class="px-6 py-5">
                <div class="font-bold text-gray-900 text-sm capitalize">${emp.apellidos_nombre.toLowerCase()}</div>
                <div class="text-[10px] text-gray-400 font-medium">Ingreso: ${emp.fecha_ingreso || 'N/A'}</div>
            </td>
            <td class="px-6 py-5">
                <div class="text-sm font-bold text-gray-800">${emp.nombre_departamento || 'No asignado'}</div>
                <div class="text-[10px] text-gray-400 font-black uppercase tracking-tighter">${emp.nombre_area || 'S/A'}</div>
            </td>
            <td class="px-6 py-5 text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${emp.estado_empleado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    <span class="w-1.5 h-1.5 rounded-full mr-2 ${emp.estado_empleado === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'}"></span>
                    ${emp.estado_empleado}
                </span>
            </td>
            <td class="px-6 py-5 text-right">
                <button onclick="verDetalleEmpleado('${emp.id_cedula}', '${emp.apellidos_nombre}')" 
                        class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-bold text-xs shadow-sm">
                    Ver Ficha
                </button>
            </td>
        </tr>
    `).join('');
}