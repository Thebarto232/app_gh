import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { apiFetch } from "../../api/api.js";

export const initDashboard = async () => {
    console.log("🚀 Iniciando Dashboard...");
    
    await Promise.allSettled([
        cargarEstadisticas(),
        cargarMiniListaCumple(),
        initCalendar()
    ]);
};

// 1. CARGAR KPIs
async function cargarEstadisticas() {
    try {
        const stats = await apiFetch("/dashboard/stats/summary");
        if (stats) {
            setStat('stat-total', stats.totalEmpleados);
            setStat('stat-activos', stats.activos);
            setStat('stat-hijos', stats.hijos);
            setStat('stat-deptos', stats.departamentos);
        }
    } catch (error) {
        console.warn("Error KPIs:", error);
    }
}

function setStat(id, valor) {
    const el = document.getElementById(id);
    if (el) el.innerText = valor || 0;
}

// 2. LISTA CUMPLEAÑOS
async function cargarMiniListaCumple() {
    const lista = document.getElementById('dash-cumple-lista');
    if (!lista) return;

    try {
        const data = await apiFetch("/dashboard/reportes/cumpleanos");
        
        if (!data || data.length === 0) {
            lista.innerHTML = `<p class="text-center text-gray-400 text-xs py-6">No hay cumpleaños</p>`;
            return;
        }

        lista.innerHTML = data.slice(0, 5).map(emp => `
            <div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-teal-50 transition-colors border border-transparent hover:border-teal-100">
                <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                    ${emp.dia}
                </div>
                <div>
                    <p class="text-sm font-bold text-gray-800">${emp.apellidos_nombre}</p>
                    <p class="text-[10px] text-gray-400 font-bold uppercase">${emp.nombre_area || 'General'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        lista.innerHTML = `<p class="text-red-400 text-xs text-center">Error de conexión</p>`;
    }
}

// 3. CALENDARIO INTERACTIVO
export const initCalendar = async () => {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    calendarEl.innerHTML = "";

    const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: esLocale,
        headerToolbar: { left: 'title', center: '', right: 'prev,next today' },
        buttonText: { today: 'Hoy' },
        selectable: true,

        // --- CARGAR EVENTOS ---
        events: async (info, successCallback, failureCallback) => {
            try {
                const eventos = await apiFetch("/dashboard/citas");
                successCallback(eventos || []);
            } catch (error) {
                console.error("Error calendario:", error);
                failureCallback(error);
            }
        },

        // --- AL HACER CLIC EN UN DÍA ---
        dateClick: function(info) {
            abrirModalEvento(info.dateStr);
        },

        // --- ESTILOS DE EVENTOS ---
        eventDidMount: (info) => {
            const tipo = info.event.extendedProps.tipo;
            const el = info.el;
            
            el.style.border = 'none';
            el.style.fontSize = '0.75rem';
            el.style.padding = '2px 4px';
            el.style.borderRadius = '4px';
            el.style.marginTop = '2px';
            el.style.fontWeight = '600';

            if (tipo === 'CUMPLE') {
                el.style.backgroundColor = '#fce7f3'; // Rosa suave
                el.style.borderLeft = '3px solid #db2777';
                el.style.color = '#9d174d';
            } else if (tipo === 'ANIVERSARIO') {
                el.style.backgroundColor = '#fef3c7'; // Amarillo suave
                el.style.borderLeft = '3px solid #d97706';
                el.style.color = '#92400e';
            } else {
                el.style.backgroundColor = '#ccfbf1'; // Turquesa suave (Tema)
                el.style.borderLeft = '3px solid #0f766e'; // Turquesa oscuro
                el.style.color = '#115e59';
            }
            el.title = info.event.title;
        }
    });

    calendar.render();
    window.calendarInstance = calendar;
};

// =========================================================
// 4. MODAL ESTILIZADO (DISEÑO TURQUESA)
// =========================================================

function abrirModalEvento(fechaSeleccionada) {
    if (!document.getElementById('modal-evento')) {
        const modalHTML = `
        <div id="modal-evento" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(15, 23, 42, 0.6); z-index: 9999; display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
            
            <div style="background: white; width: 100%; max-width: 420px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; transform: scale(0.95); animation: popIn 0.2s forwards;">
                
                <div style="background: #14b8a6; padding: 20px 25px; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: white; letter-spacing: 0.5px;">📅 Nuevo Evento</h3>
                    <button id="btn-cerrar-x" style="background: rgba(255,255,255,0.2); border: none; width: 30px; height: 30px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">✕</button>
                </div>
                
                <form id="form-evento" style="padding: 25px;">
                    <div class="mb-4" style="margin-bottom: 1.2rem;">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">Título del Evento</label>
                        <input type="text" id="evt-titulo" style="width: 100%; padding: 12px 15px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; outline: none; transition: border-color 0.2s;" required placeholder="Ej: Reunión Semanal" autocomplete="off">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 1.5rem;">
                        <div>
                            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">Inicio</label>
                            <input type="datetime-local" id="evt-inicio" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; outline: none;" required>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase;">Fin</label>
                            <input type="datetime-local" id="evt-fin" style="width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; outline: none;" required>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
                        <button type="button" id="btn-cancelar-evt" style="padding: 10px 20px; font-size: 0.9rem; font-weight: 700; color: #64748b; background: transparent; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer;">Cancelar</button>
                        <button type="submit" style="padding: 10px 25px; font-size: 0.9rem; font-weight: 700; color: white; background: #14b8a6; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(20, 184, 166, 0.4);">Guardar</button>
                    </div>
                </form>
            </div>
            <style>
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                #evt-titulo:focus, #evt-inicio:focus, #evt-fin:focus { border-color: #14b8a6 !important; }
            </style>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Eventos
        const cerrarModal = () => document.getElementById('modal-evento').style.display = 'none';
        document.getElementById('btn-cancelar-evt').onclick = cerrarModal;
        document.getElementById('btn-cerrar-x').onclick = cerrarModal;

        document.getElementById('form-evento').onsubmit = async (e) => {
            e.preventDefault();
            await guardarEvento();
        };
    }

    // Configuración Inicial
    const modal = document.getElementById('modal-evento');
    const inputInicio = document.getElementById('evt-inicio');
    const inputFin = document.getElementById('evt-fin');
    
    inputInicio.value = `${fechaSeleccionada}T09:00`;
    inputFin.value = `${fechaSeleccionada}T10:00`;
    
    modal.style.display = 'flex';
    document.getElementById('evt-titulo').focus();
}

async function guardarEvento() {
    const titulo = document.getElementById('evt-titulo').value;
    const inicio = document.getElementById('evt-inicio').value;
    const fin = document.getElementById('evt-fin').value;
    const btnSubmit = document.querySelector('#form-evento button[type="submit"]');

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "...";

        await apiFetch('/dashboard/eventos', {
            method: 'POST',
            body: JSON.stringify({
                titulo,
                fecha_inicio: inicio,
                fecha_fin: fin,
                tipo: 'CITA'
            })
        });

        document.getElementById('modal-evento').style.display = 'none';
        document.getElementById('form-evento').reset();
        
        if (window.calendarInstance) {
            window.calendarInstance.refetchEvents();
        }

    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Guardar";
    }
}