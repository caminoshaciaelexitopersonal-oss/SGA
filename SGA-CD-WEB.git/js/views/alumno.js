// js/views/alumno.js

// --- Funciones para la Vista del Alumno ---

/**
 * Renderiza la vista de "Mis Cursos" para el alumno.
 * Llama a la API para obtener los cursos y los muestra en tarjetas.
 */
async function renderMisCursosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2><i class="fas fa-book-reader"></i> Mis Cursos</h2><p>Cargando cursos...</p>';

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de cursos.');
        }

        const cursos = await response.json();

        let cursoCards = '<p>No estás inscrito en ningún curso actualmente.</p>';
        if (cursos && cursos.length > 0) {
            cursoCards = cursos.map(curso => `
                <div class="card">
                    <h3>${curso.nombre}</h3>
                    <p><strong>Profesor:</strong> ${curso.profesor.nombre_completo}</p>
                    <p><strong>Horario:</strong> ${curso.horario || 'No definido'}</p>
                    <a href="#" class="btn-secondary" data-view="ver-curso-detalles" data-curso-id="${curso.id}">Ver detalles y notas</a>
                </div>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-book-reader"></i> Mis Cursos</h2>
                <button id="btn-inscribirse-curso" class="btn-primary">Inscribirse a Nuevo Curso</button>
            </div>
            <div class="card-container">
                ${cursoCards}
            </div>
        `;
        // Nota: El listener para 'btn-inscribirse-curso' ya está en views.js (setupMisCursosListeners)
        // Si no funciona, habrá que moverlo o replicarlo.
    } catch (error) {
        contentArea.innerHTML += `<p class="message-error">Error al cargar los cursos: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista de "Mi Horario" para el alumno.
 */
async function renderMiHorarioView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2><i class="fas fa-clock"></i> Mi Horario</h2><p>Cargando horario...</p>';

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/horario`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener el horario.');
        }

        const horario = await response.json();

        let horarioRows = '<tr><td colspan="5">No tienes un horario asignado.</td></tr>';
        if (horario && horario.length > 0) {
            horarioRows = horario.map(clase => `
                <tr>
                    <td>${clase.dia}</td>
                    <td>${clase.hora_inicio} - ${clase.hora_fin}</td>
                    <td>${clase.materia}</td>
                    <td>${clase.profesor}</td>
                    <td>${clase.escenario}</td>
                </tr>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-clock"></i> Mi Horario</h2>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Día</th>
                        <th>Hora</th>
                        <th>Materia</th>
                        <th>Profesor</th>
                        <th>Escenario</th>
                    </tr>
                </thead>
                <tbody>
                    ${horarioRows}
                </tbody>
            </table>
        `;
    } catch (error) {
        contentArea.innerHTML += `<p class="message-error">Error al cargar el horario: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista de "Mis Calificaciones" para el alumno.
 */
async function renderMisCalificacionesView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2><i class="fas fa-star"></i> Mis Calificaciones</h2><p>Cargando calificaciones...</p>';

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/calificaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener el listado de calificaciones.');
        }

        const calificaciones = await response.json();

        let calificacionesRows = '<tr><td colspan="3">No se encontraron calificaciones.</td></tr>';
        if (calificaciones && calificaciones.length > 0) {
            calificacionesRows = calificaciones.map(cal => `
                <tr>
                    <td>${cal.materia}</td>
                    <td><span class="nota">${cal.nota_final}</span></td>
                    <td>${cal.detalle || 'Sin detalle'}</td>
                </tr>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-star"></i> Mis Calificaciones</h2>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Materia</th>
                        <th>Nota Final</th>
                        <th>Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    ${calificacionesRows}
                </tbody>
            </table>
        `;

    } catch (error) {
        contentArea.innerHTML += `<p class="message-error">Error al cargar las calificaciones: ${error.message}</p>`;
    }
}
