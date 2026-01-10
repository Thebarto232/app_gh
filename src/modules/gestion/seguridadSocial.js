import { apiFetch } from "../../api/api.js";

export const initModuloSeguridadSocial = async () => {
    const tbody = document.getElementById('tabla-ss-body');
    if (!tbody) return;

    // Estado de carga
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#64748b;">Cargando reporte...</td></tr>';

    try {
        // Llamada a la ruta que acabamos de crear
        const data = await apiFetch("/empleados/reportes/seguridad-social");
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#94a3b8;">No hay empleados activos con afiliación.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(emp => `
            <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <td style="padding: 16px;">
                    <div style="font-weight: 700; color: #1e293b; font-size: 0.9rem; text-transform: capitalize;">
                        ${emp.apellidos_nombre.toLowerCase()}
                    </div>
                    <div style="font-size: 0.75rem; color: #94a3b8; font-family: monospace; margin-top: 4px;">
                        ID: ${emp.id_cedula}
                    </div>
                </td>
                <td style="padding: 16px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background-color: #f0f9ff; color: #0284c7; border-radius: 99px; font-size: 0.75rem; font-weight: 800; border: 1px solid #bae6fd;">
                        ${emp.nombre_eps || 'PENDIENTE'}
                    </span>
                </td>
                <td style="padding: 16px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 12px; background-color: #f0fdf4; color: #15803d; border-radius: 999px; font-size: 0.75rem; font-weight: 800; border: 1px solid #bbf7d0;">
                        ${emp.nombre_pension || 'PENDIENTE'}
                    </span>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Error EPS/Pensión:", err);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#ef4444;">Error de conexión.</td></tr>';
    }
};