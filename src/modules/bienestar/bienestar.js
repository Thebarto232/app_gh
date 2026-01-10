import { apiFetch } from "../../api/api.js";

// =========================================================
// FUNCIÓN PRINCIPAL (La que el Router necesita importar)
// =========================================================
export const initModuloBienestar = async (path) => {
    if (path === '/cumpleanos') {
        await cargarCumpleanos();
    } else if (path === '/aniversarios') {
        await cargarAniversarios();
    }
};

// --- LÓGICA DE CUMPLEAÑOS ---
async function cargarCumpleanos() {
    const container = document.getElementById('lista-cumpleanos') || document.getElementById('lista-bienestar');
    if (!container) return;

    try {
        const data = await apiFetch("/dashboard/reportes/cumpleanos");
        
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400">No hay cumpleaños este mes 🎂</div>`;
            return;
        }

        container.innerHTML = data.map(emp => `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group mb-3">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span class="text-[9px] uppercase font-bold leading-none opacity-90">Día</span>
                        <span class="text-lg font-black">${emp.dia}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 leading-tight text-sm">${emp.apellidos_nombre}</h4>
                        <p class="text-[10px] text-pink-500 font-bold uppercase tracking-wide mt-0.5">${emp.nombre_area || 'General'}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error cumpleaños:", err);
    }
}

// --- LÓGICA DE ANIVERSARIOS ---
async function cargarAniversarios() {
    const container = document.getElementById('lista-aniversarios') || document.getElementById('lista-bienestar');
    if (!container) return;

    try {
        const data = await apiFetch("/empleados/reportes/aniversarios");
        
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400">No hay aniversarios este mes 🎖️</div>`;
            return;
        }

        container.innerHTML = data.map(emp => `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all mb-3">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center shadow-inner border border-yellow-200">
                        <span class="text-xl">🏆</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 text-sm">${emp.apellidos_nombre}</h4>
                        <span class="text-[10px] text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-yellow-100">
                            Cumple ${emp.anos} años
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Error aniversarios:", err);
    }
}