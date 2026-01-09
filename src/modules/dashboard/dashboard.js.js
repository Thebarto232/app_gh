import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
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
            <div class="flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-50 transition-colors">
                <div class="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
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

// 3. CALENDARIO
export const initCalendar = async () => {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    calendarEl.innerHTML = "";

    const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin],
        initialView: 'dayGridMonth',
        locale: esLocale,
        height: 'auto',
        headerToolbar: { left: 'title', center: '', right: 'prev,next' },
        buttonText: { today: 'Hoy' },
        
        events: async (info, successCallback, failureCallback) => {
            try {
                const eventos = await apiFetch("/dashboard/citas");
                successCallback(eventos || []);
            } catch (error) {
                console.error("Error calendario:", error);
                failureCallback(error);
            }
        },

        eventDidMount: (info) => {
            const tipo = info.event.extendedProps.tipo;
            const el = info.el;
            el.style.border = 'none';
            el.style.fontSize = '0.75rem';
            el.style.padding = '2px';

            if (tipo === 'CUMPLE') {
                el.style.backgroundColor = '#ec4899';
                el.style.color = 'white';
            } else if (tipo === 'ANIVERSARIO') {
                el.style.backgroundColor = '#14b8a6';
                el.style.color = 'white';
            } else {
                el.style.backgroundColor = '#3b82f6';
                el.style.color = 'white';
            }
            el.title = info.event.title;
        }
    });

    calendar.render();
};