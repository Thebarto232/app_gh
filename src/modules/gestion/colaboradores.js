import { apiFetch } from "../../api/api.js";

let listaEmpleadosOriginal = [];

export const initModuloColaboradores = async () => {
    await cargarColaboradores();
    
    // Evento para el buscador
    const searchInput = document.getElementById('search-empleado');
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => filtrarTabla(e.target.value));
    }
};

// 1. CARGAR DATOS
async function cargarColaboradores() {
    const contenedor = document.getElementById('tabla-colaboradores');
    // Loader
    contenedor.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">Cargando talento...</td></tr>';

    try {
        const data = await apiFetch('/empleados');
        listaEmpleadosOriginal = data || []; // Guardamos copia para filtrar
        
        renderizarTabla(listaEmpleadosOriginal);
        
        // Actualizar contador del título si existe
        const contador = document.getElementById('total-empleados-badge');
        if(contador) contador.innerText = `${listaEmpleadosOriginal.length} Activos`;

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error cargando datos.</td></tr>';
    }
}

// 2. RENDERIZAR TABLA
function renderizarTabla(lista) {
    const contenedor = document.getElementById('tabla-colaboradores');
    
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 40px; color: #94a3b8;">
                    <span class="material-symbols-outlined" style="font-size: 32px;">search_off</span>
                    <p>No se encontraron colaboradores.</p>
                </td>
            </tr>`;
        return;
    }

    contenedor.innerHTML = lista.map(emp => {
        // Generar iniciales para el avatar
        const iniciales = emp.apellidos_nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        
        return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
            
            <td style="padding: 16px;">
                <div style="font-family: monospace; font-weight: 600; color: #64748b;">
                    ${emp.id_cedula}
                </div>
            </td>

            <td style="padding: 16px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; background: #0f766e; color: white;OX border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">
                        ${iniciales}
                    </div>
                    <div>
                        <div style="font-weight: 700; color: #1e293b; text-transform: capitalize;">
                            ${emp.apellidos_nombre.toLowerCase()}
                        </div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">
                            ${emp.email_personal || 'Sin email'}
                        </div>
                    </div>
                </div>
            </td>

            <td style="padding: 16px;">
                <div style="font-size: 0.85rem; color: #334155;">
                    ${emp.nombre_area || '<span style="color:#cbd5e1;">Sin Área</span>'}
                </div>
                <div style="font-size: 0.7rem; color: #94a3b8;">
                    ${emp.cargo || 'Cargo pendiente'}
                </div>
            </td>

            <td style="padding: 16px; text-align: center;">
                <span style="background: ${emp.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2'}; color: ${emp.estado === 'ACTIVO' ? '#166534' : '#991b1b'}; padding: 4px 10px; border-radius: 99px; font-size: 0.7rem; font-weight: 700; border: 1px solid ${emp.estado === 'ACTIVO' ? '#bbf7d0' : '#fecaca'};">
                    ${emp.estado}
                </span>
            </td>

            <td style="padding: 16px; text-align: right;">
                <button onclick="window.verFicha('${emp.id_cedula}')" 
                    style="background: white; border: 1px solid #e2e8f0; color: #3b82f6; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s;"
                    onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#bfdbfe'"
                    onmouseout="this.style.background='white'; this.style.borderColor='#e2e8f0'">
                    Ver Ficha
                </button>
            </td>
        </tr>
    `}).join('');
}

// 3. FILTRO BUSCADOR
function filtrarTabla(texto) {
    const busqueda = texto.toLowerCase();
    const filtrados = listaEmpleadosOriginal.filter(emp => 
        emp.apellidos_nombre.toLowerCase().includes(busqueda) || 
        emp.id_cedula.includes(busqueda)
    );
    renderizarTabla(filtrados);
}

// 4. MODAL VER FICHA
window.verFicha = async (cedula) => {
    // Buscamos los datos completos del empleado en el array local (para no llamar a la API otra vez)
    const emp = listaEmpleadosOriginal.find(e => e.id_cedula == cedula);
    if(!emp) return;

    Swal.fire({
        title: `<div style="font-size:1.1rem; color:#334155;">${emp.apellidos_nombre}</div>`,
        html: `
            <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem;">
                <div style="margin-bottom: 8px;"><strong>🆔 Cédula:</strong> ${emp.id_cedula}</div>
                <div style="margin-bottom: 8px;"><strong>📧 Email:</strong> ${emp.email_personal || 'N/A'}</div>
                <div style="margin-bottom: 8px;"><strong>📱 Celular:</strong> ${emp.celular || 'N/A'}</div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                <div style="margin-bottom: 8px;"><strong>🏢 Área:</strong> ${emp.nombre_area || 'Sin asignar'}</div>
                <div style="margin-bottom: 8px;"><strong>💼 Cargo:</strong> ${emp.cargo || 'Sin asignar'}</div>
                <div style="margin-bottom: 8px;"><strong>📅 Ingreso:</strong> ${emp.fecha_ingreso ? emp.fecha_ingreso.split('T')[0] : 'N/A'}</div>
            </div>
        `,
        showCloseButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#64748b'
    });
};

// 5. MODAL NUEVO EMPLEADO (Básico)
window.modalNuevoEmpleado = async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Nuevo Colaborador',
        html: `
            <input id="sw-cedula" class="swal2-input" placeholder="Cédula *" type="number">
            <input id="sw-nombre" class="swal2-input" placeholder="Nombre Completo *">
            <input id="sw-fecha" class="swal2-input" type="date" placeholder="Fecha Ingreso">
        `,
        focusConfirm: false,
        confirmButtonText: 'Guardar',
        confirmButtonColor: '#10b981',
        showCancelButton: true,
        preConfirm: () => {
            return {
                id_cedula: document.getElementById('sw-cedula').value,
                apellidos_nombre: document.getElementById('sw-nombre').value,
                fecha_ingreso: document.getElementById('sw-fecha').value
            }
        }
    });

    if (formValues) {
        if(!formValues.id_cedula || !formValues.apellidos_nombre) {
            return Swal.fire('Error', 'Cédula y Nombre son obligatorios', 'error');
        }
        
        try {
            await apiFetch('/empleados', {
                method: 'POST',
                body: JSON.stringify(formValues)
            });
            Swal.fire('Guardado', 'Colaborador registrado correctamente', 'success');
            cargarColaboradores();
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar. Verifica si la cédula ya existe.', 'error');
        }
    }
};