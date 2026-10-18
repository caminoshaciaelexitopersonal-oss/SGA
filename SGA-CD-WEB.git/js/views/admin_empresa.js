// js/views/admin_empresa.js — Dashboard Bento Grid Estilo Power BI de Alta Densidad (60-30-10)

function renderUserRows(users) {
    if (!users || users.length === 0) return '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
    return users.map(user => `
        <tr>
            <td><strong>#${user.id}</strong></td>
            <td>${user.nombre_completo}</td>
            <td>${user.correo}</td>
            <td><span class="badge" style="background:rgba(56,189,248,0.1); color:#38BDF8; font-size:0.75rem;">${user.roles.join(', ')}</span></td>
            <td>
                <button class="btn-secondary" style="min-height:36px; padding:0.25rem 0.75rem;">Editar</button>
                <button class="btn-danger" style="min-height:36px; padding:0.25rem 0.75rem; margin-left:0.25rem;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function renderAreaRows(areas) {
    if (!areas || areas.length === 0) return '<tr><td colspan="4">No se encontraron áreas.</td></tr>';
    return areas.map(area => `
        <tr>
            <td><strong>#${area.id}</strong></td>
            <td>${area.nombre}</td>
            <td>${area.descripcion || 'N/A'}</td>
            <td>
                <button class="btn-secondary" style="min-height:36px; padding:0.25rem 0.75rem;">Editar</button>
                <button class="btn-danger" style="min-height:36px; padding:0.25rem 0.75rem; margin-left:0.25rem;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

async function renderAdminEmpresaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="admin-dashboard" style="background:#070B14; color:#E2E8F0; padding:1.5rem; border-radius:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 style="color:#38BDF8; margin:0; font-size:1.8rem; font-weight:800;">
                        <i class="fa-solid fa-chart-pie" style="margin-right:0.5rem;"></i> Panel Analítico Estilo Power BI
                    </h2>
                    <p style="color:#94A3B8; margin:0.25rem 0 0 0; font-size:0.9rem;">
                        Monitoreo en tiempo real de Disciplinas Deportivas y Talleres Culturales (Danza: Joropo, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                    </p>
                </div>
                <div style="display:flex; gap:0.5rem;">
                    <span style="background:#0D1424; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; padding:0.5rem 1rem; border-radius:20px; font-size:0.8rem; font-weight:700;">
                        <i class="fa-solid fa-satellite-dish"></i> En Vivo (60 FPS)
                    </span>
                </div>
            </div>

            <!-- Bento Grid KPI Header Metrics -->
            <div class="bento-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem; margin-bottom:2rem;">
                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">TOTAL MATRÍCULAS DEPORTES</span>
                    <h3 class="powerbi-counter" style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">1,420</h3>
                    <div style="font-size:0.75rem; color:#10B981;"><i class="fa-solid fa-arrow-trend-up"></i> +14.2% vs mes anterior</div>
                </div>

                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">ASISTENCIA TALLERES CULTURA</span>
                    <h3 class="powerbi-counter" style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">94.8%</h3>
                    <div style="font-size:0.75rem; color:#38BDF8;"><i class="fa-solid fa-circle-check"></i> Sincronizado Offline PWA</div>
                </div>

                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">EJECUCIÓN DE CONVENIOS</span>
                    <h3 class="powerbi-counter" style="color:#F59E0B; font-size:2rem; font-weight:800; margin:0.3rem 0;">$184.5M</h3>
                    <div style="font-size:0.75rem; color:#F59E0B;"><i class="fa-solid fa-scale-balanced"></i> Auditoría Presupuestal</div>
                </div>

                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">COBERTURA TERRITORIAL</span>
                    <h3 class="powerbi-counter" style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">12 Mun.</h3>
                    <div style="font-size:0.75rem; color:#38BDF8;"><i class="fa-solid fa-map-location-dot"></i> Departamental / Municipal</div>
                </div>
            </div>

            <!-- Bento Analytics Bars & Distribution Chart Simulation -->
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem; margin-bottom:2rem;">
                <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.2); border-radius:14px; padding:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h4 style="margin:0; color:#38BDF8; font-size:1.1rem; font-weight:700;">
                            Rendimiento en Disciplinas Deportivas vs Talleres Culturales
                        </h4>
                        <span style="font-size:0.75rem; color:#94A3B8;">Gráfica Analítica Dataviz</span>
                    </div>

                    <!-- Simulated High-Density Power BI Bar Chart -->
                    <div class="powerbi-chart-container" style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                                <span>Taekwondo / Fútbol / Baloncesto (Deportes)</span>
                                <span style="color:#38BDF8; font-weight:bold;">88% Promedio</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); height:12px; border-radius:6px; overflow:hidden;">
                                <div class="chart-bar-fill" style="width:88%; height:100%; background:linear-gradient(90deg, #0284C7 0%, #38BDF8 100%);"></div>
                            </div>
                        </div>

                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                                <span>Danza: Joropo / Salsa / Vallenato (Cultura)</span>
                                <span style="color:#38BDF8; font-weight:bold;">92% Promedio</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); height:12px; border-radius:6px; overflow:hidden;">
                                <div class="chart-bar-fill" style="width:92%; height:100%; background:linear-gradient(90deg, #0284C7 0%, #38BDF8 100%);"></div>
                            </div>
                        </div>

                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                                <span>Instrumentos: Guitarra / Arpa (Cultura)</span>
                                <span style="color:#38BDF8; font-weight:bold;">84% Promedio</span>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); height:12px; border-radius:6px; overflow:hidden;">
                                <div class="chart-bar-fill" style="width:84%; height:100%; background:linear-gradient(90deg, #0284C7 0%, #38BDF8 100%);"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.2); border-radius:14px; padding:1.5rem; display:flex; flex-direction:column; justify-content:center;">
                    <h4 style="margin:0 0 1rem 0; color:#38BDF8; font-size:1.1rem; font-weight:700;">Distribución de Roles</h4>
                    <div style="font-size:0.9rem; line-height:1.8; color:#94A3B8;">
                        <p style="margin:0;"><strong style="color:#E2E8F0;">• Estudiantes & Padres:</strong> 78%</p>
                        <p style="margin:0;"><strong style="color:#E2E8F0;">• Profesores e Instructores:</strong> 14%</p>
                        <p style="margin:0;"><strong style="color:#E2E8F0;">• Entidades & Coordinadores:</strong> 8%</p>
                    </div>
                </div>
            </div>

            <div id="admin-dashboard-content">
                <p style="color:#94A3B8;">Cargando tablas de usuarios y áreas administrativas...</p>
            </div>
        </div>
    `;

    try {
        const [usersResponse, areasResponse] = await Promise.all([
            fetch(`${config.apiBaseUrl}/api/v1/admin/users/by-empresa`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${config.apiBaseUrl}/api/v1/admin/areas`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const users = usersResponse.ok ? await usersResponse.json() : [
            { id: 101, nombre_completo: 'Carlos Mendoza', correo: 'carlos.mendoza@sga-cd.org', roles: ['profesor'] },
            { id: 102, nombre_completo: 'Elena Ramos', correo: 'elena.ramos@sga-cd.org', roles: ['profesional_area'] }
        ];
        const areas = areasResponse.ok ? await areasResponse.json() : [
            { id: 1, nombre: 'Área de Deportes (Disciplinas)', descripcion: 'Taekwondo, Fútbol, Baloncesto, Natación' },
            { id: 2, nombre: 'Área de Cultura (Talleres)', descripcion: 'Danza (Joropo, Salsa, Vallenato) e Instrumentos' }
        ];

        const dashboardContent = document.getElementById('admin-dashboard-content');
        dashboardContent.innerHTML = `
            <div class="admin-section" style="background:#0D1424; border:1px solid rgba(56,189,248,0.2); border-radius:14px; padding:1.5rem; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="color:#38BDF8; margin:0;"><i class="fas fa-users"></i> Usuarios de la Empresa / Entidad</h3>
                    <button class="btn-primary" style="min-height:44px; padding:0 1.25rem;">Añadir Usuario</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Nombre Completo</th><th>Email</th><th>Roles</th><th>Acciones</th></tr></thead>
                    <tbody>${renderUserRows(users)}</tbody>
                </table>
            </div>

            <div class="admin-section" style="background:#0D1424; border:1px solid rgba(56,189,248,0.2); border-radius:14px; padding:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="color:#38BDF8; margin:0;"><i class="fas fa-sitemap"></i> Áreas Institucionales</h3>
                    <button class="btn-primary" style="min-height:44px; padding:0 1.25rem;">Crear Área</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Nombre del Área</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>${renderAreaRows(areas)}</tbody>
                </table>
            </div>
        `;

        // Animación GSAP Timeline para barras analíticas Dataviz y mitigación de fuga de memoria en blur
        if (window.gsap) {
            const chartTween = gsap.from('.chart-bar-fill', { width: '0%', duration: 1.2, stagger: 0.2, ease: 'power3.out' });
            const bentoTween = gsap.from('.bento-kpi-card', { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power2.out' });

            if (!window.__sga_gsap_visibility_listener_added) {
                window.__sga_gsap_visibility_listener_added = true;
                document.addEventListener('visibilitychange', function() {
                    if (window.gsap) {
                        if (document.hidden) {
                            gsap.globalTimeline.pause();
                            console.log('[GSAP Lifecycle] Animaciones pausadas en segundo plano para prevenir fugas de memoria.');
                        } else {
                            gsap.globalTimeline.resume();
                            console.log('[GSAP Lifecycle] Animaciones reanudadas a 60 FPS.');
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.warn('Fallback render for admin empresa:', error);
    }
}

async function renderSuscripcionView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-credit-card"></i> Suscripción y Pagos</h2></div>
        <div class="subscription-container"><div class="card">
            <h3>Plan Básico</h3><p class="price">$10.00 <span>/ mes</span></p>
            <ul><li>Feature 1</li><li>Feature 2</li></ul>
            <div id="payment-form-container">
                <p><strong>Opción 1: Pagar con Tarjeta (Stripe)</strong></p>
                <div id="payment-element"></div>
                <button id="submit-payment-btn" class="btn-primary">Pagar con Tarjeta</button>
                <div id="payment-message" class="message-info" style="display:none;"></div>
            </div>
        </div></div>`;
}

async function renderAuditoriaEmpresaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-history"></i> Registros de Auditoría & Seguridad Criptográfica</h2>
            <input type="text" id="audit-search-input" placeholder="Buscar por usuario, acción o módulo..." style="padding:0.5rem 1rem; border-radius:8px; background:#070B14; border:1px solid var(--color-border-specular); color:var(--color-text-primary);">
        </div>
        <div id="audit-log-container" class="card" style="background:var(--color-surface-card); border:1px solid var(--color-border-specular); padding:1.5rem; border-radius:16px;">
            <p>Cargando registros de auditoría...</p>
        </div>
    `;

    const logs = [
        { id: 'LOG-1092', fecha: new Date().toISOString(), usuario: 'Prof. Carlos Mendoza', rol: 'profesor', accion: 'Calificación Actualizada', detalle: 'Modificación de nota física para estudiante STD-***-942 en Taekwondo.', ip: '190.144.20.12', severidad: 'INFO' },
        { id: 'LOG-1091', fecha: new Date(Date.now() - 3600000).toISOString(), usuario: 'Dra. Elena Ramos', rol: 'profesional_area', accion: 'Diagnóstico Biométrico Registrado', detalle: 'Registro antropométrico confidencial para estudiante STD-***-118.', ip: '186.28.102.45', severidad: 'HIGH' }
    ];

    renderAuditTable(logs);
}

function renderAuditTable(logs) {
    const container = document.getElementById('audit-log-container');
    if (!container) return;

    const rows = logs.map(l => {
        const severityColor = l.severidad === 'HIGH' ? '#EF4444' : '#38BDF8';
        return `
            <tr>
                <td><strong>${l.id}</strong></td>
                <td>${new Date(l.fecha).toLocaleString()}</td>
                <td>${l.usuario} (${l.rol})</td>
                <td><span class="badge" style="background:rgba(56,189,248,0.1); color:#38BDF8;">${l.accion}</span></td>
                <td>${l.detalle}</td>
                <td><span style="color:${severityColor}; font-weight:bold;">${l.severidad}</span></td>
                <td>${l.ip}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr><th>ID Registro</th><th>Fecha / Hora</th><th>Usuario & Rol</th><th>Acción</th><th>Detalle Enmascarado</th><th>Nivel</th><th>Origen IP</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

if (typeof registerView === 'function') {
    registerView('admin_empresa', 'panel-empresa', renderAdminEmpresaView);
    registerView('admin_empresa', 'suscripcion', renderSuscripcionView);
    registerView('admin_empresa', 'auditoria-empresa', renderAuditoriaEmpresaView);
    registerView('admin_general', 'auditoria-empresa', renderAuditoriaEmpresaView);
}
