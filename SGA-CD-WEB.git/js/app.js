document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    const logoutBtn = document.getElementById('logout-btn');

    // -- 1. Proteger la ruta --
    // Si no hay token, redirigir a la página de login
    if (!token) {
        window.location.href = 'login.html';
        return; // Detener la ejecución del script
    }

    // -- 2. Configurar el botón de cierre de sesión --
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
        });
    }

    // -- 3. Cargar datos del usuario y renderizar la aplicación --
    async function initializeApp() {
        try {
            const user = await fetchCurrentUser(token);
            renderUserInfo(user);
            // La API devuelve el rol como un objeto, necesitamos el nombre.
            const roleName = user.rol ? user.rol.nombre : 'default';
            renderNavigation(roleName);
            setupEventListeners(token);
            // Cargar la vista inicial (dashboard) por defecto
            renderContentForView('dashboard', token);
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            // Si el token es inválido (ej. expiró), desloguear
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
        }
    }

    function setupEventListeners(token) {
        const navContainer = document.getElementById('app-nav');
        const langSwitcher = document.querySelector('.language-switcher');

        if (navContainer) {
            navContainer.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.dataset.view) {
                    e.preventDefault();
                    const viewName = link.dataset.view;
                    renderContentForView(viewName, token);
                }
            });
        }

        if(langSwitcher) {
            langSwitcher.addEventListener('click', e => {
                if(e.target.tagName === 'BUTTON') {
                    const lang = e.target.dataset.lang;
                    i18n.setLanguage(lang);
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
            const roleName = user.rol ? user.rol.nombre : i18n.t('users_table_role');
            userInfoDiv.innerHTML = `
                <p><strong>${user.nombre_completo || user.username}</strong></p>
                <span>${roleName}</span>
            `;
        }
    }

    initializeApp();
});
