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
        // La información del usuario ahora se lee desde localStorage
        const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        const userId = localStorage.getItem('userId');

        if (!userRoles || !userId) {
            console.error('No se encontró información del usuario en localStorage.');
            localStorage.removeItem('accessToken');
            window.location.href = 'login.html';
            return;
        }

        // Simular el objeto currentUser
        currentUser = {
            id: userId,
            roles: userRoles,
            primaryRole: userRoles[0] || 'default' // Usar el primer rol como primario
        };

        renderUserInfo(currentUser);
        renderNavigation(currentUser.primaryRole);
        setupEventListeners(token, currentUser.primaryRole);

        // --- Cargar Módulos de Propuesta de Integración ---
        translatePage();
        initializeNotifications();

        // Cargar la vista inicial (dashboard) por defecto
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

        // Apply saved theme on startup
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
                    area: "Deportes", // Hardcodeado para la prueba
                    thread_id: `user_${currentUser.id}_${Date.now()}` // Generar un thread_id simple
                })
            });

            const data = await response.json();

            if (response.ok) {
                // La API de agente devuelve un placeholder, lo mostramos
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
            // Mostrar los roles del usuario
            userInfoDiv.innerHTML = `
                <p><strong>Usuario: ${user.id}</strong></p>
                <span>Roles: ${user.roles.join(', ')}</span>
            `;
        }
    }

    initializeApp();
});
