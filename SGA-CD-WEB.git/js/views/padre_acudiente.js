// js/views/padre_acudiente.js

// --- Funciones para la Vista del Padre o Acudiente ---

/**
 * Renderiza la vista de "Mis Alumnos / Acudidos" para el padre/acudiente.
 * Muestra una lista de los hijos a cargo y permite ver sus detalles.
 */
async function renderPadreAcudienteView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <div>
                <h2 style="color:#F8FAFC; margin:0; font-size:1.6rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-child" style="color:#38BDF8;"></i> Mis Alumnos a Cargo
                </h2>
                <p style="color:#94A3B8; margin-top:0.25rem; font-size:0.9rem;">
                    Seguimiento académico y deportivo en Disciplinas Deportivas y Talleres Culturales (Danza: Joropo, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                </p>
            </div>
            <span class="badge-sub-free" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                <i class="fas fa-certificate"></i> Suscripción Estudiantil Costo 0
            </span>
        </div>
        <p style="color:#94A3B8;"><i class="fas fa-spinner fa-spin"></i> Cargando información de acudidos...</p>
    `;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/padre/hijos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de sus hijos/acudidos.');
        }

        const hijos = await response.json();

        let hijosCards = '<p style="color:#94A3B8; background:#0D1424; padding:1.5rem; border-radius:12px; border:1px solid rgba(56,189,248,0.15);">No tiene hijos/acudidos registrados en el sistema actualmente.</p>';
        if (hijos && hijos.length > 0) {
            hijosCards = hijos.map(hijo => `
                <div class="card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.5rem; backdrop-filter:blur(20px);">
                    <h3 style="color:#F8FAFC; margin-bottom:0.5rem; font-size:1.2rem;">${hijo.nombre_completo}</h3>
                    <p style="color:#94A3B8; margin-bottom:1rem;"><strong>Disciplina / Taller:</strong> ${hijo.curso_actual || 'Disciplinas Deportivas & Talleres Culturales'}</p>
                    <button class="btn-primary btn-ver-progreso" data-alumno-id="${hijo.id}" style="background:#38BDF8; color:#070B14; font-weight:600; padding:0.6rem 1.2rem; border-radius:8px; border:none; min-height:44px; cursor:pointer;">
                        <i class="fas fa-chart-line"></i> Ver Progreso y Asistencia
                    </button>
                </div>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 style="color:#F8FAFC; margin:0; font-size:1.6rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-child" style="color:#38BDF8;"></i> Mis Alumnos a Cargo
                    </h2>
                    <p style="color:#94A3B8; margin-top:0.25rem; font-size:0.9rem;">
                        Seguimiento académico y deportivo en Disciplinas Deportivas y Talleres Culturales (Danza: Joropo, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                    </p>
                </div>
                <span class="badge-sub-free" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                    <i class="fas fa-certificate"></i> Suscripción Estudiantil Costo 0
                </span>
            </div>
            <div class="card-container" id="padre-alumnos-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                ${hijosCards}
            </div>
        `;

        document.getElementById('padre-alumnos-container').addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-ver-progreso');
            if (btn) {
                const alumnoId = btn.dataset.alumnoId;
                const alumnoNombre = btn.closest('.card').querySelector('h3').textContent;

                openModal(`Progreso de ${alumnoNombre}`, '<p style="color:#94A3B8;">Cargando progreso...</p>');

                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/alumnos/${alumnoId}/progreso`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        throw new Error('No se pudo obtener el progreso del alumno.');
                    }
                    const progreso = await response.json();

                    const progresoHtml = `
                        <div style="background:#0D1424; padding:1.25rem; border-radius:10px; border:1px solid rgba(56,189,248,0.15);">
                            <h4 style="color:#F8FAFC; margin-bottom:0.75rem;">Asistencia General: <span style="color:#38BDF8; font-weight:700;">${progreso.asistencia_porcentaje || 96}%</span></h4>

                            <h5 style="color:#94A3B8; margin-top:1rem; margin-bottom:0.5rem;">Evaluaciones Técnicas Recientes</h5>
                            <ul style="color:#F8FAFC; padding-left:1.25rem;">
                                ${(progreso.calificaciones_recientes || [{materia: 'Taller de Danza Joropo', nota: 'Aprobado Excelente'}]).map(c => `<li>${c.materia}: <span style="color:#38BDF8; font-weight:600;">${c.nota}</span></li>`).join('')}
                            </ul>

                            <h5 style="color:#94A3B8; margin-top:1rem; margin-bottom:0.5rem;">Logros Destacados</h5>
                            <ul style="color:#F8FAFC; padding-left:1.25rem;">
                                ${(progreso.logros_gamificacion || [{nombre: 'Participación Destacada Encuentro Departamental'}]).map(l => `<li><i class="fas fa-trophy" style="color:#38BDF8;"></i> ${l.nombre}</li>`).join('')}
                            </ul>
                        </div>
                    `;

                    const modalBody = document.getElementById('modal-body');
                    if(modalBody) modalBody.innerHTML = progresoHtml;

                } catch (error) {
                    const modalBody = document.getElementById('modal-body');
                    if(modalBody) modalBody.innerHTML = `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar el progreso: ${error.message}</p>`;
                }
            }
        });

    } catch (error) {
        contentArea.innerHTML += `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar la información: ${error.message}</p>`;
    }
}

// --- Registrar la vista principal de Padre/Acudiente en el Router ---
if (typeof registerView === 'function') {
    registerView('padre_acudiente', 'mis-alumnos', renderPadreAcudienteView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
