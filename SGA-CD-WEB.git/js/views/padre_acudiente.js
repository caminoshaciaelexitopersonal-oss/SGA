// js/views/padre_acudiente.js

// --- Funciones para la Vista del Padre o Acudiente ---

/**
 * Renderiza la vista de "Mis Alumnos" para el padre/acudiente.
 * Muestra una lista de los hijos a cargo y permite ver sus detalles.
 */
async function renderPadreAcudienteView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2><i class="fas fa-child"></i> Mis Alumnos</h2><p>Cargando información...</p>';

    try {
        // Se asume un endpoint /api/v1/padre/hijos que devuelve los alumnos asociados.
        const response = await fetch(`${config.apiBaseUrl}/api/v1/padre/hijos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de sus hijos/acudidos.');
        }

        const hijos = await response.json();

        let hijosCards = '<p>No tiene hijos/acudidos registrados en el sistema.</p>';
        if (hijos && hijos.length > 0) {
            hijosCards = hijos.map(hijo => `
                <div class="card">
                    <h3>${hijo.nombre_completo}</h3>
                    <p><strong>Curso:</strong> ${hijo.curso_actual || 'No asignado'}</p>
                    <button class="btn-primary btn-ver-progreso" data-alumno-id="${hijo.id}">Ver Progreso</button>
                </div>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-child"></i> Mis Alumnos</h2>
            </div>
            <div class="card-container" id="padre-alumnos-container">
                ${hijosCards}
            </div>
        `;

        // Añadir listener para los botones de "Ver Progreso"
        document.getElementById('padre-alumnos-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-ver-progreso')) {
                const alumnoId = e.target.dataset.alumnoId;
                // Aquí se podría abrir un modal con la información detallada del alumno
                openModal('Progreso del Alumno', `<p>Mostrando progreso para el alumno con ID: ${alumnoId}. Esta funcionalidad se implementará en detalle.</p>`);
            }
        });

    } catch (error) {
        contentArea.innerHTML += `<p class="message-error">Error al cargar la información: ${error.message}</p>`;
    }
}
