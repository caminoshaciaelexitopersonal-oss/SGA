// js/views/tecnico_area.js

// --- Vistas para el Rol de Técnico o Asistente de Área ---

/**
 * Renderiza el dashboard principal para el Técnico de Área.
 */
async function renderTecnicoAreaDashboardView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-user-cog"></i> Panel del Técnico de Área</h2>
        </div>
        <p>Seleccione una opción del menú para ver las actividades y recursos del área.</p>
    `;
}

/**
 * Renderiza la vista para Ver Actividades.
 * (Placeholder)
 */
async function renderVerActividadesView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-eye"></i> Ver Actividades</h2>
        </div>
        <p>Panel para consultar la programación de actividades y eventos del área.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

/**
 * Renderiza la vista para Gestionar Eventos (con permisos limitados).
 * (Placeholder)
 */
async function renderTecnicoGestionarEventosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-calendar-check"></i> Gestionar Eventos</h2>
        </div>
        <p>Aquí podrá apoyar en la gestión de eventos, con permisos limitados.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

/**
 * Renderiza la vista para Ver Disciplinas.
 * (Placeholder)
 */
async function renderVerDisciplinasView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-search"></i> Ver Disciplinas</h2>
        </div>
        <p>Aquí podrá consultar las disciplinas del área.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

// --- Registrar las vistas de Técnico de Área en el Router ---
if (typeof registerView === 'function') {
    registerView('tecnico_area', 'dashboard', renderTecnicoAreaDashboardView);
    registerView('tecnico_area', 'ver-actividades', renderVerActividadesView);
    registerView('tecnico_area', 'gestionar-eventos', renderTecnicoGestionarEventosView);
    registerView('tecnico_area', 'ver-disciplinas', renderVerDisciplinasView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
