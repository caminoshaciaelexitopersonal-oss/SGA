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
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-calendar-day"></i> Planificación de Actividades</h2>
                </div>
                <p>Aquí se mostrarán las herramientas para la planificación de actividades y horarios de profesores.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
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
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-check-double"></i> Panel de Aprobaciones</h2>
                </div>
                <p>Panel para aprobar reglas de gamificación, disciplinas y eventos propuestos por otras áreas.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
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
