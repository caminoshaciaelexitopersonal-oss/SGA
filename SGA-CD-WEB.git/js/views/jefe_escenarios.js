// js/views/jefe_escenarios.js

// --- Vistas para el Rol de Jefe de Escenarios ---

/**
 * Renderiza la vista del Calendario y Gestión de Escenarios.
 */
async function renderCalendarioEscenariosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-calendar-alt"></i> Calendario y Gestión de Escenarios</h2></div><p>Cargando escenarios...</p>`;
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/escenarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de escenarios.');

        const escenarios = await response.json();
        let escenarioRows = escenarios.map(e => `
            <tr>
                <td>${e.id}</td>
                <td>${e.nombre}</td>
                <td>${e.tipo}</td>
                <td>${e.capacidad || 'N/A'}</td>
                <td><span class="status-${e.estado.toLowerCase()}">${e.estado}</span></td>
                <td><button class="btn-secondary">Ver Horario</button> <button class="btn-secondary">Editar</button></td>
            </tr>
        `).join('') || '<tr><td colspan="6">No se encontraron escenarios.</td></tr>';

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-calendar-alt"></i> Calendario y Gestión de Escenarios</h2>
                <button class="btn-primary">Añadir Nuevo Escenario</button>
            </div>
            <table class="data-table">
                <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>${escenarioRows}</tbody>
            </table>`;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error">Error al cargar los escenarios: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista para Asignar Espacios.
 */
async function renderAsignarEspaciosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-map-marker-alt"></i> Asignar Espacios</h2></div>
        <form id="asignar-form" class="form-container">
            <input type="number" id="asignar-escenario-id" placeholder="ID del Escenario" required>
            <input type="text" id="asignar-evento-nombre" placeholder="Nombre del Evento/Clase" required>
            <input type="date" id="asignar-fecha" required>
            <input type="time" id="asignar-hora-inicio" required>
            <input type="time" id="asignar-hora-fin" required>
            <button type="submit" class="btn-primary">Asignar Espacio</button>
        </form>
        <div id="asignar-feedback" class="message-info" style="display:none;"></div>
    `;
}

/**
 * Renderiza la vista para Mantenimiento de Escenarios.
 */
async function renderMantenimientoEscenariosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-tools"></i> Mantenimiento de Escenarios</h2></div><p>Cargando historial...</p>`;
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/escenarios/mantenimiento`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener el historial de mantenimiento.');
        const mantenimientos = await response.json();

        const rows = mantenimientos.map(item => `
            <tr>
                <td>${item.escenario_nombre}</td>
                <td>${new Date(item.fecha).toLocaleDateString()}</td>
                <td>${item.descripcion}</td>
                <td><span class="status-${item.estado.toLowerCase()}">${item.estado}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="4">No hay registros de mantenimiento.</td></tr>';

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-tools"></i> Mantenimiento de Escenarios</h2>
                <button class="btn-primary">Registrar Nuevo Mantenimiento</button>
            </div>
            <table class="data-table">
                <thead><tr><th>Escenario</th><th>Fecha</th><th>Descripción</th><th>Estado</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error">Error al cargar el historial: ${error.message}</p>`;
    }
}

// --- Registrar las vistas de Jefe de Escenarios en el Router ---
if (typeof registerView === 'function') {
    registerView('jefe_escenarios', 'calendario-de-escenarios', renderCalendarioEscenariosView);
    registerView('jefe_escenarios', 'asignar-espacios', renderAsignarEspaciosView);
    registerView('jefe_escenarios', 'mantenimiento', renderMantenimientoEscenariosView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
