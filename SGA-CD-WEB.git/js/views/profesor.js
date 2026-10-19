// js/views/profesor.js

// --- Vistas para el Rol de Profesor / Instructor ---

async function renderProfesorView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="profesor-dashboard">
            <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h2 style="color: #F8FAFC; margin: 0; font-size: 1.6rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chalkboard-teacher" style="color: #38BDF8;"></i> Panel del Profesor / Instructor
                    </h2>
                    <p style="color: #94A3B8; margin-top: 0.25rem; font-size: 0.9rem;">
                        Gestión académica y seguimiento de Disciplinas Deportivas y Talleres Culturales (Danza: Joropo/Llanera, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                    </p>
                </div>
                <span class="badge-role" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                    <i class="fas fa-user-graduate"></i> Instructor Acreditado
                </span>
            </div>

            <!-- Matrix KPI Bento Grid -->
            <div class="bento-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="bento-card" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(20px);">
                    <div style="font-size: 0.8rem; text-transform: uppercase; tracking: 0.05em; color: #94A3B8; margin-bottom: 0.5rem;">Cursos & Talleres Asignados</div>
                    <div style="font-size: 1.8rem; font-weight: 700; color: #F8FAFC;">6 Grupos</div>
                    <div style="font-size: 0.8rem; color: #38BDF8; margin-top: 0.25rem;"><i class="fas fa-layer-group"></i> Actividades Culturales y Deportivas</div>
                </div>
                <div class="bento-card" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(20px);">
                    <div style="font-size: 0.8rem; text-transform: uppercase; tracking: 0.05em; color: #94A3B8; margin-bottom: 0.5rem;">Total Estudiantes Activos</div>
                    <div style="font-size: 1.8rem; font-weight: 700; color: #F8FAFC;">142 Alumnos</div>
                    <div style="font-size: 0.8rem; color: #38BDF8; margin-top: 0.25rem;"><i class="fas fa-users"></i> Asistencia Promedio 95.8%</div>
                </div>
                <div class="bento-card" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.25rem; backdrop-filter: blur(20px);">
                    <div style="font-size: 0.8rem; text-transform: uppercase; tracking: 0.05em; color: #94A3B8; margin-bottom: 0.5rem;">Sincronización PWA Offline</div>
                    <div style="font-size: 1.8rem; font-weight: 700; color: #38BDF8;">Al Día</div>
                    <div style="font-size: 0.8rem; color: #94A3B8; margin-top: 0.25rem;"><i class="fas fa-sync"></i> Registro de Asistencia Local</div>
                </div>
            </div>

            <div id="profesor-cursos-container" style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="color: #F8FAFC; margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-book" style="color: #38BDF8;"></i> Mis Cursos y Disciplinas Asignadas
                </h3>
                <p style="color: #94A3B8;">Cargando cursos y talleres asignados...</p>
            </div>

            <div id="profesor-alumnos-container">
                <!-- Los detalles de los alumnos se mostrarán aquí -->
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/profesor/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('No se pudo obtener la lista de cursos.');

        const courses = await response.json();
        const coursesContainer = document.getElementById('profesor-cursos-container');

        coursesContainer.innerHTML = `
            <h3 style="color: #F8FAFC; margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-book" style="color: #38BDF8;"></i> Mis Cursos y Disciplinas Asignadas
            </h3>
            <div style="overflow-x: auto;">
                <table class="data-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(56, 189, 248, 0.15); text-align: left;">
                            <th style="color: #94A3B8; padding: 0.75rem;">ID</th>
                            <th style="color: #94A3B8; padding: 0.75rem;">Nombre del Curso / Taller</th>
                            <th style="color: #94A3B8; padding: 0.75rem;">Descripción</th>
                            <th style="color: #94A3B8; padding: 0.75rem;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderCourseRows(courses)}
                    </tbody>
                </table>
            </div>
        `;

        setupProfesorViewListeners(token);

    } catch (error) {
        console.error('Error rendering profesor view:', error);
        contentArea.innerHTML = `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar el panel del profesor: ${error.message}</p>`;
    }
}

function renderCourseRows(courses) {
    if (!courses || courses.length === 0) {
        return '<tr><td colspan="4" style="color: #94A3B8; text-align: center;">No tienes cursos asignados actualmente.</td></tr>';
    }
    return courses.map(course => `
        <tr style="border-bottom: 1px solid rgba(56, 189, 248, 0.08);">
            <td style="color: #94A3B8; padding: 0.75rem;">#${course.id}</td>
            <td style="color: #F8FAFC; font-weight: 500; padding: 0.75rem;">${course.nombre}</td>
            <td style="color: #94A3B8; padding: 0.75rem;">${course.descripcion || 'N/A'}</td>
            <td style="padding: 0.75rem;">
                <button class="btn-primary btn-ver-alumnos" data-course-id="${course.id}" data-course-name="${course.nombre}" style="background: #38BDF8; color: #070B14; font-weight: 600; padding: 0.5rem 1rem; border-radius: 8px; border: none; min-height: 44px; cursor: pointer;">
                    <i class="fas fa-users"></i> Ver Alumnos
                </button>
            </td>
        </tr>
    `).join('');
}

// --- Registro de Vistas para el Rol de Profesor / Instructor (GAP-02 & Suscripción) ---
if (typeof registerView === 'function') {
    registerView('profesor', 'gestionar-cursos', renderProfesorView);
    registerView('profesor', 'dashboard', renderProfesorView);
    if (typeof renderSuscripcionView === 'function') {
        registerView('profesor', 'suscripcion', renderSuscripcionView);
    }
}

function setupProfesorViewListeners(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-ver-alumnos');
        if (btn) {
            const courseId = btn.dataset.courseId;
            const courseName = btn.dataset.courseName;
            const alumnosContainer = document.getElementById('profesor-alumnos-container');
            alumnosContainer.innerHTML = `
                <div style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.5rem;">
                    <p style="color: #94A3B8;"><i class="fas fa-spinner fa-spin"></i> Cargando alumnos para "${courseName}"...</p>
                </div>
            `;

            try {
                const response = await fetch(`${config.apiBaseUrl}/api/v1/profesor/courses/${courseId}/students`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('No se pudo obtener la lista de alumnos.');

                const students = await response.json();
                alumnosContainer.innerHTML = `
                    <div style="background: #0D1424; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 1.5rem;">
                        <h3 style="color: #F8FAFC; margin-bottom: 1rem; font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-user-check" style="color: #38BDF8;"></i> Alumnos Inscritos en "${courseName}"
                        </h3>
                        <div style="overflow-x: auto;">
                            <table class="data-table" style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="border-bottom: 1px solid rgba(56, 189, 248, 0.15); text-align: left;">
                                        <th style="color: #94A3B8; padding: 0.75rem;">ID</th>
                                        <th style="color: #94A3B8; padding: 0.75rem;">Nombre Completo</th>
                                        <th style="color: #94A3B8; padding: 0.75rem;">Correo Electrónico</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${renderStudentRows(students)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } catch (error) {
                alumnosContainer.innerHTML = `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar los alumnos: ${error.message}</p>`;
            }
        }
    });
}

function renderStudentRows(students) {
    if (!students || students.length === 0) {
        return '<tr><td colspan="3" style="color: #94A3B8; text-align: center;">No hay alumnos inscritos en este curso.</td></tr>';
    }
    return students.map(student => `
        <tr style="border-bottom: 1px solid rgba(56, 189, 248, 0.08);">
            <td style="color: #94A3B8; padding: 0.75rem;">#${student.id}</td>
            <td style="color: #F8FAFC; font-weight: 500; padding: 0.75rem;">${student.nombre_completo}</td>
            <td style="color: #94A3B8; padding: 0.75rem;">${student.correo}</td>
        </tr>
    `).join('');
}
