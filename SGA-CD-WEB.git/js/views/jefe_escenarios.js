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
            <p>Aquí se gestionará la asignación de espacios a eventos y profesores.</p>
            <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>`;
    } else if (viewName === 'mantenimiento') {
        contentArea.innerHTML = `
            <div class="view-header"><h2><i class="fas fa-tools"></i> Mantenimiento de Escenarios</h2></div>
            <p>Aquí se registrará y dará seguimiento al mantenimiento de los escenarios.</p>
            <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>`;
    } else {
         contentArea.innerHTML = '<h2>Panel de Jefe de Escenarios</h2><p>Seleccione una opción del menú.</p>';
    }
}
