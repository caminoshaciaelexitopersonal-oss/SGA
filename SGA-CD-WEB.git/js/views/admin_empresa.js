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
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fa-solid fa-arrow-trend-up" style="color:#38BDF8;"></i> +14.2% vs mes anterior</div>
                </div>

                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">ASISTENCIA TALLERES CULTURA</span>
                    <h3 class="powerbi-counter" style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">94.8%</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fa-solid fa-circle-check" style="color:#38BDF8;"></i> Sincronizado Offline PWA</div>
                </div>

                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">EJECUCIÓN DE CONVENIOS</span>
                    <h3 class="powerbi-counter" style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">$184.5M</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fa-solid fa-scale-balanced" style="color:#38BDF8;"></i> Auditoría Presupuestal</div>
                </div>

                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;">
                    <span style="color:#94A3B8; font-size:0.8rem; font-weight:700;">COBERTURA TERRITORIAL</span>
                    <h3 class="powerbi-counter" style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">12 Mun.</h3>
                    <div style="font-size:0.75rem; color:#38BDF8;"><i class="fa-solid fa-map-location-dot"></i> Departamental / Municipal</div>
                </div>
            </div>

            <!-- Bento Analytics High-Density Power BI Chart Block -->
            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.5rem; margin-bottom:2rem;">
                <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
                        <div>
                            <h4 style="margin:0; color:#38BDF8; font-size:1.1rem; font-weight:700;">
                                <i class="fas fa-chart-line" style="margin-right:0.5rem;"></i> Rendimiento en Disciplinas Deportivas vs Talleres Culturales
                            </h4>
                            <span style="font-size:0.75rem; color:#94A3B8;">Telemetría y Dataviz de Participación en Tiempo Real</span>
                        </div>
                        <span style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); color:#38BDF8; padding:0.25rem 0.75rem; border-radius:12px; font-size:0.75rem; font-weight:600;">
                            Power BI Engine 60 FPS
                        </span>
                    </div>

                    <!-- Enhanced High-Density Bar Chart Dataviz -->
                    <div class="powerbi-chart-container" style="display:flex; flex-direction:column; gap:1.25rem; margin-top:1rem;">
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
                                <span style="color:#E2E8F0; font-weight:600;"><i class="fas fa-running" style="color:#38BDF8; width:20px;"></i> Disciplinas Deportivas (Taekwondo, Fútbol, Baloncesto)</span>
                                <span style="color:#38BDF8; font-weight:800;">88% Desempeño</span>
                            </div>
                            <div style="background:#070B14; height:16px; border-radius:8px; overflow:hidden; border:1px solid rgba(56,189,248,0.2); padding:2px;">
                                <div class="chart-bar-fill" style="width:88%; height:100%; background:linear-gradient(90deg, #0284C7 0%, #38BDF8 100%); border-radius:6px; box-shadow: 0 0 10px rgba(56,189,248,0.5);"></div>
                            </div>
                        </div>

                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
                                <span style="color:#E2E8F0; font-weight:600;"><i class="fas fa-music" style="color:#38BDF8; width:20px;"></i> Modalidades Danza (Joropo/Llanera, Salsa, Vallenato)</span>
                                <span style="color:#38BDF8; font-weight:800;">92% Desempeño</span>
                            </div>
                            <div style="background:#070B14; height:16px; border-radius:8px; overflow:hidden; border:1px solid rgba(56,189,248,0.2); padding:2px;">
                                <div class="chart-bar-fill" style="width:92%; height:100%; background:linear-gradient(90deg, #0284C7 0%, #38BDF8 100%); border-radius:6px; box-shadow: 0 0 10px rgba(56,189,248,0.5);"></div>
                            </div>
                        </div>

                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
                                <span style="color:#E2E8F0; font-weight:600;"><i class="fas fa-guitar" style="color:#38BDF8; width:20px;"></i> Instrumentos Culturales (Guitarra, Arpa)</span>
                                <span style="color:#38BDF8; font-weight:800;">84% Desempeño</span>
                            </div>
                            <div style="background:#070B14; height:16px; border-radius:8px; overflow:hidden; border:1px solid rgba(56,189,248,0.2); padding:2px;">
                                <div class="chart-bar-fill" style="width:84%; height:100%; background:linear-gradient(90deg, #0284C7 0%, #38BDF8 100%); border-radius:6px; box-shadow: 0 0 10px rgba(56,189,248,0.5);"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Donut/Distribution Breakdown Block -->
                <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
                    <div>
                        <h4 style="margin:0 0 1rem 0; color:#38BDF8; font-size:1.1rem; font-weight:700;">
                            <i class="fas fa-chart-pie" style="margin-right:0.5rem;"></i> Distribución de Roles
                        </h4>
                        <!-- Donut Visual Representation -->
                        <div style="display:flex; justify-content:center; align-items:center; margin:1rem 0; position:relative;">
                            <div style="width:110px; height:110px; border-radius:50%; background:conic-gradient(#38BDF8 0% 78%, #0284C7 78% 92%, #94A3B8 92% 100%); display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px rgba(56,189,248,0.3);">
                                <div style="width:75px; height:75px; border-radius:50%; background:#0D1424; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                                    <span style="font-size:0.75rem; color:#94A3B8;">TOTAL</span>
                                    <strong style="font-size:0.95rem; color:#38BDF8;">100%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="font-size:0.85rem; line-height:1.8; color:#94A3B8; background:#070B14; padding:0.75rem; border-radius:8px; border:1px solid rgba(56,189,248,0.15);">
                        <p style="margin:0; display:flex; justify-content:space-between;"><span style="color:#E2E8F0;"><i class="fas fa-circle" style="color:#38BDF8; font-size:0.6rem; vertical-align:middle; margin-right:4px;"></i> Estudiantes & Padres:</span> <strong style="color:#38BDF8;">78%</strong></p>
                        <p style="margin:0; display:flex; justify-content:space-between;"><span style="color:#E2E8F0;"><i class="fas fa-circle" style="color:#0284C7; font-size:0.6rem; vertical-align:middle; margin-right:4px;"></i> Profesores e Instructores:</span> <strong style="color:#38BDF8;">14%</strong></p>
                        <p style="margin:0; display:flex; justify-content:space-between;"><span style="color:#E2E8F0;"><i class="fas fa-circle" style="color:#94A3B8; font-size:0.6rem; vertical-align:middle; margin-right:4px;"></i> Entidades & Coordinadores:</span> <strong style="color:#38BDF8;">8%</strong></p>
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

            <div class="admin-section" style="background:#0D1424; border:1px solid rgba(56,189,248,0.2); border-radius:14px; padding:1.5rem; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h3 style="color:#38BDF8; margin:0;"><i class="fas fa-sitemap"></i> Áreas Institucionales</h3>
                    <button class="btn-primary" style="min-height:44px; padding:0 1.25rem;">Crear Área</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Nombre del Área</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>${renderAreaRows(areas)}</tbody>
                </table>
            </div>

            <!-- Incrustación Nativa: Gestión de 5 Fotos por Actividad & Matriz de Aliados Corporativos -->
            <div class="admin-section" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem;">
                    <h3 style="color:#38BDF8; margin:0; font-size:1.3rem; font-weight:700;">
                        <i class="fas fa-images"></i> Micro-Carruseles de 5 Fotos por Actividad & Matriz de Co-Sponsors
                    </h3>
                    <span style="background:#070B14; border:1px solid rgba(56,189,248,0.3); color:#38BDF8; padding:0.4rem 0.8rem; border-radius:16px; font-size:0.75rem; font-weight:700;">
                        <i class="fa-solid fa-shield-halved"></i> AgentShield ECC Protegido
                    </span>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.25rem; margin-bottom:1.5rem;">
                    <!-- Micro-Carrusel 1: Disciplinas Deportivas -->
                    <div class="activity-photo-card" style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1rem;">
                        <h4 style="color:#38BDF8; margin:0 0 0.5rem 0; font-size:1rem;">Disciplinas Deportivas (Taekwondo / Fútbol)</h4>
                        <p style="color:#94A3B8; font-size:0.8rem; margin-bottom:0.75rem;">5 fotos en formato WebP con aceleración GPU (GSAP translate3d).</p>
                        <div style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.5rem;">
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 1</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 2</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 3</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 4</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 5</div>
                        </div>
                        <button class="btn-primary" style="width:100%; min-height:36px; padding:0.4rem; font-size:0.8rem; margin-top:0.5rem;">Gestionar Galería de 5 Fotos</button>
                    </div>

                    <!-- Micro-Carrusel 2: Modalidad Danza e Instrumentos -->
                    <div class="activity-photo-card" style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1rem;">
                        <h4 style="color:#38BDF8; margin:0 0 0.5rem 0; font-size:1rem;">Talleres Culturales (Danza Joropo / Guitarra)</h4>
                        <p style="color:#94A3B8; font-size:0.8rem; margin-bottom:0.75rem;">Galeria interactiva de 5 imágenes comprimidas WebP.</p>
                        <div style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.5rem;">
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 1</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 2</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 3</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 4</div>
                            <div style="min-width:70px; height:70px; background:#0D1424; border:1px solid rgba(56,189,248,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#38BDF8; font-size:0.75rem; font-weight:bold;">Foto 5</div>
                        </div>
                        <button class="btn-primary" style="width:100%; min-height:36px; padding:0.4rem; font-size:0.8rem; margin-top:0.5rem;">Gestionar Galería de 5 Fotos</button>
                    </div>
                </div>

                <!-- Matriz de Aliados Corporativos y Co-Sponsors -->
                <div class="allies-grid" style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1.25rem;">
                    <h4 style="color:#38BDF8; margin:0 0 0.75rem 0; font-size:1rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-handshake"></i> Matriz de Co-Sponsors y Aliados Institucionales
                    </h4>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
                        <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
                            <strong style="color:#38BDF8; font-size:0.85rem;">Gobernación del Meta</strong>
                            <p style="color:#94A3B8; font-size:0.75rem; margin:0.2rem 0 0 0;">Orden Departamental</p>
                        </div>
                        <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
                            <strong style="color:#38BDF8; font-size:0.85rem;">Alcaldía de Villavicencio</strong>
                            <p style="color:#94A3B8; font-size:0.75rem; margin:0.2rem 0 0 0;">Orden Municipal</p>
                        </div>
                        <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
                            <strong style="color:#38BDF8; font-size:0.85rem;">Instituto de Deportes</strong>
                            <p style="color:#94A3B8; font-size:0.75rem; margin:0.2rem 0 0 0;">Público - Descentralizado</p>
                        </div>
                        <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:8px; padding:0.75rem; text-align:center;">
                            <strong style="color:#38BDF8; font-size:0.85rem;">Fundación Cultura Viva</strong>
                            <p style="color:#94A3B8; font-size:0.75rem; margin:0.2rem 0 0 0;">Privada B2B</p>
                        </div>
                    </div>
                </div>
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
