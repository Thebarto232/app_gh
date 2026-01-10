import { apiFetch } from "../../api/api.js";

export const initModuloCalendario = async () => {
    const calendarEl = document.getElementById('calendar');
    
    // Configuración de FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es', // Español
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            list: 'Lista'
        },
        events: async (info, successCallback, failureCallback) => {
            try {
                // Llamamos a nuestro backend
                const eventos = await apiFetch('/calendario');
                successCallback(eventos);
            } catch (error) {
                console.error("Error cargando calendario", error);
                failureCallback(error);
            }
        },
        eventClick: (info) => {
            // Al hacer click en un evento
            Swal.fire({
                title: info.event.title,
                text: `Fecha: ${info.event.start.toLocaleDateString()}`,
                icon: 'info',
                confirmButtonColor: info.event.backgroundColor
            });
        }
    });

    calendar.render();
};

// MODAL PARA NUEVO EVENTO
window.modalNuevoEvento = async () => {
    const { value: formValues } = await Swal.fire({
        title: 'Agendar Nuevo Evento',
        html: `
            <input id="cal-titulo" class="swal2-input" placeholder="Título del evento">
            <div style="margin: 10px 0; text-align:left; color:#64748b; font-size:0.9rem;">Fecha y Hora Inicio:</div>
            <input id="cal-inicio" class="swal2-input" type="datetime-local" style="margin-top:0;">
            <div style="margin: 10px 0; text-align:left; color:#64748b; font-size:0.9rem;">Fecha y Hora Fin:</div>
            <input id="cal-fin" class="swal2-input" type="datetime-local" style="margin-top:0;">
            <select id="cal-tipo" class="swal2-select">
                <option value="CITA">Reunión / Cita</option>
                <option value="CITA_MEDICA">Cita Médica</option>
                <option value="OTRO">Otro</option>
            </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        preConfirm: () => {
            return {
                titulo: document.getElementById('cal-titulo').value,
                fecha_inicio: document.getElementById('cal-inicio').value,
                fecha_fin: document.getElementById('cal-fin').value,
                tipo: document.getElementById('cal-tipo').value
            }
        }
    });

    if (formValues) {
        if(!formValues.titulo || !formValues.fecha_inicio) return Swal.fire('Error', 'Faltan datos', 'error');

        try {
            await apiFetch('/calendario', {
                method: 'POST',
                body: JSON.stringify(formValues)
            });
            
            Swal.fire('Guardado', 'Evento agregado al calendario', 'success');
            
            // Recargar el módulo para ver el nuevo evento
            initModuloCalendario(); 
            
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
};