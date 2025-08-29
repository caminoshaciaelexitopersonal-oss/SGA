// js/views/admin_general.js

// --- Vistas para el Rol de Administrador General ---

/**
 * Renderiza el dashboard principal para el Administrador General.
 */
async function renderAdminGeneralDashboardView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-shield-alt"></i> Panel del Administrador General</h2>
        </div>
        <p>Bienvenido, Super Administrador. Desde aquí podrá gestionar la configuración global de la plataforma.</p>
        <p>Seleccione una opción del menú para comenzar.</p>
    `;
}

/**
 * Renderiza la vista para configurar la integración con WhatsApp.
 */
async function renderConfiguracionWhatsAppView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fab fa-whatsapp"></i> Configuración de Integración con WhatsApp</h2>
        </div>
        <div class="form-container">
            <p>Aquí puede configurar las credenciales para conectar el sistema con la API de WhatsApp Business.</p>
            <form id="whatsapp-config-form">
                <div class="form-group">
                    <label for="whatsapp-api-token">API Token</label>
                    <input type="password" id="whatsapp-api-token" placeholder="Su token de acceso permanente">
                </div>
                <div class="form-group">
                    <label for="whatsapp-phone-id">Phone Number ID</label>
                    <input type="text" id="whatsapp-phone-id" placeholder="El ID de su número de teléfono de WhatsApp">
                </div>
                <div class="form-group">
                    <label for="whatsapp-verify-token">Verify Token</label>
                    <input type="text" id="whatsapp-verify-token" value="sga-cd-whatsapp-secret" readonly>
                    <small>Este token debe ser configurado en su panel de Meta for Developers.</small>
                </div>
                <button type="submit" class="btn-primary">Guardar Configuración</button>
            </form>
            <div id="config-feedback" class="message-info" style="display:none; margin-top: 1rem;"></div>
        </div>
    `;

    document.getElementById('whatsapp-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackDiv = document.getElementById('config-feedback');
        const submitButton = e.target.querySelector('button');
        submitButton.disabled = true;
        feedbackDiv.style.display = 'block';
        feedbackDiv.textContent = 'Guardando configuración...';

        const payload = {
            api_token: document.getElementById('whatsapp-api-token').value,
            phone_number_id: document.getElementById('whatsapp-phone-id').value
        };

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/settings/whatsapp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error desconocido del servidor.');
            }

            feedbackDiv.className = 'message-success';
            feedbackDiv.textContent = '¡Configuración guardada con éxito!';
        } catch (error) {
            feedbackDiv.className = 'message-error';
            feedbackDiv.textContent = `Error: ${error.message}`;
        } finally {
            submitButton.disabled = false;
        }
    });
}


/**
 * Renderiza la vista para gestionar las claves de API de los LLMs.
 */
async function renderGestionLLMView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-key"></i> Gestión de Claves de API para LLMs</h2>
        </div>
        <div id="llm-form-container" class="form-container">
            <p>Cargando configuración...</p>
        </div>
    `;

    // 1. Fetch current settings first
    let currentSettings = { openai_api_key: '', google_api_key: '', runwayml_api_key: '' };
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/settings/llm`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            currentSettings = await response.json();
        } else {
            console.warn("Could not fetch current LLM settings.");
        }
    } catch (e) {
        console.error("Error fetching LLM settings:", e);
    }

    // 2. Render the form
    const formContainer = document.getElementById('llm-form-container');
    formContainer.innerHTML = `
        <p>Añada las claves de API para los modelos de lenguaje y generación de video que desea utilizar.</p>
        <form id="llm-config-form">
            <div class="form-group">
                <label for="openai-api-key">OpenAI API Key</label>
                <input type="password" id="openai-api-key" placeholder="sk-..." value="${currentSettings.openai_api_key || ''}">
            </div>
            <div class="form-group">
                <label for="google-api-key">Google API Key</label>
                <input type="password" id="google-api-key" placeholder="AIza..." value="${currentSettings.google_api_key || ''}">
            </div>
            <div class="form-group">
                <label for="runwayml-api-key">RunwayML API Key</label>
                <input type="password" id="runwayml-api-key" placeholder="Su clave de RunwayML" value="${currentSettings.runwayml_api_key || ''}">
            </div>
            <button type="submit" class="btn-primary">Guardar Claves</button>
        </form>
        <div id="llm-config-feedback" class="message-info" style="display:none; margin-top: 1rem;"></div>
    `;

    // 3. Add submit listener
    document.getElementById('llm-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackDiv = document.getElementById('llm-config-feedback');
        const submitButton = e.target.querySelector('button');
        submitButton.disabled = true;
        feedbackDiv.style.display = 'block';
        feedbackDiv.textContent = 'Guardando claves...';

        const payload = {
            openai_api_key: document.getElementById('openai-api-key').value,
            google_api_key: document.getElementById('google-api-key').value,
            runwayml_api_key: document.getElementById('runwayml-api-key').value
        };

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/settings/llm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error desconocido del servidor.');
            }

            feedbackDiv.className = 'message-success';
            feedbackDiv.textContent = '¡Claves guardadas con éxito!';
        } catch (error) {
            feedbackDiv.className = 'message-error';
            feedbackDiv.textContent = `Error: ${error.message}`;
        } finally {
            submitButton.disabled = false;
        }
    });
}


/**
 * Renderiza la vista para la Creación de Videos con IA.
 */
async function renderCreacionVideosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-video"></i> Creación de Videos Promocionales con IA</h2>
        </div>
        <div class="form-container">
            <p>Describa el video que desea crear. Sea lo más detallado posible.</p>
            <form id="video-creation-form">
                <div class="form-group">
                    <label for="video-prompt">Prompt del Video:</label>
                    <textarea id="video-prompt" class="form-textarea" rows="5" required placeholder="Ej: Un video corto y dinámico para TikTok mostrando a jóvenes practicando baloncesto, con música enérgica y texto que dice '¡Únete a nuestra academia!'"></textarea>
                </div>
                <div class="form-group">
                    <label for="video-format">Formato del Video:</label>
                    <select id="video-format">
                        <option value="youtube_short">YouTube Short (1080x1920)</option>
                        <option value="tiktok">TikTok Reel (1080x1920)</option>
                        <option value="instagram_story">Instagram Story (1080x1920)</option>
                        <option value="youtube_landscape">YouTube Video (1920x1080)</option>
                        <option value="instagram_post">Instagram Post (1080x1080)</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">Generar Video</button>
            </form>
            <div id="video-status-container" style="margin-top: 1.5rem;">
                <!-- Status updates will appear here -->
            </div>
            <div id="video-player-container" style="margin-top: 1.5rem; display: none;">
                <h3>Video Generado:</h3>
                <video id="generated-video" width="100%" controls></video>
            </div>
        </div>
    `;

    document.getElementById('video-creation-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = document.getElementById('video-prompt').value;
        const statusContainer = document.getElementById('video-status-container');
        const playerContainer = document.getElementById('video-player-container');
        const videoPlayer = document.getElementById('generated-video');
        const submitButton = e.target.querySelector('button');

        submitButton.disabled = true;
        playerContainer.style.display = 'none';
        statusContainer.innerHTML = `<p class="message-info">Enviando solicitud para generar video... (Esto puede tardar un momento)</p>`;

        try {
            // 1. Start generation
            const startResponse = await fetch(`${config.apiBaseUrl}/api/v1/video_creation/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!startResponse.ok) {
                const errorData = await startResponse.json();
                throw new Error(errorData.detail || 'No se pudo iniciar la generación del video.');
            }
            const { job_id } = await startResponse.json();
            statusContainer.innerHTML = `<p class="message-info">¡Trabajo iniciado! ID: ${job_id}. Esperando la finalización del video. Esto puede tardar varios minutos...</p>`;

            // 2. Poll for status
            const pollInterval = setInterval(async () => {
                try {
                    const statusResponse = await fetch(`${config.apiBaseUrl}/api/v1/video_creation/status/${job_id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!statusResponse.ok) return; // Continue polling silently

                    const statusData = await statusResponse.json();
                    if (statusData.status === 'completed') {
                        clearInterval(pollInterval);
                        statusContainer.innerHTML = `<p class="message-success">¡Video generado con éxito!</p>`;
                        videoPlayer.src = statusData.video_url;
                        playerContainer.style.display = 'block';
                        submitButton.disabled = false;
                    } else if (statusData.status === 'failed') {
                         clearInterval(pollInterval);
                         statusContainer.innerHTML = `<p class="message-error">La generación del video ha fallado.</p>`;
                         submitButton.disabled = false;
                    }
                    // If status is 'pending', do nothing and wait for the next poll.

                } catch (pollError) {
                    // Ignore individual poll errors
                }
            }, 5000); // Poll every 5 seconds

        } catch (error) {
            statusContainer.innerHTML = `<p class="message-error">Error: ${error.message}</p>`;
            submitButton.disabled = false;
        }
    });
}


/**
 * Renderiza la vista para la Distribución de Videos.
 */
async function renderDistribucionVideosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-share-square"></i> Distribución de Videos Generados</h2>
        </div>
        <div id="video-list-container">
            <p>Cargando videos completados...</p>
        </div>
    `;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/video_creation/completed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("No se pudieron cargar los videos generados.");

        const videos = await response.json();
        const container = document.getElementById('video-list-container');

        if (videos.length === 0) {
            container.innerHTML = `<p class="message-info">No hay videos generados listos para distribuir.</p>`;
            return;
        }

        const videoCards = videos.map(video => `
            <div class="card video-distribution-card">
                <video src="${video.video_url}" controls muted loop width="100%"></video>
                <div class="card-body">
                    <p><strong>Prompt:</strong> ${video.prompt}</p>
                    <button class="btn-primary btn-distribute" data-video-url="${video.video_url}">Distribuir este Video</button>
                </div>
            </div>
        `).join('');
        container.innerHTML = `<div class="card-container">${videoCards}</div>`;

        // Add listener for distribute buttons
        container.querySelectorAll('.btn-distribute').forEach(button => {
            button.addEventListener('click', (e) => {
                const videoUrl = e.target.dataset.videoUrl;
                openDistributionModal(token, videoUrl);
            });
        });

    } catch (error) {
        document.getElementById('video-list-container').innerHTML = `<p class="message-error">${error.message}</p>`;
    }
}

function openDistributionModal(token, videoUrl) {
    const modalBodyContent = `
        <form id="distribution-form" class="form-container">
            <input type="hidden" id="dist-video-url" value="${videoUrl}">
            <div class="form-group">
                <label for="dist-title">Título del Video</label>
                <input type="text" id="dist-title" required placeholder="Un título atractivo para tu video">
            </div>
            <div class="form-group">
                <label for="dist-description">Descripción</label>
                <textarea id="dist-description" class="form-textarea" rows="4" required placeholder="Describe tu video, incluye hashtags..."></textarea>
            </div>
            <div class="form-group">
                <label>Plataformas de Destino:</label>
                <div class="checkbox-group">
                    <label><input type="checkbox" name="platform" value="youtube"> YouTube</label>
                    <label><input type="checkbox" name="platform" value="tiktok"> TikTok</label>
                    <label><input type="checkbox" name="platform" value="instagram"> Instagram</label>
                    <label><input type="checkbox" name="platform" value="facebook"> Facebook</label>
                </div>
            </div>
            <button type="submit" class="btn-primary">Publicar en Plataformas Seleccionadas</button>
        </form>
        <div id="dist-feedback" style="margin-top: 1rem;"></div>
    `;

    openModal("Distribuir Video", modalBodyContent);

    document.getElementById('distribution-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackDiv = document.getElementById('dist-feedback');
        const submitButton = e.target.querySelector('button');
        const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(cb => cb.value);

        if (selectedPlatforms.length === 0) {
            feedbackDiv.innerHTML = `<p class="message-error">Por favor, seleccione al menos una plataforma.</p>`;
            return;
        }

        submitButton.disabled = true;
        feedbackDiv.innerHTML = `<p class="message-info">Publicando en ${selectedPlatforms.join(', ')}...</p>`;

        const payload = {
            platforms: selectedPlatforms,
            video_url: document.getElementById('dist-video-url').value,
            title: document.getElementById('dist-title').value,
            description: document.getElementById('dist-description').value,
        };

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/video_distribution/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.detail?.message || 'Error en la publicación.');

            let feedbackHtml = '<h4>Resultados de la Publicación:</h4>';
            result.successes?.forEach(s => {
                feedbackHtml += `<p class="message-success">Éxito en ${s.platform}: <a href="${s.post_url}" target="_blank">Ver publicación</a></p>`;
            });
            result.failures?.forEach(f => {
                feedbackHtml += `<p class="message-error">Fallo en ${f.platform}: ${f.error}</p>`;
            });
            feedbackDiv.innerHTML = feedbackHtml;

        } catch (error) {
            feedbackDiv.innerHTML = `<p class="message-error">Error: ${error.message}</p>`;
        } finally {
            submitButton.disabled = false;
        }
    });
}


// --- Registrar las vistas de Administrador General en el Router ---
if (typeof registerView === 'function') {
    registerView('admin_general', 'dashboard', renderAdminGeneralDashboardView);
    registerView('admin_general', 'configuracion-whatsapp', renderConfiguracionWhatsAppView);
    registerView('admin_general', 'gestion-llm', renderGestionLLMView);
    registerView('admin_general', 'creacion-videos', renderCreacionVideosView);
    registerView('admin_general', 'distribucion-videos', renderDistribucionVideosView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
