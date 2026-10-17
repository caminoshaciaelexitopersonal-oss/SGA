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

/**
 * Renderiza la vista de "Mi Progreso" (Gamificación) para el alumno.
 */
async function renderMiGamificacionView(token, userId) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<h2><i class="fas fa-trophy"></i> Mi Progreso</h2><p>Cargando datos de gamificación...</p>';

    try {
        // Fetch a los datos del alumno para obtener puntos y nivel
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumnos/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener la información del alumno.');
        }

        const alumno = await response.json();

        // Placeholder para medallas, ya que no hay endpoint en el backend
        const medallasHtml = `
            <div class="card">
                <h3><i class="fas fa-medal"></i> Medallas Obtenidas</h3>
                <p><i>La información de medallas no está disponible actualmente.</i></p>
            </div>
        `;

        contentArea.innerHTML = `
            <div class="view-header">
                <h2><i class="fas fa-trophy"></i> Mi Progreso</h2>
            </div>
            <div class="card-container">
                <div class="card">
                    <h3><i class="fas fa-star"></i> Puntos Totales</h3>
                    <p class="gamification-points">${alumno.puntos_totales || 0}</p>
                </div>
                <div class="card">
                    <h3><i class="fas fa-layer-group"></i> Nivel Actual</h3>
                    <p class="gamification-level">${alumno.nivel || 0}</p>
                </div>
                ${medallasHtml}
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML += `<p class="message-error">Error al cargar el progreso: ${error.message}</p>`;
    }
}

async function renderAlumnoMisionesView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-tasks"></i> Misiones Disponibles</h2></div><p>Cargando misiones...</p>`;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/gamificacion/misiones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudieron cargar las misiones.');
        const misiones = await response.json();

        let misionesHtml = '<p>No hay misiones disponibles en este momento.</p>';
        if (misiones && misiones.length > 0) {
            misionesHtml = misiones.map(mision => `
                <div class="card">
                    <h3>${mision.nombre} ${mision.es_grupal ? '<span class="badge">Grupal</span>' : ''}</h3>
                    <p>${mision.descripcion}</p>
                    <p><strong>Recompensa:</strong> ${mision.puntos_recompensa} puntos</p>
                    <button class="btn-primary" disabled>Ver Progreso</button>
                </div>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header"><h2><i class="fas fa-tasks"></i> Misiones Disponibles</h2></div>
            <div class="card-container">${misionesHtml}</div>
        `;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error">Error al cargar las misiones: ${error.message}</p>`;
    }
}

async function renderMercadoView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-store"></i> Mercado de Puntos</h2></div><p>Cargando artículos...</p>`;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/gamificacion/mercado/items`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudieron cargar los artículos del mercado.');
        const items = await response.json();

        let itemsHtml = '<p>No hay artículos disponibles en el mercado en este momento.</p>';
        if (items && items.length > 0) {
            itemsHtml = items.map(item => `
                <div class="card">
                    <h3>${item.nombre}</h3>
                    <p>${item.descripcion}</p>
                    <p><strong>Costo:</strong> <span class="badge points">${item.costo_puntos} puntos</span></p>
                    <button class="btn-primary btn-comprar-item" data-item-id="${item.id}">Comprar</button>
                </div>
            `).join('');
        }

        contentArea.innerHTML = `
            <div class="view-header"><h2><i class="fas fa-store"></i> Mercado de Puntos</h2></div>
            <div class="card-container" id="mercado-container">${itemsHtml}</div>
        `;

        document.getElementById('mercado-container').addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-comprar-item')) {
                const itemId = e.target.dataset.itemId;
                if (confirm('¿Estás seguro de que quieres comprar este artículo? Se deducirán los puntos de tu cuenta.')) {
                    const buyResponse = await fetch(`${config.apiBaseUrl}/api/v1/gamificacion/mercado/comprar/${itemId}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (buyResponse.ok) {
                        alert('¡Compra exitosa!');
                    } else {
                        const errorData = await buyResponse.json();
                        alert(`Error en la compra: ${errorData.detail}`);
                    }
                }
            }
        });

    } catch (error) {
        contentArea.innerHTML = `<p class="message-error">Error al cargar el mercado: ${error.message}</p>`;
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
    contentArea.innerHTML = '<h2><i class="fas fa-check-circle"></i> Check-In de Asistencia</h2><p>Cargando módulo de asistencia...</p>';

    // Trigger background sync if online
    syncOfflineAttendance(token);

    const localHistory = await getLocalAttendanceRecords();
    let historyRows = '<tr><td colspan="4">No hay registros de asistencia locales.</td></tr>';

    if (localHistory && localHistory.length > 0) {
        historyRows = localHistory.map(rec => `
            <tr>
                <td>${rec.timestamp ? new Date(rec.timestamp).toLocaleString() : 'Reciente'}</td>
                <td>${rec.actividad || 'Entrenamiento Deportivo / Taller Cultural'}</td>
                <td><span class="badge ${rec.synced ? 'points' : ''}">${rec.synced ? 'Sincronizado' : 'Pendiente (Offline)'}</span></td>
                <td><i class="fas ${rec.synced ? 'fa-cloud-check' : 'fa-wifi-slash'}" style="color:${rec.synced ? 'var(--color-accent-cyan)' : 'var(--color-secondary-gold)'}"></i></td>
            </tr>
        `).join('');
    }

    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-check-circle"></i> Check-In de Asistencia PWA</h2>
            <span id="connection-status" class="badge ${navigator.onLine ? 'points' : ''}" style="padding:0.5rem 1rem;">
                <i class="fas ${navigator.onLine ? 'fa-wifi' : 'fa-plane'}"></i> ${navigator.onLine ? 'En Línea' : 'Modo Offline'}
            </span>
        </div>

        <div class="card" style="text-align:center; padding:2.5rem; margin-bottom:2rem; background:var(--color-surface-card); border:1px solid var(--color-border-specular);">
            <h3><i class="fas fa-qrcode"></i> Marcar Asistencia Instantánea</h3>
            <p>Toca el botón para registrar tu presencia en la sesión de hoy. Operacional con o sin conexión a internet.</p>
            <button id="btn-checkin-asistencia" class="btn-primary" style="min-height:50px; min-width:200px; font-size:1.1rem; border-radius:12px; margin-top:1rem; cursor:pointer;">
                <i class="fas fa-fingerprint"></i> Check-In Ahora
            </button>
            <div id="checkin-feedback" style="margin-top:1rem; font-weight:bold;"></div>
        </div>

        <h3><i class="fas fa-history"></i> Historial Reciente de Asistencia</h3>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha / Hora</th>
                    <th>Actividad</th>
                    <th>Estado de Red</th>
                    <th>Icono</th>
                </tr>
            </thead>
            <tbody>
                ${historyRows}
            </tbody>
        </table>
    `;

    // Event listener for Check-In button
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
                    feedback.style.color = 'var(--color-accent-cyan)';
                    feedback.innerHTML = '<i class="fas fa-circle-check"></i> ¡Asistencia registrada y sincronizada en el servidor!';
                } else {
                    throw new Error('Servidor devolvió error.');
                }
            } catch (err) {
                await saveAttendanceOffline({ ...recordPayload, synced: false });
                feedback.style.color = 'var(--color-secondary-gold)';
                feedback.innerHTML = '<i class="fas fa-wifi-slash"></i> Guardado en almacenamiento local (Se sincronizará al reconectar).';
            }
        } else {
            await saveAttendanceOffline({ ...recordPayload, synced: false });
            feedback.style.color = 'var(--color-secondary-gold)';
            feedback.innerHTML = '<i class="fas fa-wifi-slash"></i> Guardado en modo offline local. Se sincronizará automáticamente.';
        }

        setTimeout(() => {
            renderMiAsistenciaView(token);
        }, 1500);
    });

    // Handle online reconnection event listener
    window.addEventListener('online', () => {
        const connStatus = document.getElementById('connection-status');
        if (connStatus) {
            connStatus.innerHTML = '<i class="fas fa-wifi"></i> En Línea';
            connStatus.classList.add('points');
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
    registerView('alumno', 'misiones', renderAlumnoMisionesView);
    registerView('alumno', 'mercado', renderMercadoView);
    registerView('alumno', 'mi-asistencia', renderMiAsistenciaView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
