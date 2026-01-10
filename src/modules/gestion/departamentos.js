import { apiFetch } from "../../api/api.js";

let deptoSeleccionadoId = null;

export const initModuloDepartamentos = async () => {
    await cargarDepartamentos();
};

// ======================================================
// 1. CARGAR LISTA DE DEPARTAMENTOS (Panel Izquierdo)
// ======================================================
async function cargarDepartamentos() {
    const contenedor = document.getElementById('lista-deptos');
    try {
        const data = await apiFetch('/departamentos');
        
        // ACTUALIZAR CONTADOR DEL SIDEBAR (Menú Lateral)
        actualizarContadorSidebar(data ? data.length : 0);

        if (!data || data.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align:center; padding: 20px; color: #94a3b8;">
                    <span class="material-symbols-outlined" style="font-size: 40px; margin-bottom: 10px;">qwerty</span>
                    <p>No hay departamentos.</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = data.map(d => `
            <div onclick="window.seleccionarDepto(${d.id_depto}, '${d.nombre_depto}', this)" 
                 class="item-depto group"
                 style="padding: 16px; margin-bottom: 10px; border-radius: 12px; cursor: pointer; border: 1px solid #f1f5f9; transition: all 0.2s; background: #fff; display:flex; justify-content:space-between; align-items:center; position: relative;"
                 onmouseover="this.style.borderColor='#cbd5e1'; this.style.boxShadow='0 4px 6px -1px rgb(0 0 0 / 0.1)'" 
                 onmouseout="if(!this.classList.contains('active')) { this.style.borderColor='#f1f5f9'; this.style.boxShadow='none'; }">
                
                <div>
                    <div style="font-weight: 700; color: #334155; font-size: 0.95rem;">${d.nombre_depto}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px;">${d.total_areas} Áreas</div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="event.stopPropagation(); window.eliminarDepto(${d.id_depto}, '${d.nombre_depto}')" 
                            style="border: none; background: #fee2e2; color: #ef4444; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;"
                            onmouseover="this.style.background='#fecaca'"
                            onmouseout="this.style.background='#fee2e2'"
                            title="Eliminar departamento">
                        <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                    </button>
                    
                    <span class="material-symbols-outlined" style="color:#cbd5e1; font-size: 20px;">chevron_right</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
    }
}

// Función auxiliar para actualizar el menú lateral
function actualizarContadorSidebar(cantidad) {
    const links = document.querySelectorAll('a, li'); 
    links.forEach(el => {
        if (el.innerText.includes('Deptos')) {
            const icono = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
            el.innerHTML = `${icono} Deptos (${cantidad})`;
        }
    });
}

// ======================================================
// 2. SELECCIONAR Y CARGAR ÁREAS (Panel Derecho)
// ======================================================
window.seleccionarDepto = async (id, nombre, elementoHTML) => {
    deptoSeleccionadoId = id;
    
    // UI: Resaltar seleccionado visualmente
    document.querySelectorAll('.item-depto').forEach(el => {
        el.style.background = '#fff';
        el.style.borderColor = '#f1f5f9';
        el.classList.remove('active');
    });
    if(elementoHTML) {
        elementoHTML.style.background = '#f0f9ff';
        elementoHTML.style.borderColor = '#bae6fd';
        elementoHTML.classList.add('active');
    }

    // Activar panel derecho
    const panel = document.getElementById('panel-areas');
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
    panel.style.transition = 'opacity 0.3s ease';
    
    document.getElementById('titulo-depto-seleccionado').innerText = nombre;
    cargarAreas(id);
};

async function cargarAreas(idDepto) {
    const listaAreas = document.getElementById('lista-areas');
    listaAreas.innerHTML = '<div style="text-align:center; padding:40px;"><span class="loader">Cargando...</span></div>';

    try {
        const areas = await apiFetch(`/departamentos/${idDepto}/areas`);
        
        if (areas.length === 0) {
            listaAreas.innerHTML = `
                <div style="text-align:center; padding:60px; color:#94a3b8;">
                    <span class="material-symbols-outlined" style="font-size: 48px; color:#e2e8f0; margin-bottom:10px;">Tm</span>
                    <p>Sin áreas registradas.</p>
                    <small>Usa el botón azul para crear la primera.</small>
                </div>`;
            return;
        }

        listaAreas.innerHTML = `
            <table style="width:100%; border-collapse:separate; border-spacing: 0 8px;">
                <thead>
                    <tr style="text-align:left; color:#64748b; font-size:0.75rem; text-transform:uppercase; letter-spacing: 0.05em;">
                        <th style="padding:0 12px;">Nombre del Área</th>
                        <th style="padding:0 12px; text-align:right;">Cupos</th>
                    </tr>
                </thead>
                <tbody>
                    ${areas.map(a => `
                        <tr style="background:white; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);">
                            <td style="padding:16px; border-radius: 8px 0 0 8px; font-weight:600; color:#334155;">
                                ${a.nombre_area}
                            </td>
                            <td style="padding:16px; border-radius: 0 8px 8px 0; text-align:right;">
                                <span style="background:#eff6ff; color:#2563eb; padding:6px 12px; border-radius:99px; font-size:0.75rem; font-weight:700; border:1px solid #dbeafe;">
                                    ${a.presupuestados} Personas
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error(error);
    }
}

// ======================================================
// 3. ELIMINAR DEPARTAMENTO
// ======================================================
window.eliminarDepto = async (id, nombre) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `Se eliminará "${nombre}" y TODAS sus áreas asociadas.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await apiFetch(`/departamentos/${id}`, { method: 'DELETE' });
            
            Swal.fire('Eliminado', 'El departamento ha sido borrado.', 'success');
            
            // Si el que borramos estaba seleccionado, limpiar panel derecho
            if (deptoSeleccionadoId === id) {
                document.getElementById('panel-areas').style.opacity = '0.5';
                document.getElementById('panel-areas').style.pointerEvents = 'none';
                document.getElementById('lista-areas').innerHTML = '';
                document.getElementById('titulo-depto-seleccionado').innerText = 'Selecciona un departamento';
                deptoSeleccionadoId = null;
            }

            await cargarDepartamentos(); // Recargar lista y contador
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
};

// ======================================================
// 4. CREACIÓN (MODALES)
// ======================================================
window.modalCrearDepto = async () => {
    const { value: nombre } = await Swal.fire({
        title: 'Nuevo Departamento',
        input: 'text',
        inputLabel: 'Nombre del departamento',
        inputPlaceholder: 'Ej: Recursos Humanos',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Crear',
        cancelButtonText: 'Cancelar'
    });

    if (nombre) {
        try {
            await apiFetch('/departamentos', {
                method: 'POST',
                body: JSON.stringify({ nombre_depto: nombre })
            });
            await cargarDepartamentos();
            
            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
                timerProgressBar: true
            });
            Toast.fire({ icon: 'success', title: 'Departamento creado' });

        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
};

window.modalCrearArea = async () => {
    if (!deptoSeleccionadoId) return;
    
    const { value: formValues } = await Swal.fire({
        title: 'Nueva Área Funcional',
        html:
            '<input id="swal-input1" class="swal2-input" placeholder="Nombre del Área">' +
            '<input id="swal-input2" type="number" class="swal2-input" placeholder="Cupos Presupuestados (N°)">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Registrar',
        preConfirm: () => [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value
        ]
    });

    if (formValues) {
        const [nombre, cupos] = formValues;
        if (!nombre) return;

        try {
            await apiFetch('/departamentos/areas', {
                method: 'POST',
                body: JSON.stringify({
                    nombre_area: nombre,
                    fk_id_depto: deptoSeleccionadoId,
                    presupuestados: cupos || 0
                })
            });
            
            cargarAreas(deptoSeleccionadoId);
            const data = await apiFetch('/departamentos');
            actualizarContadorSidebar(data.length); 

            const Toast = Swal.mixin({
                toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
            });
            Toast.fire({ icon: 'success', title: 'Área agregada' });

        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
};