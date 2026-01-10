// import './style.css'; // Descomenta solo si usas Vite
import { initRouter } from './router/router.js';

/**
 * ACTUALIZA LA INTERFAZ (SIDEBAR)
 */
export const updateSidebarUI = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token'); 

    if (!userData) return;

    const user = JSON.parse(userData);
    
    // 1. DATOS USUARIO
    const userRole = (user.rol || user.nombre_rol || 'VISITANTE').toUpperCase(); 
    const userName = user.nombre_completo || user.apellidos_nombre || user.email || 'Usuario';

    // 2. DOM - USUARIO
    const elements = {
        name: document.getElementById('display-user-name') || document.getElementById('user-name'),
        roleText: document.querySelector('.user-email-text') || document.getElementById('user-role'),
        avatar: document.querySelector('.avatar-brand'),
        greeting: document.getElementById('dynamic-greeting')
    };

    if (elements.name) elements.name.innerText = userName;
    if (elements.roleText) elements.roleText.innerText = userRole;
    if (elements.avatar) elements.avatar.innerText = userName.charAt(0).toUpperCase();

    if (elements.greeting) {
        const hr = new Date().getHours();
        const msg = hr < 12 ? 'Buen día' : hr < 18 ? 'Buenas tardes' : 'Buenas noches';
        elements.greeting.innerText = `${msg}, ${userName.split(' ')[0]}`;
    }

    // 3. SEGURIDAD (Botones)
    const btnNuevoEmpleado = document.getElementById('btnNuevoEmpleado');
    const rolesAutorizados = ['ADMIN', 'RRHH', 'COORD. GH', 'GESTOR DE CONTRATACION'];

    if (btnNuevoEmpleado) {
        if (rolesAutorizados.includes(userRole)) {
            btnNuevoEmpleado.classList.remove('hidden');
        } else {
            btnNuevoEmpleado.classList.add('hidden');
        }
    }

    // 4. ESTADÍSTICAS (KPIs Sidebar)
    if (token) {
        try {
            console.log("🔄 Actualizando Sidebar...");
            // RUTA CORRECTA: /dashboard/stats/summary
            const response = await fetch('http://localhost:3000/api/dashboard/stats/summary', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const stats = await response.json();
                console.log("✅ Datos recibidos:", stats);

                // --- CORRECCIÓN DE SELECTORES ---
                // Buscamos todos los <span> dentro de los enlaces del menú
                const menuSpans = document.querySelectorAll('.nav-link span, a span');

                menuSpans.forEach(span => {
                    const texto = span.innerText.toLowerCase();

                    // Actualizar DEPTOS (Evitamos borrar íconos buscando texto clave)
                    if (texto.includes('deptos') || texto.includes('departamentos')) {
                        // Si ya tiene número "(5)", lo limpiamos para dejar solo el nombre base si quieres
                        // O simplemente reemplazamos todo:
                        span.innerText = `Deptos (${stats.departamentos || 0})`;
                    }

                    // Actualizar HIJOS
                    if (texto.includes('hijos') || texto.includes('activos')) {
                        span.innerText = `Hijos Activos (${stats.hijos || 0})`;
                    }
                });
            } else {
                console.warn("⚠️ Error al obtener stats:", response.status);
            }
        } catch (error) { 
            console.error("❌ Error de conexión Sidebar:", error);
        }
    }
};

const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
};

// Logout Global
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-logout-simple') || e.target.closest('#btnLogout') || e.target.textContent.trim() === 'Log Out') {
        handleLogout();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await initRouter();
    await updateSidebarUI();
});