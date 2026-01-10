import { apiFetch } from "../../api/api.js";

// =========================================================
// 1. SERVICIOS API
// =========================================================
export const getEmpleados = async () => await apiFetch("/empleados");
export const createEmpleado = async (emp) => await apiFetch("/empleados", { method: "POST", body: JSON.stringify(emp) });
export const getHijos = async (cedula) => await apiFetch(`/empleados/hijos/${cedula}`);
export const createHijo = async (hijo) => await apiFetch("/empleados/hijos", { method: "POST", body: JSON.stringify(hijo) });

let empleadosData = [];

// =========================================================
// 2. INICIALIZAR
// =========================================================
export const initModuloEmpleados = async () => {
    // Cargar Catálogos
    await loadFormSelectors();

    // Configurar el Botón "Nuevo Empleado" del Sidebar o Header
    const btnNuevo = document.getElementById('btnNuevoEmpleado');
    if (btnNuevo) btnNuevo.onclick = () => abrirModalCrear();

    // Configurar Buscador
    const inputBusqueda = document.getElementById('inputBusqueda');
    if (inputBusqueda) {
        inputBusqueda.onkeyup = (e) => {
            const term = e.target.value.toLowerCase();
            const filtrados = empleadosData.filter(emp => 
                (emp.id_cedula || '').toLowerCase().includes(term) || 
                (emp.apellidos_nombre || '').toLowerCase().includes(term)
            );
            renderTabla(filtrados);
        };
    }

    // Cargar datos iniciales
    await cargarYRenderizar();
};

async function cargarYRenderizar() {
    try {
        const lista = document.getElementById('listaEmpleados');
        if(!lista) return;
        lista.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#9ca3af;">Cargando...</td></tr>';
        
        empleadosData = await getEmpleados();
        renderTabla(empleadosData);
    } catch (error) {
        console.error("Error:", error);
    }
}

// =========================================================
// 3. RENDERIZADO DE TABLA (Diseño Limpio)
// =========================================================
function renderTabla(data) {
    const lista = document.getElementById('listaEmpleados');
    if (!lista) return;

    if (!data || data.length === 0) {
        lista.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#9ca3af;">No hay datos.</td></tr>';
        return;
    }

    lista.innerHTML = data.map(emp => {
        const esActivo = emp.estado === 'ACTIVO' || emp.estado_empleado === 'ACTIVO';
        // Estilos Inline para asegurar colores
        const badgeStyle = esActivo 
            ? 'background:#dcfce7; color:#166534; border:1px solid #bbf7d0;' 
            : 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;';
        
        return `
        <tr style="border-bottom:1px solid #f3f4f6;">
            <td style="padding:16px;">
                <div style="font-weight:bold; color:#1f2937; text-transform:capitalize;">${emp.apellidos_nombre.toLowerCase()}</div>
                <div style="font-size:0.75rem; color:#9ca3af; font-family:monospace;">ID: ${emp.id_cedula}</div>
            </td>
            <td style="padding:16px; font-size:0.875rem; color:#4b5563;">
                ${emp.nombre_area || 'Sin Área'}
            </td>
            <td style="padding:16px; text-align:center;">
                <span style="display:inline-block; padding:2px 8px; border-radius:999px; font-size:0.7rem; font-weight:800; ${badgeStyle}">
                    ${emp.estado || 'INACTIVO'}
                </span>
            </td>
            <td style="padding:16px; text-align:right;">
                <button onclick="window.verFicha('${emp.id_cedula}', '${emp.apellidos_nombre}')" 
                        style="background:#eff6ff; color:#2563eb; border:1px solid #dbeafe; padding:6px 12px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.8rem;">
                    Ver Ficha
                </button>
            </td>
        </tr>`;
    }).join('');
}

// =========================================================
// 4. MODAL "FICHA TÉCNICA" (ARREGLADO VISUALMENTE)
// =========================================================
window.verFicha = async (cedula, nombre) => {
    // Si el modal no existe, lo creamos con POSICIÓN FIJA forzada
    const modalId = 'modal-ficha-empleado';
    if (!document.getElementById(modalId)) {
        const modalHTML = `
        <div id="${modalId}" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 9999; display: none; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
            <div style="background: white; width: 95%; max-width: 500px; max-height: 90vh; overflow-y: auto; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                
                <div style="background: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: bold; color: #1e293b;">Ficha del Colaborador</h3>
                        <p id="ficha-nombre" style="margin: 4px 0 0; color: #64748b; font-size: 0.9rem;">-</p>
                    </div>
                    <button id="btn-cerrar-ficha" style="border: none; background: transparent; font-size: 1.5rem; cursor: pointer; color: #94a3b8;">&times;</button>
                </div>

                <div style="padding: 24px;">
                    
                    <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="margin:0 0 10px; font-size:0.85rem; color:#0369a1; font-weight:bold;">👨‍👩‍👧 Agregar Hijo/a</h4>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="h_nombre" placeholder="Nombre" style="flex: 2; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;">
                            <input type="date" id="h_fecha" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;">
                            <button onclick="window.agregarHijoRapido()" style="background: #0284c7; color: white; border: none; padding: 0 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                    </div>

                    <h4 style="font-size: 0.9rem; font-weight: bold; color: #475569; margin-bottom: 10px;">Núcleo Familiar Registrado</h4>
                    <div id="listaHijosDetalle" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; min-height: 50px;">
                        <div style="padding: 15px; text-align: center; color: #94a3b8; font-style: italic;">Cargando...</div>
                    </div>
                </div>

                <div style="padding: 15px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: right;">
                    <button onclick="document.getElementById('${modalId}').style.display='none'" style="padding: 8px 16px; background: white; border: 1px solid #cbd5e1; color: #475569; border-radius: 6px; cursor: pointer; font-weight: 600;">Cerrar</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('btn-cerrar-ficha').onclick = () => document.getElementById(modalId).style.display = 'none';
    }

    // Llenar datos y mostrar
    const modal = document.getElementById(modalId);
    document.getElementById('ficha-nombre').innerText = nombre;
    modal.setAttribute('data-cedula-actual', cedula);
    modal.style.display = 'flex'; // FLEX para centrar

    // Cargar Hijos
    const contenedor = document.getElementById('listaHijosDetalle');
    contenedor.innerHTML = '<div style="padding:15px; text-align:center; color:#94a3b8;">Consultando...</div>';
    
    try {
        const hijos = await getHijos(cedula);
        if(hijos.length === 0) {
            contenedor.innerHTML = '<div style="padding:15px; text-align:center; color:#94a3b8; font-size:0.9rem;">No tiene hijos registrados.</div>';
        } else {
            contenedor.innerHTML = hijos.map(h => `
                <div style="display:flex; justify-content:space-between; padding:10px 15px; border-bottom:1px solid #f1f5f9; background:white;">
                    <div>
                        <div style="font-weight:600; color:#334155; font-size:0.9rem;">${h.nombre_hijo || h.nombre_completo}</div>
                        <div style="font-size:0.75rem; color:#94a3b8; font-weight:bold;">${h.genero === 'M' ? 'NIÑO' : h.genero === 'F' ? 'NIÑA' : 'N/A'}</div>
                    </div>
                    <div style="font-family:monospace; font-size:0.8rem; background:#eff6ff; color:#2563eb; padding:4px 8px; border-radius:4px;">
                        ${h.fecha_nacimiento ? new Date(h.fecha_nacimiento).toLocaleDateString() : 'Sin fecha'}
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        contenedor.innerHTML = '<div style="padding:15px; text-align:center; color:red;">Error de conexión.</div>';
    }
};

window.agregarHijoRapido = async () => {
    const modal = document.getElementById('modal-ficha-empleado');
    const cedula = modal.getAttribute('data-cedula-actual');
    const nombre = document.getElementById('h_nombre').value;
    const fecha = document.getElementById('h_fecha').value;

    if(!nombre || !fecha) { alert("Nombre y fecha requeridos"); return; }

    await createHijo({
        nombre_hijo: nombre,
        fecha_nacimiento: fecha,
        fk_id_cedula_padre: cedula
    });

    document.getElementById('h_nombre').value = '';
    document.getElementById('h_fecha').value = '';
    
    // Recargar lista
    const nombreEmp = document.getElementById('ficha-nombre').innerText;
    window.verFicha(cedula, nombreEmp);
};

// =========================================================
// 5. CARGAR CATÁLOGOS (Auxiliar)
// =========================================================
const loadFormSelectors = async () => {
    // Si tienes el modal de "Crear Empleado", aquí cargarías los selects
    // Por ahora lo dejamos simple para no romper nada más
};