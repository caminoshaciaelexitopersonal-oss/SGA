// js/views/jefe_escenarios.js

async function renderJefeEscenariosView(viewName, token) {
    const contentArea = document.getElementById('content-area');

    if (viewName === 'calendario-de-escenarios') {
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
            contentArea.innerHTML += `<p class="message-error">Error al cargar los escenarios: ${error.message}</p>`;
        }
    } else if (viewName === 'asignar-espacios') {
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
    } else if (viewName === 'mantenimiento') {
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
            contentArea.innerHTML += `<p class="message-error">Error al cargar el historial: ${error.message}</p>`;
        }
    } else {
         contentArea.innerHTML = '<h2>Panel de Jefe de Escenarios</h2><p>Seleccione una opción del menú.</p>';
    }
}
