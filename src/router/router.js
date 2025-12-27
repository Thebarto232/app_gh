import { login } from '../auth/login.js';
import { initCalendar } from '../modules/dashboard_rrhh.js';

const loadModule = async (path, container) => {
    try {
        const url = `/src/views/${path}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        container.innerHTML = await res.text();
    } catch (err) {
        container.innerHTML = `<div style="color:red; padding:20px;">Error crítico: No se encontró la vista ${path}</div>`;
    }
};

export const initRouter = async () => {
    const appContainer = document.getElementById('app');
    const dashContent = document.getElementById('dashboard-content');
    const layout = document.getElementById('dashboard-wrapper');
    const path = window.location.pathname;
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. FLUJO DE AUTENTICACIÓN (LOGIN/REGISTER)
    if (!token) {
        if (layout) layout.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        // Aplicamos la clase de tu CSS para activar el fondo turquesa y círculos
        document.body.className = 'auth-screen';

        if (path === '/register') {
            await loadModule('register.html', appContainer);
        } else {
            await loadModule('login.html', appContainer);
            setupLoginLogic(); 
        }
        return;
    }

    // 2. FLUJO DE DASHBOARD (SISTEMA)
    appContainer.classList.add('hidden');
    if (layout) layout.classList.remove('hidden');
    
    // Cambiamos a la clase de fondo gris del sistema
    document.body.className = 'admin-theme';

    const roleViews = {
        'RRHH': 'dashboard_rrhh.html',
        'ADMIN': 'dashboard_admin.html',
        'USUARIO': 'dashboard_usuario.html'
    };

    const viewToLoad = roleViews[user?.rol] || 'dashboard_usuario.html';
    await loadModule(viewToLoad, dashContent);

    // Inicializar calendarios o gráficas si el rol es RRHH
    if (user?.rol === 'RRHH') {
        setTimeout(() => {
            if (typeof FullCalendar !== 'undefined') initCalendar();
        }, 150);
    }
};

function setupLoginLogic() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        try {
            const result = await login(username, password);
            if (result?.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                // Redirección limpia
                window.location.href = "/dashboard";
            }
        } catch (err) {
            const errDiv = document.getElementById("error");
            if (errDiv) errDiv.textContent = "Credenciales incorrectas";
        }
    });
}