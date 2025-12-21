import { MENU } from "./menu.js";
import { requireAuth } from "../core/auth/guard.js";
import { getUser, logout } from "../core/auth/session.js";
import { loadModule } from "../core/router/router.js";

requireAuth();

const user = JSON.parse(localStorage.getItem("user"));

if (user.rol !== "ADMIN") {
  alert("Acceso no autorizado");
  window.location.href = "../views/login.html";
}

const menu = document.getElementById("menu");
const content = document.getElementById("content");

document.getElementById("userInfo").textContent =
  `${user.username} (${user.rol})`;

// Construir menú
MENU[user.rol].forEach(item => {
  const li = document.createElement("li");
  li.textContent = item.label;
  li.onclick = () => loadModule(item.module, content);
  menu.appendChild(li);
});

// Logout
document.getElementById("logout").onclick = logout;

// Vista inicial
loadModule(MENU[user.rol][0].module, content);
