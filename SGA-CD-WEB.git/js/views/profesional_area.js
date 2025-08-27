// js/views/profesional_area.js

async function renderProfesionalAreaView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    let contentHtml = '';

    switch (viewName) {
        case 'supervisar-actividades':
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-tasks"></i> Supervisar Actividades</h2>
                </div>
                <p>Panel para supervisar las actividades en curso del área.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'gestionar-eventos':
            {
                contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-calendar-plus"></i> Gestionar Eventos</h2></div><p>Cargando eventos...</p>`;
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/eventos`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('No se pudo obtener la lista de eventos.');
                    const eventos = await response.json();

                    const rows = eventos.map(item => `
                        <tr>
                            <td>${item.nombre}</td>
                            <td>${item.tipo}</td>
                            <td>${new Date(item.fecha).toLocaleDateString()}</td>
                            <td><span class="status-${item.estado.toLowerCase()}">${item.estado}</span></td>
                            <td>
                                <button class="btn-secondary btn-editar" data-id="${item.id}">Editar</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No hay eventos para gestionar.</td></tr>';

                    contentHtml = `
                        <div class="view-header">
                            <h2><i class="fas fa-calendar-plus"></i> Gestionar Eventos</h2>
                            <button class="btn-primary">Crear Nuevo Evento</button>
                        </div>
                        <p>Como Profesional de Área, puede crear y editar eventos. La eliminación requiere aprobación de un Jefe de Área.</p>
                        <table class="data-table">
                            <thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                } catch (error) {
                    contentHtml = `<p class="message-error">Error al cargar los eventos: ${error.message}</p>`;
                }
            }
            break;
        case 'gestionar-disciplinas':
            {
                contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-edit"></i> Gestionar Disciplinas</h2></div><p>Cargando disciplinas...</p>`;
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/disciplinas`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('No se pudo obtener la lista de disciplinas.');
                    const disciplinas = await response.json();

                    const rows = disciplinas.map(item => `
                        <tr>
                            <td>${item.nombre}</td>
                            <td>${item.area}</td>
                            <td>
                                <button class="btn-secondary btn-editar" data-id="${item.id}">Editar</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="3">No hay disciplinas para gestionar.</td></tr>';

                    contentHtml = `
                        <div class="view-header">
                            <h2><i class="fas fa-edit"></i> Gestionar Disciplinas</h2>
                            <button class="btn-primary">Crear Nueva Disciplina</button>
                        </div>
                        <table class="data-table">
                            <thead><tr><th>Nombre</th><th>Área</th><th>Acciones</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                } catch (error) {
                    contentHtml = `<p class="message-error">Error al cargar las disciplinas: ${error.message}</p>`;
                }
            }
            break;
        default:
            contentHtml = `
                <div class="view-header">
                    <h2><i class="fas fa-user-tie"></i> Panel del Profesional de Área</h2>
                </div>
                <p>Seleccione una opción del menú para comenzar a gestionar las actividades y recursos del área.</p>
            `;
            break;
    }

    contentArea.innerHTML = contentHtml;
}
