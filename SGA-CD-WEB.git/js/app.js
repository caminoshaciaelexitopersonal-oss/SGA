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
