const API_URL = 'http://localhost:3000/api/dashboard';

// Función para obtener headers actualizados con el token más reciente
const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
});

export const getCitas = async () => {
    try {
        const response = await fetch(`${API_URL}/citas`, { 
            method: 'GET', 
            headers: getHeaders() 
        });
        if (!response.ok) throw new Error('Error al obtener eventos');
        const data = await response.json();
        
        return data.map(evento => ({
            id: evento.id,
            title: evento.title,
            start: evento.start,
            end: evento.end || evento.start,
            extendedProps: {
                tipo: evento.tipo, // 'CITA', 'CUMPLE', 'ANIVERSARIO'
                descripcion: evento.descripcion || ''
            }
        }));
    } catch (error) {
        console.error("Error en getCitas:", error);
        return [];
    }
};

// Obtener catálogos para los selects del formulario (EPS, Pensiones, Deptos)
export const getCatalogosAdmin = async (tipo) => {
    try {
        const res = await fetch(`${API_URL}/catalogos/${tipo}`, { 
            method: 'GET', 
            headers: getHeaders() 
        });
        return await res.json();
    } catch (error) {
        console.error(`Error al obtener catálogo ${tipo}:`, error);
        return [];
    }
};

// Obtener empleados para la tabla de gestión
export const getTodosLosEmpleados = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/empleados', { 
            headers: getHeaders() 
        });
        return await res.json();
    } catch (error) {
        console.error("Error al obtener empleados:", error);
        return [];
    }
};