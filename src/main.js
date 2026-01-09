// import './style.css'; // Descomenta solo si usas Vite
import { initRouter } from './router/router.js';

/**
 * ACTUALIZA LA INTERFAZ SEGÚN EL ROL
 */
export const updateSidebarUI = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token'); 

    if (!userData) return;

    const user = JSON.parse(userData);
    
    // 1. NORMALIZACIÓN DE DATOS
    const userRole = (user.rol || user.nombre_rol || 'VISITANTE').toUpperCase(); 
    const userName = user.nombre_completo || user.apellidos_nombre || user.email || 'Usuario';

    // 2. ELEMENTOS DEL DOM
    const elements = {
        name: document.getElementById('display-user-name') || document.getElementById('user-name'),
        roleText: document.querySelector('.user-email-text') || document.getElementById('user-role'),
        avatar: document.querySelector('.avatar-brand'),
        greeting: document.getElementById('dynamic-greeting')
    };

    // 3. ACTUALIZAR UI
    if (elements.name) elements.name.innerText = userName;
    if (elements.roleText) elements.roleText.innerText = userRole;
    if (elements.avatar) elements.avatar.innerText = userName.charAt(0).toUpperCase();

    if (elements.greeting) {
        const hr = new Date().getHours();
        const msg = hr < 12 ? 'Buen día' : hr < 18 ? 'Buenas tardes' : 'Buenas noches';
        elements.greeting.innerText = `${msg}, ${userName.split(' ')[0]}`;
    }

    // 4. SEGURIDAD VISUAL
    const btnNuevoEmpleado = document.getElementById('btnNuevoEmpleado');
    const rolesAutorizados = ['ADMIN', 'RRHH', 'COORD. GH', 'GESTOR DE CONTRATACION'];

    if (btnNuevoEmpleado) {
        if (rolesAutorizados.includes(userRole)) {
            btnNuevoEmpleado.classList.remove('hidden');
        } else {
            btnNuevoEmpleado.classList.add('hidden');
        }
    }

    // 5. CARGA DE ESTADÍSTICAS
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard/stats/summary', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const stats = await response.json();
                
                // Actualizar contadores del menú
                const linkHijos = document.querySelector('a[href="/hijos-activos"] span');
                const linkDeptos = document.querySelector('a[href="/departamentos"] span');
                
                if (linkHijos && stats.hijos !== undefined) {
                    linkHijos.innerText = `Hijos (${stats.hijos})`;
                }
                if (linkDeptos && stats.departamentos !== undefined) {
                    linkDeptos.innerText = `Deptos (${stats.departamentos})`;
                }
            }
        } catch (error) { 
            console.warn("No se pudo conectar al servidor (Stats)"); 
        }
    }
};

const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
};

document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-logout-simple') || e.target.closest('#btnLogout') || e.target.textContent.trim() === 'Log Out') {
        handleLogout();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await initRouter();
    await updateSidebarUI();
});