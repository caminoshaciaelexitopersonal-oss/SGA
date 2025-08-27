// js/views/coordinador.js

// --- Funciones para la Vista del Coordinador ---

/**
 * Renderiza la vista principal para el rol de Coordinador.
 * El contenido cambiará según la `viewName` solicitada desde el menú.
 */
async function renderCoordinadorView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    let contentHtml = '';

    // Podríamos añadir llamadas a la API aquí para obtener datos comunes si fuera necesario

    switch (viewName) {
        case 'planificacion':
            {
                contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-calendar-day"></i> Planificación de Actividades</h2></div><p>Cargando programación...</p>`;
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/coordinador/programacion`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('No se pudo obtener la programación.');
                    const programacion = await response.json();

                    const rows = programacion.map(item => `
                        <tr>
                            <td>${item.profesor}</td>
                            <td>${item.materia}</td>
                            <td>${item.dias}</td>
                            <td>${item.horas}</td>
                            <td><span class="status-${item.estado.toLowerCase()}">${item.estado}</span></td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No hay actividades programadas.</td></tr>';

                    contentHtml = `
                        <div class="view-header"><h2><i class="fas fa-calendar-day"></i> Planificación de Actividades</h2></div>
                        <table class="data-table">
                            <thead><tr><th>Profesor</th><th>Materia</th><th>Días</th><th>Horario</th><th>Estado</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                } catch (error) {
                    contentHtml = `<p class="message-error">Error al cargar la planificación: ${error.message}</p>`;
                }
            }
            break;
        case 'verificar-programacion':
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-clipboard-check"></i> Verificar Programación</h2>
                </div>
                <p>Aquí el coordinador podrá ver y verificar la programación de los profesores para asegurar el cumplimiento.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'aprobaciones':
            {
                contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-check-double"></i> Panel de Aprobaciones</h2></div><p>Cargando items pendientes...</p>`;
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/coordinador/aprobaciones`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('No se pudo obtener la lista de aprobaciones.');
                    const aprobaciones = await response.json();

                    const rows = aprobaciones.map(item => `
                        <tr>
                            <td>${item.tipo}</td>
                            <td>${item.descripcion}</td>
                            <td>${item.solicitado_por}</td>
                            <td>
                                <button class="btn-primary btn-aprobar" data-id="${item.id}">Aprobar</button>
                                <button class="btn-danger btn-rechazar" data-id="${item.id}">Rechazar</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="4">No hay items pendientes de aprobación.</td></tr>';

                    contentHtml = `
                        <div class="view-header"><h2><i class="fas fa-check-double"></i> Panel de Aprobaciones</h2></div>
                        <table class="data-table">
                            <thead><tr><th>Tipo</th><th>Descripción</th><th>Solicitado Por</th><th>Acciones</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                } catch (error) {
                    contentHtml = `<p class="message-error">Error al cargar las aprobaciones: ${error.message}</p>`;
                }
            }
            break;
        case 'enviar-reportes':
             contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-paper-plane"></i> Enviar Reportes</h2>
                </div>
                <p>Desde aquí, el coordinador podrá generar y enviar reportes de área.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        default:
            contentHtml = `<h2>Panel del Coordinador</h2><p>Seleccione una opción del menú para comenzar.</p>`;
    }

    contentArea.innerHTML = contentHtml;
}
