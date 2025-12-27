export const initCalendar = async () => {
    const calendarEl = document.getElementById('calendar');
    const modal = document.getElementById('modalCita');
    const formCita = document.getElementById('formNuevaCita');
    const btnCerrar = document.getElementById('btnCerrarModal');
    const btnX = document.getElementById('btnCerrarX');

    if (!calendarEl) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Función cerrar modal
    const closeCitaModal = () => {
        modal.classList.add('hidden');
        formCita.reset();
    };

    if (btnCerrar) btnCerrar.onclick = closeCitaModal;
    if (btnX) btnX.onclick = closeCitaModal;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Agenda' },
        
        selectable: (user.rol === 'RRHH' || user.rol === 'ADMIN'),

        events: async (info, successCallback, failureCallback) => {
            try {
                const response = await fetch('http://localhost:3000/api/empleados/citas', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Error al obtener citas");
                const citas = await response.json();
                const events = citas.map(c => ({
                    id: c.id, 
                    title: c.title,
                    start: c.start,
                    end: c.end,
                    extendedProps: { description: c.descripcion }, // Corregido: usar extendedProps
                    backgroundColor: '#14b8a6', 
                    borderColor: '#0d9488',
                    textColor: '#ffffff'
                }));
                successCallback(events);
            } catch (error) {
                failureCallback(error);
            }
        },

        select: function(info) {
            if (user.rol === 'USUARIO') return;

            // Mostrar modal usando clases CSS (no .style.display)
            modal.classList.remove('hidden');
            
            // Asignar valores a inputs ocultos de forma segura
            const inputInicio = document.getElementById('fechaInicio');
            const inputFin = document.getElementById('fechaFin');
            if (inputInicio) inputInicio.value = info.startStr;
            if (inputFin) inputFin.value = info.endStr;

            // Manejar el submit una sola vez
            formCita.onsubmit = async (e) => {
                e.preventDefault();
                const idUsuarioLogueado = user.id_usuario || user.id || 1;

                const nuevaCita = {
                    titulo: document.getElementById('inputTitulo').value,
                    descripcion: document.getElementById('inputDesc').value,
                    fecha_inicio: document.getElementById('fechaInicio').value,
                    fecha_fin: document.getElementById('fechaFin').value,
                    fk_id_usuario: idUsuarioLogueado
                };

                try {
                    const response = await fetch('http://localhost:3000/api/empleados/citas', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(nuevaCita)
                    });

                    if (response.ok) {
                        closeCitaModal();
                        calendar.refetchEvents();
                    }
                } catch (error) {
                    console.error("Error al guardar:", error);
                }
            };
        },

        eventClick: async function(info) {
            const esGestion = (user.rol === 'RRHH' || user.rol === 'ADMIN');
            const desc = info.event.extendedProps.description || 'Sin descripción';
            
            if (esGestion) {
                if (confirm(`📅 Cita: ${info.event.title}\n📝 ${desc}\n\n¿Deseas ELIMINAR esta cita?`)) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/empleados/citas/${info.event.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (response.ok) {
                            info.event.remove();
                            alert("Eliminada.");
                        }
                    } catch (error) {
                        console.error("Error al borrar:", error);
                    }
                }
            } else {
                alert(`📅 Detalle:\nAsunto: ${info.event.title}\nDescripción: ${desc}`);
            }
        }
    });

    calendar.render();
};