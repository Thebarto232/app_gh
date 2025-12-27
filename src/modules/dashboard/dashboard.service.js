// src/modules/dashboard/dashboard.service.js
export const getCitas = async () => {
    try {
        const token = localStorage.getItem('token');
        
        // CORRECCIÓN: La ruta debe ser /api/dashboard/citas según tu app.js
        const response = await fetch('http://localhost:3000/api/dashboard/citas', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`, // Verifica que el token no sea null
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            console.error("Sesión expirada o token inválido");
            // Opcional: window.location.href = '/login';
            return [];
        }

        if (!response.ok) throw new Error('Error al obtener citas');
        
        const data = await response.json();
        
        return data.map(cita => ({
            id: cita.id_cita,
            title: cita.titulo,
            start: cita.fecha_inicio, // FullCalendar necesita formato ISO: YYYY-MM-DD
            end: cita.fecha_fin,
            description: cita.descripcion,
            extendedProps: {
                id_usuario: cita.fk_id_usuario
            }
        }));
    } catch (error) {
        console.error("Error en servicio de citas:", error);
        return [];
    }
};