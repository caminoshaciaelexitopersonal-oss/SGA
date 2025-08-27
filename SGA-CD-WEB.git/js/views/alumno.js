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

    // Implementación futura: Llamar a /api/v1/alumno/horario y renderizar un calendario.
    // Por ahora, se muestra un mensaje.
    contentArea.innerHTML += `<p>La visualización del horario en formato calendario se implementará próximamente.</p>`;
}

/**
 * Renderiza la vista de "Mis Calificaciones" para el alumno.
 */
async function renderMisCalificacionesView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2><i class="fas fa-star"></i> Mis Calificaciones</h2><p>Cargando calificaciones...</p>';

    // Implementación futura: Llamar a /api/v1/alumno/calificaciones y mostrar una tabla.
    // Por ahora, se muestra un mensaje.
     contentArea.innerHTML += `<p>La visualización de calificaciones detalladas se implementará próximamente.</p>`;
}
