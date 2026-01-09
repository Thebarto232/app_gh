import { apiFetch } from "../../api/api.js";

export const initModuloSeguridadSocial = async () => {
    const tbody = document.getElementById('tabla-ss-body');
    if (!tbody) return;

    try {
        const data = await apiFetch("/empleados/reportes/seguridad-social");
        if (!data) return;

        tbody.innerHTML = data.map(emp => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-800 text-sm uppercase">${emp.apellidos_nombre.toLowerCase()}</div>
                    <div class="text-[10px] text-gray-400 font-mono tracking-tighter">${emp.id_cedula}</div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-blue-100">
                        ${emp.nombre_eps || 'PENDIENTE'}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                        ${emp.nombre_pension || 'PENDIENTE'}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error en Seguridad Social:", err);
    }
};