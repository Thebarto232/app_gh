import { login } from '../auth/login.js';
import { initDashboard } from '../modules/dashboard/dashboard.js'; 

// --- CORRECCIÓN 1: Importar el nuevo módulo de Colaboradores ---
import { initModuloColaboradores } from '../modules/gestion/colaboradores.js'; 

// Importaciones de otros módulos
import { initModuloBienestar } from '../modules/bienestar/bienestar.js'; 
import { initModuloSeguridadSocial } from '../modules/gestion/seguridadSocial.js';
import { initModuloDepartamentos } from '../modules/gestion/departamentos.js';

// --- NAVEGACIÓN SPA (Single Page Application) ---
export const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    initRouter();
};

const loadModule = async (path, container) => {
    try {
        // Asegúrate de que la ruta base coincida con tu estructura de carpetas
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
            // CASO LOGIN
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
                    window.location.href = '/dashboard';
                }

            // CASO REGISTRO
            } else {
                const regName = document.getElementById("reg-name")?.value.trim();
                const regEmail = document.getElementById("reg-email")?.value.trim(); 
                
                const finalName = regName || (regEmail ? regEmail.split('@')[0] : 'Usuario');
                const regPass = document.getElementById("reg-password")?.value.trim();
                const regRol = document.getElementById("reg-rol")?.value;

                if (!regEmail || !regPass) throw new Error("Datos incompletos");

                const userData = {
                    email: regEmail,
                    password: regPass,
                    nombre_completo: finalName,
                    fk_id_rol: regRol || 3 
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
                    navigateTo('/'); 
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
            
        // --- CORRECCIÓN 2: Apuntar al archivo HTML y Función JS nuevos ---
        case '/area': 
            await loadModule('colaboradores.html', dashContent); // Carga la vista nueva
            initModuloColaboradores(); // Carga la lógica nueva
            break;

        case '/cumpleanos':
            await loadModule('cumpleanos.html', dashContent);
            initModuloBienestar('/cumpleanos');
            break;

        case '/aniversarios':
            await loadModule('aniversarios.html', dashContent);
            initModuloBienestar('/aniversarios');
            break;
        
        case '/eps-pensiones':
            await loadModule('seguridad_social.html', dashContent);
            initModuloSeguridadSocial();
            break;

        case '/departamentos':
            await loadModule('departamentos.html', dashContent);
            initModuloDepartamentos();
            break;
        
        default:
            if (path === '/' || path === '/login') navigateTo('/dashboard');
            else {
                 await loadModule('dashboard.html', dashContent);
                 initDashboard();
            }
            break;
    }
};

// --- EVENT LISTENER GLOBAL ---
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.startsWith('http')) {
            e.preventDefault();
            navigateTo(href);
        }
    }
});