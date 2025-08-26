document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    const logoutBtn = document.getElementById('logout-btn');
    let currentUser = null;

    // -- 1. Proteger la ruta --
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // -- 2. Configurar el botón de cierre de sesión --
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            currentUser = null;
            window.location.href = 'login.html';
        });
    }

    // -- 3. Cargar datos del usuario y renderizar la aplicación --
    async function initializeApp() {
        try {
            currentUser = await fetchCurrentUser(token);
            renderUserInfo(currentUser);
            const roleName = currentUser.rol ? currentUser.rol.nombre : 'default';
            renderNavigation(roleName);
            setupEventListeners(token, roleName); // Pasar roleName a los listeners

            // --- Cargar Módulos de Propuesta de Integración ---
            translatePage(); // MILA: Traducir la página inicial
            initializeNotifications(); // SNAT: Iniciar el sistema de notificaciones simulado

            // Cargar la vista inicial (dashboard) por defecto
            renderContentForView('dashboard', token, roleName);
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
        }
    }

    function setupEventListeners(token, roleName) {
        const navContainer = document.getElementById('app-nav');
        const langSelect = document.getElementById('language-select');

        if (navContainer) {
            navContainer.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.dataset.view) {
                    e.preventDefault();
                    const viewName = link.dataset.view;
                    renderContentForView(viewName, token, roleName);
                }
            });
        }

        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                setLanguage(e.target.value);
            });
        }
    }

    // --- Propuesta de Integración para SNAT (Notificaciones en Tiempo Real) ---
    function initializeNotifications() {
        console.log("SNAT: Inicializando módulo de notificaciones (simulado).");
        const notifCount = document.getElementById('notification-count');
        let count = 0;

        // Simular la recepción de una notificación cada 15 segundos
        setInterval(() => {
            count++;
            notifCount.textContent = count;
            notifCount.style.display = 'block';
            console.log(`SNAT: Notificación #${count} recibida (simulado).`);
            // En una implementación real, aquí se usaría una conexión WebSocket
            // para recibir eventos del servidor y actualizar la UI.
        }, 15000);
    }

    async function fetchCurrentUser(authToken) {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/users/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Token inválido o expirado');
        }
        return await response.json();
    }

    function renderUserInfo(user) {
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            // Suponiendo que la API devuelve 'nombre_completo' y 'rol'
            userInfoDiv.innerHTML = `
                <p><strong>${user.nombre_completo || user.username}</strong></p>
                <span>${user.rol.nombre || 'Sin rol'}</span>
            `;
        }
    }

    initializeApp();
});
