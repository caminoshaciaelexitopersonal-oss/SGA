// js/views/alumno.js

// --- Funciones para la Vista del Alumno / Padre ---

/**
 * Renderiza la vista de "Mis Cursos y Disciplinas" para el alumno.
 */
async function renderMisCursosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <div>
                <h2 style="color:#F8FAFC; margin:0; font-size:1.6rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-book-reader" style="color:#38BDF8;"></i> Mis Disciplinas Deportivas & Talleres
                </h2>
                <p style="color:#94A3B8; margin-top:0.25rem; font-size:0.9rem;">
                    Monitoreo de asistencia y actividades académicas en Deportes y Cultura (Danza: Joropo, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                </p>
            </div>
            <span class="badge-sub-free" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                <i class="fas fa-certificate"></i> Suscripción Estudiantil Costo 0
            </span>
        </div>
        <p style="color:#94A3B8;"><i class="fas fa-spinner fa-spin"></i> Cargando inscripciones...</p>
    `;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la lista de cursos.');
        }

        const cursos = await response.json();

        let cursoCards = '<p style="color:#94A3B8; background:#0D1424; padding:1.5rem; border-radius:12px; border:1px solid rgba(56,189,248,0.15);">No estás inscrito en ninguna disciplina deportiva o taller cultural actualmente.</p>';
        if (cursos && cursos.length > 0) {
            cursoCards = cursos.map(curso => `
                <div class="card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.5rem; backdrop-filter:blur(20px);">
                    <h3 style="color:#F8FAFC; margin-bottom:0.5rem; font-size:1.2rem;">${curso.nombre}</h3>
                    <p style="color:#94A3B8; margin-bottom:0.25rem;"><strong>Profesor / Instructor:</strong> ${curso.profesor ? curso.profesor.nombre_completo : 'Instructor Asignado'}</p>
                    <p style="color:#94A3B8; margin-bottom:1rem;"><strong>Horario:</strong> ${curso.horario || 'Lunes a Viernes'}</p>
                    <a href="#" class="btn-secondary" data-view="ver-curso-detalles" data-curso-id="${curso.id}" style="display:inline-block; background:rgba(56,189,248,0.1); color:#38BDF8; border:1px solid #38BDF8; font-weight:600; padding:0.6rem 1.2rem; border-radius:8px; text-decoration:none; min-height:44px; line-height:28px;">
                        Ver detalles y notas
                    </a>
                </div>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                <div>
                    <h2 style="color:#F8FAFC; margin:0; font-size:1.6rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-book-reader" style="color:#38BDF8;"></i> Mis Disciplinas Deportivas & Talleres
                    </h2>
                    <p style="color:#94A3B8; margin-top:0.25rem; font-size:0.9rem;">
                        Monitoreo de asistencia y actividades académicas en Deportes y Cultura (Danza: Joropo, Salsa, Vallenato | Instrumentos: Guitarra, Arpa).
                    </p>
                </div>
                <div style="display:flex; align-items:center; gap:1rem;">
                    <span class="badge-sub-free" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                        <i class="fas fa-certificate"></i> Suscripción Estudiantil Costo 0
                    </span>
                    <button id="btn-inscribirse-curso" class="btn-primary" style="background:#38BDF8; color:#070B14; font-weight:600; padding:0.6rem 1.2rem; border-radius:8px; border:none; min-height:44px; cursor:pointer;">
                        Inscribirse a Nueva Disciplina / Taller
                    </button>
                </div>
            </div>
            <div class="card-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
                ${cursoCards}
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML += `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar los cursos: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista de "Mi Horario" para el alumno.
 */
async function renderMiHorarioView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2 style="color:#F8FAFC;"><i class="fas fa-clock" style="color:#38BDF8;"></i> Mi Horario</h2><p style="color:#94A3B8;">Cargando horario...</p>';

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/horario`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener el horario.');
        }

        const horario = await response.json();

        let horarioRows = '<tr><td colspan="5" style="color:#94A3B8; text-align:center;">No tienes un horario asignado.</td></tr>';
        if (horario && horario.length > 0) {
            horarioRows = horario.map(clase => `
                <tr style="border-bottom:1px solid rgba(56,189,248,0.08);">
                    <td style="color:#F8FAFC; padding:0.75rem;">${clase.dia}</td>
                    <td style="color:#38BDF8; font-weight:600; padding:0.75rem;">${clase.hora_inicio} - ${clase.hora_fin}</td>
                    <td style="color:#F8FAFC; padding:0.75rem;">${clase.materia}</td>
                    <td style="color:#94A3B8; padding:0.75rem;">${clase.profesor}</td>
                    <td style="color:#94A3B8; padding:0.75rem;">${clase.escenario}</td>
                </tr>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header" style="margin-bottom:1.5rem;">
                <h2 style="color:#F8FAFC; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-clock" style="color:#38BDF8;"></i> Mi Horario de Clases y Entrenamientos
                </h2>
            </div>
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.25rem; overflow-x:auto;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(56,189,248,0.15); text-align:left;">
                            <th style="color:#94A3B8; padding:0.75rem;">Día</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Hora</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Disciplina / Taller</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Profesor / Instructor</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Escenario</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${horarioRows}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML += `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar el horario: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista de "Mis Calificaciones" para el alumno.
 */
async function renderMisCalificacionesView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2 style="color:#F8FAFC;"><i class="fas fa-star" style="color:#38BDF8;"></i> Mis Calificaciones</h2><p style="color:#94A3B8;">Cargando evaluaciones...</p>';

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/calificaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener el listado de calificaciones.');
        }

        const calificaciones = await response.json();

        let calificacionesRows = '<tr><td colspan="3" style="color:#94A3B8; text-align:center;">No se encontraron calificaciones registradas.</td></tr>';
        if (calificaciones && calificaciones.length > 0) {
            calificacionesRows = calificaciones.map(cal => `
                <tr style="border-bottom:1px solid rgba(56,189,248,0.08);">
                    <td style="color:#F8FAFC; padding:0.75rem;">${cal.materia}</td>
                    <td style="padding:0.75rem;"><span style="background:rgba(56,189,248,0.1); border:1px solid #38BDF8; color:#38BDF8; padding:4px 10px; border-radius:8px; font-weight:700;">${cal.nota_final}</span></td>
                    <td style="color:#94A3B8; padding:0.75rem;">${cal.detalle || 'Evaluación Técnica Cumplida'}</td>
                </tr>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header" style="margin-bottom:1.5rem;">
                <h2 style="color:#F8FAFC; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-star" style="color:#38BDF8;"></i> Mis Calificaciones y Desempeño
                </h2>
            </div>
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.25rem; overflow-x:auto;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(56,189,248,0.15); text-align:left;">
                            <th style="color:#94A3B8; padding:0.75rem;">Disciplina / Taller</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Nota / Desempeño</th>
                            <th style="color:#94A3B8; padding:0.75rem;">Detalle Técnico</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${calificacionesRows}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        contentArea.innerHTML += `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar las calificaciones: ${error.message}</p>`;
    }
}

/**
 * Renderiza la vista de "Mi Progreso" (Gamificación) para el alumno.
 */
async function renderMiGamificacionView(token, userId) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2 style="color:#F8FAFC;"><i class="fas fa-trophy" style="color:#38BDF8;"></i> Mi Progreso</h2><p style="color:#94A3B8;">Cargando datos de gamificación...</p>';

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumnos/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la información del alumno.');
        }

        const alumno = await response.json();

        contentArea.innerHTML = `
            <div class="view-header" style="margin-bottom:1.5rem;">
                <h2 style="color:#F8FAFC; font-size:1.5rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-trophy" style="color:#38BDF8;"></i> Mi Progreso y Logros
                </h2>
            </div>
            <div class="card-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
                <div class="card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.5rem; backdrop-filter:blur(20px);">
                    <h3 style="color:#F8FAFC; margin-bottom:0.5rem; font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-star" style="color:#38BDF8;"></i> Puntos Totales
                    </h3>
                    <p class="gamification-points" style="font-size:2rem; font-weight:700; color:#38BDF8; margin:0;">${alumno.puntos_totales || 250}</p>
                </div>
                <div class="card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.5rem; backdrop-filter:blur(20px);">
                    <h3 style="color:#F8FAFC; margin-bottom:0.5rem; font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-layer-group" style="color:#38BDF8;"></i> Nivel Actual
                    </h3>
                    <p class="gamification-level" style="font-size:2rem; font-weight:700; color:#F8FAFC; margin:0;">Nivel ${alumno.nivel || 2}</p>
                </div>
                <div class="card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.5rem; backdrop-filter:blur(20px);">
                    <h3 style="color:#F8FAFC; margin-bottom:0.5rem; font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">
                        <i class="fas fa-medal" style="color:#38BDF8;"></i> Insignias Obtenidas
                    </h3>
                    <p style="color:#94A3B8; font-size:0.9rem; margin:0;"><i class="fas fa-check-circle" style="color:#38BDF8;"></i> Asistencia Perfecta, Atleta Destacado</p>
                </div>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML += `<p class="message-error" style="color:#38BDF8; background:rgba(56,189,248,0.1); padding:1rem; border-radius:8px; border:1px solid #38BDF8;">Error al cargar el progreso: ${error.message}</p>`;
    }
}

// --- IndexedDB & Offline PWA Attendance Engine ---
const DB_NAME = 'sga_cd_offline_db';
const STORE_NAME = 'attendance_records';

function openAttendanceDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveAttendanceOffline(record) {
    try {
        const db = await openAttendanceDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.add({ ...record, synced: record.synced ?? false, timestamp: record.timestamp || new Date().toISOString() });
        return true;
    } catch (e) {
        const current = JSON.parse(localStorage.getItem('sga_offline_attendance') || '[]');
        current.push({ ...record, synced: record.synced ?? false, timestamp: record.timestamp || new Date().toISOString() });
        localStorage.setItem('sga_offline_attendance', JSON.stringify(current));
        return true;
    }
}

async function getLocalAttendanceRecords() {
    try {
        const db = await openAttendanceDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    } catch (e) {
        return JSON.parse(localStorage.getItem('sga_offline_attendance') || '[]');
    }
}

async function syncOfflineAttendance(token) {
    if (!navigator.onLine) return;
    const records = await getLocalAttendanceRecords();
    const unsynced = records.filter(r => !r.synced);
    if (unsynced.length === 0) return;

    for (const record of unsynced) {
        try {
            const res = await fetch(`${config.apiBaseUrl}/api/v1/alumno/asistencia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(record)
            });
            if (res.ok) {
                record.synced = true;
            }
        } catch (e) {
            console.warn('Sync attempt failed for record:', record);
        }
    }
}

/**
 * Renderiza la vista de "Asistencia Estudiantil PWA Offline" para el alumno.
 */
async function renderMiAsistenciaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2 style="color:#F8FAFC;"><i class="fas fa-check-circle" style="color:#38BDF8;"></i> Check-In de Asistencia</h2><p style="color:#94A3B8;">Cargando módulo de asistencia...</p>';

    syncOfflineAttendance(token);

    const localHistory = await getLocalAttendanceRecords();
    let historyRows = '<tr><td colspan="4" style="color:#94A3B8; text-align:center;">No hay registros de asistencia locales.</td></tr>';

    if (localHistory && localHistory.length > 0) {
        historyRows = localHistory.map(rec => `
            <tr style="border-bottom:1px solid rgba(56,189,248,0.08);">
                <td style="color:#F8FAFC; padding:0.75rem;">${rec.timestamp ? new Date(rec.timestamp).toLocaleString() : 'Reciente'}</td>
                <td style="color:#94A3B8; padding:0.75rem;">${rec.actividad || 'Entrenamiento Deportivo / Taller Cultural'}</td>
                <td style="padding:0.75rem;"><span style="background:rgba(56,189,248,0.1); border:1px solid #38BDF8; color:#38BDF8; padding:3px 10px; border-radius:12px; font-size:0.8rem; font-weight:600;">${rec.synced ? 'Sincronizado' : 'Pendiente (Offline)'}</span></td>
                <td style="padding:0.75rem;"><i class="fas ${rec.synced ? 'fa-cloud-check' : 'fa-wifi-slash'}" style="color:#38BDF8;"></i></td>
            </tr>
        `).join('');
    }

    contentArea.innerHTML = `
        <div class="view-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <div>
                <h2 style="color:#F8FAFC; margin:0; font-size:1.6rem; display:flex; align-items:center; gap:0.5rem;">
                    <i class="fas fa-check-circle" style="color:#38BDF8;"></i> Check-In de Asistencia PWA
                </h2>
                <p style="color:#94A3B8; margin-top:0.25rem; font-size:0.9rem;">
                    Asistencia digital instantánea para Disciplinas Deportivas y Talleres Culturales.
                </p>
            </div>
            <div style="display:flex; align-items:center; gap:1rem;">
                <span class="badge-sub-free" style="background: rgba(56, 189, 248, 0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
                    <i class="fas fa-certificate"></i> Suscripción Estudiantil Costo 0
                </span>
                <span id="connection-status" style="background:rgba(56,189,248,0.1); border:1px solid #38BDF8; color:#38BDF8; padding:6px 14px; border-radius:20px; font-weight:600; font-size:0.85rem;">
                    <i class="fas ${navigator.onLine ? 'fa-wifi' : 'fa-plane'}"></i> ${navigator.onLine ? 'En Línea' : 'Modo Offline'}
                </span>
            </div>
        </div>

        <div class="card" style="text-align:center; padding:2.5rem; margin-bottom:2rem; background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; backdrop-filter:blur(20px);">
            <h3 style="color:#F8FAFC; margin-bottom:0.5rem; font-size:1.3rem;"><i class="fas fa-qrcode" style="color:#38BDF8;"></i> Marcar Asistencia Instantánea</h3>
            <p style="color:#94A3B8; margin-bottom:1.5rem;">Toca el botón para registrar tu presencia en la sesión de hoy. Operacional con o sin conexión a internet.</p>
            <button id="btn-checkin-asistencia" class="btn-primary" style="background:#38BDF8; color:#070B14; font-weight:700; min-height:48px; min-width:220px; font-size:1.1rem; border-radius:10px; border:none; cursor:pointer;">
                <i class="fas fa-fingerprint"></i> Check-In Ahora
            </button>
            <div id="checkin-feedback" style="margin-top:1rem; font-weight:bold;"></div>
        </div>

        <h3 style="color:#F8FAFC; margin-bottom:1rem; font-size:1.2rem; display:flex; align-items:center; gap:0.5rem;">
            <i class="fas fa-history" style="color:#38BDF8;"></i> Historial Reciente de Asistencia
        </h3>
        <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.15); border-radius:12px; padding:1.25rem; overflow-x:auto;">
            <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(56,189,248,0.15); text-align:left;">
                        <th style="color:#94A3B8; padding:0.75rem;">Fecha / Hora</th>
                        <th style="color:#94A3B8; padding:0.75rem;">Actividad</th>
                        <th style="color:#94A3B8; padding:0.75rem;">Estado de Red</th>
                        <th style="color:#94A3B8; padding:0.75rem;">Icono</th>
                    </tr>
                </thead>
                <tbody>
                    ${historyRows}
                </tbody>
            </table>
        </div>
    `;

    const checkinBtn = document.getElementById('btn-checkin-asistencia');
    const feedback = document.getElementById('checkin-feedback');

    checkinBtn.addEventListener('click', async () => {
        checkinBtn.disabled = true;
        checkinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

        const recordPayload = {
            actividad: 'Entrenamiento Deportivo / Taller Cultural',
            ubicacion: 'Escenario Central',
            latitud: 4.6097,
            longitud: -74.0817
        };

        if (navigator.onLine) {
            try {
                const res = await fetch(`${config.apiBaseUrl}/api/v1/alumno/asistencia`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(recordPayload)
                });
                if (res.ok) {
                    await saveAttendanceOffline({ ...recordPayload, synced: true });
                    feedback.style.color = '#38BDF8';
                    feedback.innerHTML = '<i class="fas fa-circle-check"></i> ¡Asistencia registrada y sincronizada en el servidor!';
                } else {
                    throw new Error('Servidor devolvió error.');
                }
            } catch (err) {
                await saveAttendanceOffline({ ...recordPayload, synced: false });
                feedback.style.color = '#38BDF8';
                feedback.innerHTML = '<i class="fas fa-wifi-slash"></i> Guardado en almacenamiento local (Se sincronizará al reconectar).';
            }
        } else {
            await saveAttendanceOffline({ ...recordPayload, synced: false });
            feedback.style.color = '#38BDF8';
            feedback.innerHTML = '<i class="fas fa-wifi-slash"></i> Guardado en modo offline local. Se sincronizará automáticamente.';
        }

        setTimeout(() => {
            renderMiAsistenciaView(token);
        }, 1500);
    });

    window.addEventListener('online', () => {
        const connStatus = document.getElementById('connection-status');
        if (connStatus) {
            connStatus.innerHTML = '<i class="fas fa-wifi"></i> En Línea';
        }
        syncOfflineAttendance(token);
    });
}

// --- Registrar todas las vistas de Alumno en el Router ---
if (typeof registerView === 'function') {
    registerView('alumno', 'mis-cursos', renderMisCursosView);
    registerView('alumno', 'mi-horario', renderMiHorarioView);
    registerView('alumno', 'mis-calificaciones', renderMisCalificacionesView);
    registerView('alumno', 'mi-progreso', renderMiGamificacionView);
    registerView('alumno', 'mi-asistencia', renderMiAsistenciaView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
