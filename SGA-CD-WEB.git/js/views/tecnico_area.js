// js/views/tecnico_area.js

async function renderTecnicoAreaView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    let contentHtml = '';

    switch (viewName) {
        case 'ver-actividades':
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-eye"></i> Ver Actividades</h2>
                </div>
                <p>Panel para consultar la programación de actividades y eventos del área.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'gestionar-eventos': // Permisos limitados
             contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-calendar-check"></i> Gestionar Eventos</h2>
                </div>
                <p>Aquí podrá apoyar en la gestión de eventos, con permisos limitados.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'ver-disciplinas':
             contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-search"></i> Ver Disciplinas</h2>
                </div>
                <p>Aquí podrá consultar las disciplinas del área.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        default:
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-user-cog"></i> Panel del Técnico de Área</h2>
                </div>
                <p>Seleccione una opción del menú para ver las actividades y recursos del área.</p>
            `;
            break;
    }

    contentArea.innerHTML = contentHtml;
}
