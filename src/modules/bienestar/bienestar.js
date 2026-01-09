import { apiFetch } from "../../api/api.js";

// Módulo de Cumpleaños
export const initModuloCumpleanos = async () => {
    const container = document.getElementById('lista-cumpleanos');
    if (!container) return;

    try {
        const data = await apiFetch("/empleados/reportes/cumpleanos");
        
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400">No hay cumpleaños este mes 🎂</div>`;
            return;
        }

        container.innerHTML = data.map(emp => `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div class="flex items-center gap-5">
                    <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg">
                        <span class="text-xs uppercase font-bold leading-none">Día</span>
                        <span class="text-xl font-black">${emp.dia}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-900 leading-tight">${emp.apellidos_nombre}</h4>
                        <p class="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">${emp.nombre_area || 'Personal'}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-red-500 text-center py-10">Error al cargar cumpleaños.</p>`;
    }
};

export const initModuloSeguridadSocial = async () => {
    const tbody = document.getElementById('tabla-ss-body');
    if (!tbody) return;

    try {
        const data = await apiFetch("/empleados/reportes/seguridad-social");
        tbody.innerHTML = data.map(emp => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-bold text-gray-800">${emp.apellidos_nombre}</td>
                <td class="px-6 py-4">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        ${emp.nombre_eps || 'No asignada'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                        ${emp.nombre_pension || 'No asignada'}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error cargando seguridad social:", err);
    }
};
// Módulo de Aniversarios (ESTA ES LA QUE TE FALTABA EXPORTAR)
export const initModuloAniversarios = async () => {
    const container = document.getElementById('lista-aniversarios'); // Asegúrate que este ID exista en aniversarios.html
    if (!container) return;

    try {
        const data = await apiFetch("/empleados/reportes/aniversarios");
        
        if (!data || data.length === 0) {
            container.innerHTML = `<div class="col-span-full py-10 text-center text-gray-400">No hay aniversarios este mes 🎖️</div>`;
            return;
        }

        container.innerHTML = data.map(emp => `
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">${emp.apellidos_nombre}</h4>
                        <p class="text-xs text-yellow-600 font-bold">¡Cumple ${emp.anos} años en la empresa!</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<p class="text-red-500">Error al cargar aniversarios.</p>`;
    }
};