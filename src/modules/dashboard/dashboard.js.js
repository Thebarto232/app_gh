import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

export const initCalendar = async () => {
    const calendarEl = document.getElementById('calendar');
    const modal = document.getElementById('modalCita');
    const form = document.getElementById('formNuevaCita');

    const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: esLocale,
        selectable: true,
        events: 'http://localhost:3000/api/dashboard/citas', // Tu ruta de backend

        select: function(info) {
            // Cuando el usuario selecciona una fecha, abrimos el diseño del modal
            document.getElementById('fechaInicio').value = info.startStr;
            document.getElementById('fechaFin').value = info.endStr;
            modal.style.display = 'block';
        }
    });

    calendar.render();

    // Cerrar modal
    document.getElementById('btnCerrarModal').onclick = () => modal.style.display = 'none';

    // Enviar información al backend
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const nuevaCita = {
            titulo: document.getElementById('inputTitulo').value,
            descripcion: document.getElementById('inputDesc').value,
            fecha_inicio: document.getElementById('fechaInicio').value,
            fecha_fin: document.getElementById('fechaFin').value,
            fk_id_usuario: localStorage.getItem('id_usuario') // El ID que viene del login
        };

        const response = await fetch('http://localhost:3000/api/citas', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(nuevaCita)
        });

        if (response.ok) {
            modal.style.display = 'none';
            form.reset();
            calendar.refetchEvents(); // Recarga las citas sin refrescar la página
            alert("Cita agendada correctamente");
        }
    };
};