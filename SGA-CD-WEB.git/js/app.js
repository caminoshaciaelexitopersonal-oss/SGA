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
    function initializeApp() {
        const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        const userId = localStorage.getItem('userId');

        if (!userRoles || !userId) {
            console.error('No se encontró información del usuario en localStorage.');
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            return;
        }

        currentUser = {
            id: userId,
            roles: userRoles,
            primaryRole: userRoles[0] || 'default'
        };

        renderUserInfo(currentUser);
        renderNavigation(currentUser.primaryRole);
        setupEventListeners(token, currentUser.primaryRole);

        translatePage();
        initializeNotifications();
        renderContentForView('dashboard', token, currentUser.primaryRole);
    }

    function setupEventListeners(token, roleName) {
        const navContainer = document.getElementById('app-nav');
        const langSelect = document.getElementById('language-select');
        const agentForm = document.getElementById('agent-form');
        const themeToggle = document.getElementById('theme-toggle');

        // --- Theme Switcher Logic ---
        function applyTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            if (themeToggle) themeToggle.checked = theme === 'dark';
        }

        function toggleTheme() {
            const newTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        }

        if (themeToggle) {
            themeToggle.addEventListener('change', toggleTheme);
        }

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);

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

        if (agentForm) {
            agentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const orderInput = document.getElementById('agent-order-input');
                const order = orderInput.value.trim();
                if (order) {
                    invokeAgent(order, token);
                    orderInput.value = '';
                }
            });
        }
    }

    // --- Lógica para el Agente de IA ---
    async function invokeAgent(prompt, authToken) {
        const responseArea = document.getElementById('agent-response-area');
        const submitBtn = document.getElementById('agent-submit-btn');

        responseArea.textContent = 'Procesando orden...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/agent/invoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    area: "Deportes",
                    thread_id: `user_${currentUser.id}_${Date.now()}`
                })
            });

            const data = await response.json();

            if (response.ok) {
                responseArea.textContent = `Respuesta del Agente: ${JSON.stringify(data, null, 2)}`;
            } else {
                responseArea.textContent = `Error: ${data.detail || 'Error desconocido del servidor.'}`;
            }

        } catch (error) {
            console.error('Error al invocar al agente:', error);
            responseArea.textContent = 'Error de conexión al invocar al agente.';
        } finally {
            submitBtn.disabled = false;
        }
    }

    // --- Propuesta de Integración para SNAT (Notificaciones en Tiempo Real) ---
    function initializeNotifications() {
        // ... (código existente sin cambios)
    }

    function renderUserInfo(user) {
        const userInfoDiv = document.getElementById('user-info');
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <p><strong>Usuario: ${user.id}</strong></p>
                <span>Roles: ${user.roles.join(', ')}</span>
            `;
        }
    }

    function renderNavigation(roleName) {
        const navDiv = document.getElementById('app-nav');
        if (navDiv) {
            // Renderización simple basada en roles
            const links = [];
            if (roleName === 'admin') {
                links.push({ name: 'Dashboard', view: 'dashboard' });
                links.push({ name: 'Usuarios', view: 'users' });
            } else {
                links.push({ name: 'Dashboard', view: 'dashboard' });
            }
            navDiv.innerHTML = links.map(link => `<a href="#" data-view="${link.view}">${link.name}</a>`).join(' | ');
        }
    }

    function renderContentForView(viewName, token, roleName) {
        const contentDiv = document.getElementById('app-content');
        if (!contentDiv) return;

        switch(viewName) {
            case 'dashboard':
                contentDiv.innerHTML = `<h2>Bienvenido al Dashboard, ${roleName}</h2>`;
                break;
            case 'users':
                contentDiv.innerHTML = `<h2>Gestión de Usuarios</h2>`;
                break;
            default:
                contentDiv.innerHTML = `<h2>Vista no encontrada</h2>`;
        }
    }

    function setLanguage(lang) {
        console.log('Idioma seleccionado:', lang);
        // Aquí iría la lógica para cambiar idioma
    }

    initializeApp();
});
