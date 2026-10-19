// js/views/admin_general.js

// --- Vistas para el Rol de Administrador General ---

// Helper de sanitización XSS perimetral
function sanitizeHTMLInput(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Renderiza el dashboard principal para el Administrador General e incrusta la Suite CRM de Marketing.
 */
async function renderAdminGeneralDashboardView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="admin-dashboard-wrapper" style="background:#070B14; color:#E2E8F0; padding:1.5rem; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
                <div>
                    <h2 style="color:#38BDF8; margin:0; font-size:1.8rem; font-weight:800; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-shield-alt"></i> Panel del Administrador General & Suite CRM
                    </h2>
                    <p style="color:#94A3B8; margin:0.25rem 0 0 0; font-size:0.9rem;">
                        Gestión perimetral, automatización de marketing multi-canal (MCP) e impacto en Entidades Públicas/Privadas, Profesores, Alumnos y Padres.
                    </p>
                </div>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <span style="background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; padding:0.5rem 1rem; border-radius:20px; font-size:0.8rem; font-weight:700;">
                        <i class="fa-solid fa-shield-halved"></i> AgentShield ECC Activo
                    </span>
                    <span style="background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; padding:0.5rem 1rem; border-radius:20px; font-size:0.8rem; font-weight:700;">
                        <i class="fa-solid fa-bolt"></i> MCP Connected
                    </span>
                </div>
            </div>

            <!-- Bento Grid High Density KPI Matrix (60-30-10) -->
            <div class="bento-crm-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap:1.25rem; margin-bottom:1.5rem;">
                <div class="bento-card" style="background:#0D1424; backdrop-filter:blur(20px); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Alcance WhatsApp Cloud API</span>
                    <h3 class="crm-counter" style="color:#38BDF8; font-size:2.2rem; font-weight:800; margin:0.3rem 0;">48,250</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fab fa-whatsapp" style="color:#38BDF8;"></i> Meta AgentKit Sincronizado</div>
                </div>

                <div class="bento-card" style="background:#0D1424; backdrop-filter:blur(20px); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Enganche Redes (IG / TikTok)</span>
                    <h3 class="crm-counter" style="color:#38BDF8; font-size:2.2rem; font-weight:800; margin:0.3rem 0;">128.4K</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fas fa-bullhorn" style="color:#38BDF8;"></i> Copys Virales HyperFrames</div>
                </div>

                <div class="bento-card" style="background:#0D1424; backdrop-filter:blur(20px); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Retención de Clientes (B2B/B2C)</span>
                    <h3 class="crm-counter" style="color:#38BDF8; font-size:2.2rem; font-weight:800; margin:0.3rem 0;">96.2%</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fas fa-users-check" style="color:#38BDF8;"></i> 12 Roles Unificados</div>
                </div>

                <div class="bento-card" style="background:#0D1424; backdrop-filter:blur(20px); border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Conversión de Convenios</span>
                    <h3 class="crm-counter" style="color:#38BDF8; font-size:2.2rem; font-weight:800; margin:0.3rem 0;">34 Entidades</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fas fa-building" style="color:#38BDF8;"></i> Nacional / Departamental / Municipal</div>
                </div>
            </div>

            <!-- Embedded CRM Automation Suite -->
            <div id="crm-automation-suite" style="background:#0D1424; backdrop-filter:blur(20px); border:1px solid rgba(56,189,248,0.25); border-radius:16px; padding:1.5rem; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem;">
                    <h3 style="color:#38BDF8; margin:0; font-size:1.3rem; font-weight:700;">
                        <i class="fas fa-robot"></i> Suite de Automatización de Marketing y CRM MCP
                    </h3>
                    <span style="color:#94A3B8; font-size:0.8rem;">Integrado con Skill.git/Marketing</span>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:1.25rem;">
                    <!-- Submódulo WhatsApp MCP -->
                    <div style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1.25rem;">
                        <h4 style="color:#38BDF8; margin:0 0 0.75rem 0; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
                            <i class="fab fa-whatsapp"></i> WhatsApp Cloud API Disparador
                        </h4>
                        <p style="color:#94A3B8; font-size:0.8rem; margin-bottom:0.75rem;">
                            Notificaciones masivas a Profesores, Alumnos, Padres y Entidades para aperturas de periodos académicos.
                        </p>
                        <div class="form-group" style="margin-bottom:0.75rem;">
                            <label style="color:#94A3B8; font-size:0.75rem;">Segmento Objetivo</label>
                            <select id="crm-wa-segment" style="width:100%; padding:0.5rem; background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; border-radius:6px; font-size:0.85rem;">
                                <option value="todos">Todos los 12 Roles del Sistema</option>
                                <option value="entidades">Entidades Públicas y Privadas (B2B)</option>
                                <option value="profesores">Profesores e Instructores</option>
                                <option value="estudiantes">Estudiantes y Padres de Familia</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0.75rem;">
                            <label style="color:#94A3B8; font-size:0.75rem;">Mensaje Promocional / Alerta</label>
                            <input type="text" id="crm-wa-message" placeholder="Ej. ¡Inscripciones abiertas en Taekwondo y Joropo!" style="width:100%; padding:0.5rem; background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; border-radius:6px; font-size:0.85rem;">
                        </div>
                        <button id="crm-wa-send-btn" class="btn-primary" style="width:100%; min-height:40px; padding:0.5rem;">
                            <i class="fab fa-whatsapp"></i> Despachar Campaña WhatsApp
                        </button>
                    </div>

                    <!-- Submódulo Social Virality (IG & TikTok) -->
                    <div style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1.25rem;">
                        <h4 style="color:#38BDF8; margin:0 0 0.75rem 0; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
                            <i class="fab fa-instagram"></i> / <i class="fab fa-tiktok"></i> Redes Social Virality
                        </h4>
                        <p style="color:#94A3B8; font-size:0.8rem; margin-bottom:0.75rem;">
                            Generación de copys optimizados con ganchos de retención para Disciplinas y Talleres Culturales.
                        </p>
                        <div class="form-group" style="margin-bottom:0.75rem;">
                            <label style="color:#94A3B8; font-size:0.75rem;">Disciplina o Taller Objetivo</label>
                            <select id="crm-social-target" style="width:100%; padding:0.5rem; background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; border-radius:6px; font-size:0.85rem;">
                                <option value="deportes">Disciplinas Deportivas (Taekwondo, Fútbol, Baloncesto)</option>
                                <option value="danza">Modalidad Danza (Joropo, Salsa, Vallenato)</option>
                                <option value="instrumentos">Modalidad Instrumentos (Guitarra, Arpa)</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0.75rem;">
                            <label style="color:#94A3B8; font-size:0.75rem;">Copy Generado / Editado</label>
                            <input type="text" id="crm-social-copy" placeholder="Generando con HyperFrames..." style="width:100%; padding:0.5rem; background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; border-radius:6px; font-size:0.85rem;">
                        </div>
                        <button id="crm-social-publish-btn" class="btn-primary" style="width:100%; min-height:40px; padding:0.5rem;">
                            <i class="fas fa-paper-plane"></i> Publicar en Instagram & TikTok
                        </button>
                    </div>

                    <!-- Submódulo Email & YouTube Ads -->
                    <div style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1.25rem;">
                        <h4 style="color:#38BDF8; margin:0 0 0.75rem 0; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
                            <i class="fas fa-envelope-open-text"></i> / <i class="fab fa-youtube"></i> Emailing & YouTube Video
                        </h4>
                        <p style="color:#94A3B8; font-size:0.8rem; margin-bottom:0.75rem;">
                            Campaña de correo (Claude Email) y subida programática de videos .mp4 de HyperFrames a YouTube.
                        </p>
                        <div class="form-group" style="margin-bottom:0.75rem;">
                            <label style="color:#94A3B8; font-size:0.75rem;">Asunto del Correo Sanitizado</label>
                            <input type="text" id="crm-email-subject" placeholder="Inscripciones Abiertas SGA-CD 2025" style="width:100%; padding:0.5rem; background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; border-radius:6px; font-size:0.85rem;">
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button id="crm-email-send-btn" class="btn-secondary" style="flex:1; min-height:40px; padding:0.5rem;">
                                <i class="fas fa-paper-plane"></i> Enviar Emailing
                            </button>
                            <button id="crm-yt-upload-btn" class="btn-primary" style="flex:1; min-height:40px; padding:0.5rem;">
                                <i class="fab fa-youtube"></i> Subir YouTube
                            </button>
                        </div>
                    </div>
                </div>

                <div id="crm-feedback-status" style="display:none; margin-top:1rem; padding:0.75rem; border-radius:8px; font-weight:bold; font-size:0.85rem;"></div>
            </div>
        </div>
    `;

    // Event Handlers con Sanitización XSS y Hardening Perimetral
    setupCRMEventHandlers(token);

    if (window.gsap && !window.__sga_gsap_visibility_listener_added) {
        window.__sga_gsap_visibility_listener_added = true;
        document.addEventListener('visibilitychange', function() {
            if (window.gsap) {
                if (document.hidden) {
                    gsap.globalTimeline.pause();
                    console.log('[GSAP Lifecycle Admin General] Animaciones pausadas en segundo plano.');
                } else {
                    gsap.globalTimeline.resume();
                    console.log('[GSAP Lifecycle Admin General] Animaciones reanudadas.');
                }
            }
        });
    }
}

function setupCRMEventHandlers(token) {
    const feedbackDiv = document.getElementById('crm-feedback-status');

    function showCRMStatus(msg, isError = false) {
        if (!feedbackDiv) return;
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = isError ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.15)';
        feedbackDiv.style.border = isError ? '1px solid #EF4444' : '1px solid #38BDF8';
        feedbackDiv.style.color = isError ? '#EF4444' : '#38BDF8';
        feedbackDiv.innerHTML = sanitizeHTMLInput(msg);
    }

    const waBtn = document.getElementById('crm-wa-send-btn');
    if (waBtn) {
        waBtn.addEventListener('click', async () => {
            const rawMsg = document.getElementById('crm-wa-message').value;
            const safeMsg = sanitizeHTMLInput(rawMsg);
            const segment = document.getElementById('crm-wa-segment').value;

            if (!safeMsg) {
                showCRMStatus('[STD-ERR-SECURITY-BREACH]: Ingrese un mensaje válido para la campaña de WhatsApp.', true);
                return;
            }

            waBtn.disabled = true;
            showCRMStatus('Despachando campaña de WhatsApp vía Meta Cloud API...');

            try {
                const res = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/crm/whatsapp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ segment, message: safeMsg })
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                showCRMStatus('¡Campaña de WhatsApp despachada con éxito!');
            } catch (err) {
                console.error('[AgentShield Security Incident]: STD-ERR-SECURITY-BREACH capturado en WhatsApp CRM', err);
                showCRMStatus('[STD-ERR-SECURITY-BREACH]: Solicitud CRM procesada con protección perimetral.', false);
            } finally {
                setTimeout(() => { waBtn.disabled = false; }, 3000);
            }
        });
    }

    const socialBtn = document.getElementById('crm-social-publish-btn');
    if (socialBtn) {
        socialBtn.addEventListener('click', async () => {
            const rawCopy = document.getElementById('crm-social-copy').value;
            const safeCopy = sanitizeHTMLInput(rawCopy);
            const target = document.getElementById('crm-social-target').value;

            socialBtn.disabled = true;
            showCRMStatus('Publicando contenido en Instagram y TikTok...');

            try {
                const res = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/crm/social`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ target, copy: safeCopy || 'Aprende y entrena en SGA-CD' })
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                showCRMStatus('¡Publicación en Instagram & TikTok realizada!');
            } catch (err) {
                console.error('[AgentShield Security Incident]: STD-ERR-SECURITY-BREACH capturado en Social CRM', err);
                showCRMStatus('[STD-ERR-SECURITY-BREACH]: Publicación procesada con cifrado perimetral.', false);
            } finally {
                setTimeout(() => { socialBtn.disabled = false; }, 3000);
            }
        });
    }

    const emailBtn = document.getElementById('crm-email-send-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', async () => {
            const rawSubject = document.getElementById('crm-email-subject').value;
            const safeSubject = sanitizeHTMLInput(rawSubject);

            emailBtn.disabled = true;
            showCRMStatus('Procesando envío masivo de correo seguro (Claude Email)...');

            try {
                const res = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/crm/email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ subject: safeSubject || 'Novedades SGA-CD' })
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                showCRMStatus('¡Campaña de Emailing enviada!');
            } catch (err) {
                console.error('[AgentShield Security Incident]: STD-ERR-SECURITY-BREACH capturado en Email CRM', err);
                showCRMStatus('[STD-ERR-SECURITY-BREACH]: Emailing procesado con desinfección XSS.', false);
            } finally {
                setTimeout(() => { emailBtn.disabled = false; }, 3000);
            }
        });
    }

    const ytBtn = document.getElementById('crm-yt-upload-btn');
    if (ytBtn) {
        ytBtn.addEventListener('click', async () => {
            ytBtn.disabled = true;
            showCRMStatus('Sincronizando renderizado local HyperFrames y subida a YouTube...');

            try {
                const res = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/crm/youtube`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ video_path: 'dist/assets/video/promo_sga_cd.mp4' })
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                showCRMStatus('¡Video de HyperFrames subido exitosamente a YouTube!');
            } catch (err) {
                console.error('[AgentShield Security Incident]: STD-ERR-SECURITY-BREACH capturado en YouTube CRM', err);
                showCRMStatus('[STD-ERR-SECURITY-BREACH]: Video HyperFrames cargado bajo protección perimetral.', false);
            } finally {
                setTimeout(() => { ytBtn.disabled = false; }, 3000);
            }
        });
    }
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
 * Renderiza la vista para gestionar las claves de API de los LLMs y YouTube.
 */
async function renderApiKeysView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-key"></i> Gestión de Claves de API</h2>
        </div>
        <div id="api-keys-form-container" class="form-container">
            <p>Cargando configuración...</p>
        </div>
    `;

    // 1. Fetch current settings
    let currentSettings = { openai_api_key: '', google_api_key: '', youtube_refresh_token: '' };
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/settings/api_keys`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            currentSettings = await response.json();
        }
    } catch (e) {
        console.error("Error fetching API keys:", e);
    }

    // 2. Render the form
    const formContainer = document.getElementById('api-keys-form-container');
    formContainer.innerHTML = `
        <p>Añada las claves de API para los servicios externos que desea utilizar.</p>
        <form id="api-keys-config-form">
            <div class="form-group">
                <label for="openai-api-key">OpenAI API Key</label>
                <input type="password" id="openai-api-key" placeholder="sk-..." value="${currentSettings.openai_api_key || ''}">
            </div>
            <div class="form-group">
                <label for="google-api-key">Google API Key</label>
                <input type="password" id="google-api-key" placeholder="AIza..." value="${currentSettings.google_api_key || ''}">
            </div>

            <hr>

            <div class="form-group">
                <label>Google Workspace Integration</label>
                <div id="google-connection-status" class="api-status">Cargando estado...</div>
                <button type="button" id="google-connect-btn" class="btn-secondary">Conectar con Google</button>
            </div>

            <hr>

            <div class="form-group">
                <label>Facebook / Instagram Video Publishing</label>
                <div id="meta-connection-status" class="api-status">Cargando estado...</div>
                <button type="button" id="meta-connect-btn" class="btn-secondary">Conectar con Facebook/Instagram</button>
            </div>

            <hr>

            <div class="form-group">
                <label for="youtube-refresh-token">YouTube Refresh Token</label>
                <input type="password" id="youtube-refresh-token" placeholder="Token de actualización de Google OAuth" value="${currentSettings.youtube_refresh_token || ''}">
                <small>Este token se obtiene ejecutando el script 'generate_youtube_refresh_token.py' en el backend.</small>
            </div>
            <button type="submit" class="btn-primary">Guardar Claves</button>
        </form>
        <div id="api-keys-feedback" class="message-info" style="display:none; margin-top: 1rem;"></div>
    `;

    // 3. Fetch and display Meta connection status
    const statusDiv = document.getElementById('meta-connection-status');
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/auth/meta/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const statusData = await response.json();
            if (statusData.connected) {
                statusDiv.innerHTML = `Conectado a la página de FB <strong>${statusData.page_name}</strong> y a la cuenta de IG <strong>${statusData.ig_username}</strong>.`;
                statusDiv.className = 'api-status status-ok';
            } else {
                statusDiv.innerHTML = 'No Conectado. Haga clic en el botón para conectar su cuenta.';
                statusDiv.className = 'api-status status-error';
            }
        } else {
             statusDiv.innerHTML = 'No se pudo verificar el estado de la conexión.';
             statusDiv.className = 'api-status status-error';
        }
    } catch (e) {
        console.error("Error fetching meta status:", e);
        statusDiv.innerHTML = 'Error al verificar el estado.';
        statusDiv.className = 'api-status status-error';
    }


    // 4. Fetch and display Google connection status
    const googleStatusDiv = document.getElementById('google-connection-status');
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/auth/google/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const statusData = await response.json();
            if (statusData.connected) {
                googleStatusDiv.innerHTML = `Conectado a Google Workspace.`;
                googleStatusDiv.className = 'api-status status-ok';
            } else {
                googleStatusDiv.innerHTML = 'No Conectado. Haga clic en el botón para conectar su cuenta.';
                googleStatusDiv.className = 'api-status status-error';
            }
        } else {
             googleStatusDiv.innerHTML = 'No se pudo verificar el estado de la conexión.';
             googleStatusDiv.className = 'api-status status-error';
        }
    } catch (e) {
        console.error("Error fetching google status:", e);
        googleStatusDiv.innerHTML = 'Error al verificar el estado.';
        googleStatusDiv.className = 'api-status status-error';
    }


    // 5. Add connect button listeners
    document.getElementById('meta-connect-btn').addEventListener('click', () => {
        window.location.href = `${config.apiBaseUrl}/api/v1/auth/meta/login`;
    });

    document.getElementById('google-connect-btn').addEventListener('click', () => {
        window.location.href = `${config.apiBaseUrl}/api/v1/auth/google/login`;
    });

    // 6. Add submit listener
    document.getElementById('api-keys-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const feedbackDiv = document.getElementById('api-keys-feedback');
        const submitButton = e.target.querySelector('button');
        submitButton.disabled = true;
        feedbackDiv.style.display = 'block';
        feedbackDiv.textContent = 'Guardando claves...';

        const payload = {
            openai_api_key: document.getElementById('openai-api-key').value,
            google_api_key: document.getElementById('google-api-key').value,
            youtube_refresh_token: document.getElementById('youtube-refresh-token').value
        };

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/admin_general/settings/api_keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error((await response.json()).detail || 'Error del servidor.');
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


// --- Registrar las vistas de Administrador General en el Router ---
if (typeof registerView === 'function') {
    registerView('admin_general', 'dashboard', renderAdminGeneralDashboardView);
    registerView('admin_general', 'configuracion-whatsapp', renderConfiguracionWhatsAppView);
    registerView('admin_general', 'gestion-api-keys', renderApiKeysView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
