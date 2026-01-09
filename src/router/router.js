import { login } from '../auth/login.js';
import { initDashboard } from '../modules/dashboard/dashboard.js'; 
import { initModuloEmpleados } from '../modules/empleados/empleados.js'; 

// Eliminamos la importación de main.js para evitar el error de referencia circular
// import { updateSidebarUI } from '../main.js'; 

// Importa aquí el resto de módulos cuando los tengas listos
// import { initModuloCumpleanos, ... } from ...

// --- NAVEGACIÓN SPA (Single Page Application) ---
export const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    initRouter();
};

const loadModule = async (path, container) => {
    try {
        // Asegúrate de que tus archivos HTML estén en src/views/
        const res = await fetch(`/src/views/${path}`);
        if (!res.ok) throw new Error(`Vista no encontrada: ${path}`);
        container.innerHTML = await res.text();
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="p-8 text-center text-red-500 font-bold bg-white rounded-xl shadow">Error cargando módulo: ${path}</div>`;
    }
};

// --- LÓGICA DE FORMULARIOS (LOGIN / REGISTER) ---
async function setupAuthForms(type) {
    const formId = type === 'login' ? 'loginForm' : 'registerForm';
    const form = document.getElementById(formId);
    
    if (!form) return;

    // 1. CARGAR ROLES (Solo en Registro)
    if (type === 'register') {
        const selectRol = document.getElementById("reg-rol");
        if (selectRol && selectRol.tagName === 'SELECT') {
            try {
                const res = await fetch('http://localhost:3000/api/auth/roles');
                if(res.ok){
                    const roles = await res.json();
                    selectRol.innerHTML = '<option value="">Seleccione un rol...</option>' + 
                        roles.map(r => `<option value="${r.id_rol}">${r.nombre_rol}</option>`).join('');
                }
            } catch (err) { console.error("Error roles:", err); }
        }
    }

    // 2. MANEJO DEL SUBMIT
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        const errorMsg = document.getElementById(type === 'login' ? 'error' : 'reg-error');
        const successMsg = document.getElementById('reg-success');

        if(btn) btn.disabled = true;
        if(errorMsg) errorMsg.innerText = '';
        if(successMsg) successMsg.style.display = 'none';

        try {
            // ==============================
            // CASO LOGIN
            // ==============================
            if (type === 'login') {
                const inputEmail = document.getElementById("email") || document.getElementById("username");
                const inputPass = document.getElementById("password");
                
                const emailVal = inputEmail ? inputEmail.value.trim() : "";
                const passVal = inputPass ? inputPass.value.trim() : "";

                if (!emailVal || !passVal) throw new Error("Complete todos los campos");

                const result = await login(emailVal, passVal);
                
                if (result?.token) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    
                    // CAMBIO CRÍTICO: Usamos href para recargar la página completa.
                    // Esto evita problemas de dependencias circulares con el Sidebar.
                    window.location.href = '/dashboard';
                }

            // ==============================
            // CASO REGISTRO
            // ==============================
            } else {
                const regName = document.getElementById("reg-name")?.value.trim();
                const regEmail = document.getElementById("reg-email")?.value.trim(); 
                
                // Generar nombre si no existe
                const finalName = regName || (regEmail ? regEmail.split('@')[0] : 'Usuario');
                const regPass = document.getElementById("reg-password")?.value.trim();
                const regRol = document.getElementById("reg-rol")?.value;

                if (!regEmail || !regPass) throw new Error("Datos incompletos");

                const userData = {
                    email: regEmail,
                    password: regPass,
                    nombre_completo: finalName,
                    fk_id_rol: regRol || 3 // Rol por defecto (Visitante)
                };

                const res = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Error al registrar");

                if (successMsg) {
                    successMsg.style.display = 'block';
                    successMsg.innerText = "¡Cuenta creada! Redirigiendo...";
                }

                setTimeout(() => {
                    navigateTo('/'); // Ir al Login
                }, 1500);
            }

        } catch (err) {
            console.error("Auth Error:", err);
            if (errorMsg) errorMsg.innerText = err.message || "Error de conexión";
            if (btn) btn.disabled = false;
        }
    };
}

// --- ROUTER PRINCIPAL ---
export const initRouter = async () => {
    const appContainer = document.getElementById('app');
    const dashContent = document.getElementById('dashboard-content');
    const layout = document.getElementById('dashboard-wrapper');
    const path = window.location.pathname; 
    const token = localStorage.getItem('token');

    // 1. SIN SESIÓN -> Login/Register
    if (!token) {
        if (layout) layout.classList.add('hidden');
        appContainer.classList.remove('hidden');
        
        if (path === '/register') {
            await loadModule('register.html', appContainer);
            setupAuthForms('register');
        } else {
            // Cualquier otra ruta sin token lleva al Login
            await loadModule('login.html', appContainer);
            setupAuthForms('login');
        }
        return;
    }

    // 2. CON SESIÓN -> Dashboard Layout
    appContainer.classList.add('hidden');
    if (layout) {
        layout.classList.remove('hidden');
        layout.classList.add('flex');
    }

    // 3. RUTAS INTERNAS (Módulos)
    switch (path) {
        case '/dashboard':
            await loadModule('dashboard.html', dashContent);
            initDashboard(); 
            break;
            
        case '/area': // Gestión de Empleados
            await loadModule('empleados.html', dashContent);
            initModuloEmpleados();
            break;

        // --- MÓDULOS PENDIENTES ---
        // Asegúrate de que estos archivos existan o comenta los casos
        // case '/cumpleanos':
        //    await loadModule('cumpleanos.html', dashContent);
        //    if(typeof initModuloCumpleanos === 'function') initModuloCumpleanos();
        //    break;
        
        default:
            // Si está logueado y entra a la raíz, va al dashboard
            if (path === '/' || path === '/login') navigateTo('/dashboard');
            // Si la ruta no existe, cargamos dashboard por defecto o una 404
            else {
                 await loadModule('dashboard.html', dashContent);
                 initDashboard();
            }
            break;
    }
};

// --- EVENT LISTENER GLOBAL ---
// Intercepta los clics en enlaces para usar la navegación SPA
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
        const href = link.getAttribute('href');
        // Solo interceptamos rutas internas (que empiezan con /)
        if (href && href.startsWith('/') && !href.startsWith('http')) {
            e.preventDefault();
            navigateTo(href);
        }
    }
});