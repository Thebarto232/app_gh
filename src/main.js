import './style.css';
import { initRouter } from './router/router.js';

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Si hay usuario, llenamos los componentes del Layout que ya están en index.html
    if (user) {
        const elements = {
            name: document.getElementById('display-user-name'),
            role: document.getElementById('user-role-badge'),
            avatar: document.getElementById('user-avatar-head'),
            greeting: document.getElementById('dynamic-greeting')
        };

        if (elements.name) elements.name.innerText = user.nombre || user.username;
        if (elements.role) elements.role.innerText = user.rol;
        if (elements.avatar) {
            elements.avatar.innerText = (user.nombre || user.username || 'U').charAt(0).toUpperCase();
        }

        if (elements.greeting) {
            const hr = new Date().getHours();
            const msg = hr < 12 ? 'Buen día' : hr < 18 ? 'Buenas tardes' : 'Buenas noches';
            elements.greeting.innerText = `${msg}, ${user.nombre?.split(' ')[0] || 'Usuario'}`;
        }
    }

    // Arrancamos el router
    initRouter();
});