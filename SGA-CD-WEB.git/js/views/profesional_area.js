// js/views/profesional_area.js

// --- Vistas para el Rol de Profesional de Área ---

/**
 * Renderiza el dashboard principal para el Profesional de Área.
 */
async function renderProfesionalAreaDashboardView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h2 style="color: #F8FAFC; margin: 0; font-size: 1.6rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-tie" style="color: #38BDF8;"></i> Panel del Profesional de Área
                </h2>
                <p style="color: #94A3B8; margin-top: 0.25rem; font-size: 0.9rem;">
                    Supervisión técnica de Disciplinas Deportivas y Talleres Culturales (Danza: Joropo/Llanera, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                </p>
            </div>
            <span class="badge-role" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                <i class="fas fa-shield-alt"></i> Nivel Profesional
            </span>
        </div>

        <!-- Matrix KPI Bento Grid -->
        <div class="bento-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="bento-card" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(20px);">
                <div style="font-size: 0.8rem; text-transform: uppercase; tracking: 0.05em; color: #94A3B8; margin-bottom: 0.5rem;">Disciplinas Deportivas</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: #F8FAFC;">18 Activas</div>
                <div style="font-size: 0.8rem; color: #38BDF8; margin-top: 0.25rem;"><i class="fas fa-running"></i> Cobertura Técnica 100%</div>
            </div>
            <div class="bento-card" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(20px);">
                <div style="font-size: 0.8rem; text-transform: uppercase; tracking: 0.05em; color: #94A3B8; margin-bottom: 0.5rem;">Talleres Culturales</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: #F8FAFC;">24 Grupos</div>
                <div style="font-size: 0.8rem; color: #38BDF8; margin-top: 0.25rem;"><i class="fas fa-music"></i> Danza e Instrumentos</div>
            </div>
            <div class="bento-card" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(20px);">
                <div style="font-size: 0.8rem; text-transform: uppercase; tracking: 0.05em; color: #94A3B8; margin-bottom: 0.5rem;">Supervisión de Campo</div>
                <div style="font-size: 1.8rem; font-weight: 700; color: #38BDF8;">96.5%</div>
                <div style="font-size: 0.8rem; color: #94A3B8; margin-top: 0.25rem;"><i class="fas fa-check-double"></i> Verificación Aprobada</div>
            </div>
        </div>

        <div style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.5rem;">
            <h3 style="color: #F8FAFC; margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-tasks" style="color: #38BDF8;"></i> Acciones de Supervisión Rápida
            </h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn-primary" style="background: #38BDF8; color: #070B14; font-weight: 600; padding: 0.6rem 1.2rem; border-radius: 8px; border: none; min-height: 44px; cursor: pointer;" onclick="renderSupervisarActividadesView(sessionStorage.getItem('jwt_token'))">
                    <i class="fas fa-eye"></i> Supervisar Actividades en Curso
                </button>
                <button class="btn-secondary" style="background: rgba(56, 189, 248, 0.1); color: #38BDF8; border: 1px solid #38BDF8; font-weight: 600; padding: 0.6rem 1.2rem; border-radius: 8px; min-height: 44px; cursor: pointer;" onclick="renderGestionarDisciplinasView(sessionStorage.getItem('jwt_token'))">
                    <i class="fas fa-edit"></i> Gestionar Disciplinas y Modalidades
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza la vista para Supervisar Actividades.
 */
async function renderSupervisarActividadesView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2 style="color:#F8FAFC;"><i class="fas fa-tasks" style="color:#38BDF8;"></i> Supervisar Actividades</h2></div><p style="color:#94A3B8;">Cargando actividades en curso...</p>`;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/eventos?estado=en-curso`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de actividades en curso.');
        const actividades = await response.json();

        const rows = actividades.map(item => `
            <tr>
                <td style="color:#F8FAFC; font-weight:500;">${item.nombre}</td>
                <td style="color:#94A3B8;">${item.tipo}</td>
                <td style="color:#94A3B8;">${item.responsable || 'N/A'}</td>
                <td><span style="background:rgba(56,189,248,0.1); border:1px solid #38BDF8; color:#38BDF8; padding:3px 10px; border-radius:12px; font-size:0.8rem; font-weight:600;">${item.estado}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="color:#94A3B8; text-align:center;">No hay actividades en curso para supervisar.</td></tr>';

        contentArea.innerHTML = `
            <div class="view-header" style="margin-bottom:1.5rem;">
                <h2 style="color:#F8FAFC; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-tasks" style="color:#38BDF8;"></i> Supervisar Actividades
                </h2>
                <p style="color:#94A3B8; font-size:0.9rem;">Panel para supervisar las actividades y entrenamientos en curso del área.</p>
            </div>
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.25rem; overflow-x:auto;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(56,189,248,0.15); text-align:left;">
                            <th style="color:#94A3B8; padding:0.75rem;">Actividad/Evento</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Tipo</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Responsable</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar las actividades: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista para Gestionar Eventos.
 */
async function renderGestionarEventosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2 style="color:#F8FAFC;"><i class="fas fa-calendar-plus" style="color:#38BDF8;"></i> Gestionar Eventos</h2></div><p style="color:#94A3B8;">Cargando eventos...</p>`;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/eventos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de eventos.');
        const eventos = await response.json();

        const rows = eventos.map(item => `
            <tr>
                <td style="color:#F8FAFC; font-weight:500;">${item.nombre}</td>
                <td style="color:#94A3B8;">${item.tipo}</td>
                <td style="color:#94A3B8;">${new Date(item.fecha).toLocaleDateString()}</td>
                <td><span style="background:rgba(56,189,248,0.1); border:1px solid #38BDF8; color:#38BDF8; padding:3px 10px; border-radius:12px; font-size:0.8rem; font-weight:600;">${item.estado}</span></td>
                <td>
                    <button class="btn-secondary btn-editar" data-id="${item.id}" style="background:rgba(56,189,248,0.1); color:#38BDF8; border:1px solid #38BDF8; padding:0.4rem 0.8rem; border-radius:6px; min-height:44px; cursor:pointer;">Editar</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="color:#94A3B8; text-align:center;">No hay eventos para gestionar.</td></tr>';

        contentArea.innerHTML = `
            <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 style="color:#F8FAFC; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-calendar-plus" style="color:#38BDF8;"></i> Gestionar Eventos
                    </h2>
                    <p style="color:#94A3B8; font-size:0.9rem;">Como Profesional de Área, puede crear y editar eventos institucionales.</p>
                </div>
                <button class="btn-primary" style="background:#38BDF8; color:#070B14; font-weight:600; padding:0.6rem 1.2rem; border-radius:8px; border:none; min-height:44px; cursor:pointer;">Crear Nuevo Evento</button>
            </div>
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.25rem; overflow-x:auto;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(56,189,248,0.15); text-align:left;">
                            <th style="color:#94A3B8; padding:0.75rem;">Nombre</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Tipo</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Fecha</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Estado</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar los eventos: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista para Gestionar Disciplinas Deportivas y Modalidades.
 */
async function renderGestionarDisciplinasView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2 style="color:#F8FAFC;"><i class="fas fa-edit" style="color:#38BDF8;"></i> Gestionar Disciplinas Deportivas y Modalidades</h2></div><p style="color:#94A3B8;">Cargando disciplinas deportivas y modalidades culturales...</p>`;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/disciplinas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de disciplinas deportivas y modalidades.');
        const disciplinas = await response.json();

        const rows = disciplinas.map(item => `
            <tr>
                <td style="color:#F8FAFC; font-weight:500;">${item.nombre}</td>
                <td style="color:#94A3B8;">${item.area}</td>
                <td>
                    <button class="btn-secondary btn-editar" data-id="${item.id}" style="background:rgba(56,189,248,0.1); color:#38BDF8; border:1px solid #38BDF8; padding:0.4rem 0.8rem; border-radius:6px; min-height:44px; cursor:pointer;">Editar</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="3" style="color:#94A3B8; text-align:center;">No hay disciplinas deportivas o modalidades registradas para gestionar.</td></tr>';

        contentArea.innerHTML = `
            <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 style="color:#F8FAFC; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-edit" style="color:#38BDF8;"></i> Gestionar Disciplinas Deportivas y Modalidades
                    </h2>
                    <p style="color:#94A3B8; font-size:0.85rem; margin-top:0.25rem;">
                        Área de Cultura: Talleres / Modalidades (Danza: Joropo/Llanera, Salsa, Vallenato | Instrumentos Culturales: Guitarra, Arpa)<br>
                        Área de Deportes: Disciplinas Deportivas.
                    </p>
                </div>
                <button class="btn-primary" style="background:#38BDF8; color:#070B14; font-weight:600; padding:0.6rem 1.2rem; border-radius:8px; border:none; min-height:44px; cursor:pointer;">Crear Disciplina / Taller</button>
            </div>
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.25rem; overflow-x:auto;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(56,189,248,0.15); text-align:left;">
                            <th style="color:#94A3B8; padding:0.75rem;">Nombre</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Área</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar las disciplinas deportivas y modalidades: ${error.message}</p>`;
    }
}

// --- Registrar las vistas de Profesional de Área en el Router ---
if (typeof registerView === 'function') {
    registerView('profesional_area', 'dashboard', renderProfesionalAreaDashboardView);
    registerView('profesional_area', 'supervisar-actividades', renderSupervisarActividadesView);
    registerView('profesional_area', 'gestionar-eventos', renderGestionarEventosView);
    registerView('profesional_area', 'gestionar-disciplinas', renderGestionarDisciplinasView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
