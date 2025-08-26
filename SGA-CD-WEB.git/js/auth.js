document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('login-mensaje');

    // Redirigir si el usuario ya está logueado
    if (localStorage.getItem('accessToken')) {
        window.location.href = 'app.html';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showMessage('Por favor, ingresa usuario y contraseña.', 'error');
                return;
            }

            showMessage('Iniciando sesión...', 'info');

            try {
                const response = await fetch(`${config.apiBaseUrl}/api/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.access_token) {
                        localStorage.setItem('accessToken', data.access_token);
                        showMessage('Inicio de sesión exitoso. Redirigiendo...', 'success');
                        setTimeout(() => {
                            window.location.href = 'app.html';
                        }, 1500);
                    } else {
                        showMessage('Respuesta inesperada del servidor.', 'error');
                    }
                } else {
                    showMessage(data.detail || 'Credenciales inválidas.', 'error');
                }

            } catch (error) {
                console.error('Error de inicio de sesión:', error);
                showMessage('No se pudo conectar con el servidor.', 'error');
            }
        });
    }

    function showMessage(message, type) {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message-${type}`;
        }
    }
});
