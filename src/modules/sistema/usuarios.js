import { apiFetch } from "../../api/api.js";

export const initModuloUsuarios = async () => {
    const tbody = document.getElementById('tabla-usuarios-body');
    const modal = document.getElementById('modalUsuario');
    const btnAbrir = document.getElementById('btnAbrirCrearUsuario');
    const btnCerrar = document.getElementById('btnCerrarModalUser');
    const form = document.getElementById('formNuevoUsuario');

    if (!tbody) return;

    // --- 1. CARGAR LISTA DE USUARIOS ---
    const cargarUsuarios = async () => {
        try {
            const usuarios = await apiFetch("/auth/users");
            if (!usuarios) return;

            tbody.innerHTML = usuarios.map(user => `
                <tr class="hover:bg-gray-50 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                ${user.username.charAt(0).toUpperCase()}
                            </div>
                            <span class="font-bold text-gray-700">${user.username}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            user.rol === 'ADMIN' 
                            ? 'bg-red-100 text-red-600 border border-red-200' 
                            : 'bg-blue-100 text-blue-600 border border-blue-200'
                        }">
                            ${user.rol}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="eliminarUsuario(${user.id_usuario})" 
                                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <span class="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-red-500 font-bold">Error al conectar con el servidor</td></tr>`;
        }
    };

    // --- 2. LÓGICA DEL MODAL ---
    if (btnAbrir) {
        btnAbrir.onclick = async () => {
            const selectRol = document.getElementById('new-rol');
            try {
                // Cargamos roles antes de mostrar el modal
                const roles = await apiFetch("/auth/roles");
                if (roles && selectRol) {
                    selectRol.innerHTML = '<option value="" disabled selected>Seleccione un rol...</option>' + 
                        roles.map(r => `<option value="${r.id_rol}">${r.nombre}</option>`).join('');
                }
                modal.classList.remove('hidden');
            } catch (error) {
                alert("Error al cargar el catálogo de roles");
            }
        };
    }

    if (btnCerrar) {
        btnCerrar.onclick = () => {
            modal.classList.add('hidden');
            form.reset();
        };
    }

    // --- 3. CREAR NUEVO USUARIO ---
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                username: document.getElementById('new-username').value.trim(),
                password: document.getElementById('new-password').value,
                fk_id_rol: document.getElementById('new-rol').value
            };

            try {
                const res = await apiFetch("/auth/register", {
                    method: 'POST',
                    body: JSON.stringify(data)
                });

                if (res) {
                    modal.classList.add('hidden');
                    form.reset();
                    await cargarUsuarios(); // Recargamos la tabla
                    // Podrías añadir una notificación aquí
                }
            } catch (error) {
                alert("Error al crear usuario: " + error.message);
            }
        };
    }

    // --- 4. ACCIONES GLOBALES ---
    window.eliminarUsuario = async (id) => {
        if (confirm("¿Está seguro de eliminar este acceso de forma permanente?")) {
            try {
                // Endpoint sugerido: DELETE /api/auth/users/:id
                const res = await apiFetch(`/auth/users/${id}`, { method: 'DELETE' });
                if (res) await cargarUsuarios();
            } catch (error) {
                alert("Error al eliminar: " + error.message);
            }
        }
    };

    await cargarUsuarios();
};