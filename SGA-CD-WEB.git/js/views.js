// --- Funciones para Renderizar Vistas Específicas ---

// Esta función actuará como un enrutador del lado del cliente
async function renderContentForView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // Limpiar el área de contenido anterior
    contentArea.innerHTML = '<h2>Cargando...</h2>';

    try {
        // Un gran switch para manejar todas las vistas
        switch (viewName) {
            // Vistas para admin_empresa
            case 'dashboard':
                contentArea.innerHTML = await getDashboardView();
                break;
            case 'gestionar-usuarios':
                contentArea.innerHTML = await getGestionarUsuariosView(token);
                break;
            case 'gestionar-áreas':
                contentArea.innerHTML = await getGestionarAreasView(token);
                break;
            case 'reportes':
                contentArea.innerHTML = '<h2>Reportes</h2><p>Aquí se mostrarán los reportes de la empresa.</p>';
                break;

            // Vistas para jefe_area
            case 'eventos-y-salidas':
                contentArea.innerHTML = await getEventosSalidasView(token);
                break;
            case 'gamificación':
                contentArea.innerHTML = await getGamificacionView(token);
                break;

            // Vistas para profesor
            case 'gestionar-alumnos':
                contentArea.innerHTML = await getGestionarAlumnosView(token);
                break;

            // Vistas para alumno
            case 'mis-cursos':
                contentArea.innerHTML = await getMisCursosView(token);
                break;

            // Vistas para jefe_escenarios
            case 'calendario-de-escenarios':
                contentArea.innerHTML = await getCalendarioEscenariosView(token);
                break;
            case 'asignar-espacios':
                contentArea.innerHTML = '<h2>Asignar Espacios</h2><p>Aquí se gestionará la asignación de espacios a eventos y profesores.</p>';
                break;
            case 'mantenimiento':
                contentArea.innerHTML = '<h2>Mantenimiento de Escenarios</h2><p>Aquí se registrará y dará seguimiento al mantenimiento de los escenarios.</p>';
                break;

            // Vistas para admin_general
            case 'verificar-roles-bd':
                contentArea.innerHTML = await getVerificarRolesView(token);
                break;

            // Añadir más casos para otras vistas y roles aquí...

            default:
                contentArea.innerHTML = '<h2>Vista no encontrada</h2><p>La vista solicitada no existe.</p>';
        }
    } catch (error) {
        console.error(`Error al renderizar la vista ${viewName}:`, error);
        contentArea.innerHTML = `<p style="color: red;">Error al cargar el contenido: ${error.message}</p>`;
    }
}


// --- Funciones de Ejemplo para Obtener Datos y Construir HTML ---

async function getDashboardView() {
    // En un caso real, esto podría obtener estadísticas de la API
    return `
        <h2>Dashboard Principal</h2>
        <p>Bienvenido a la plataforma SGA-CD. Aquí verás un resumen de la actividad de tu organización.</p>
        <!-- Aquí podrían ir tarjetas con estadísticas -->
    `;
}

async function getGestionarUsuariosView(token) {
    // Asumo un endpoint /api/v1/users para obtener la lista de usuarios de la empresa
    const response = await fetch(`${config.apiBaseUrl}/api/v1/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios.');

    const users = await response.json();

    let userRows = '';
    if (users && users.length > 0) {
        userRows = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.nombre_completo || user.username}</td>
                <td>${user.email}</td>
                <td>${user.rol.nombre}</td>
                <td>
                    <button>Editar</button>
                    <button>Eliminar</button>
                </td>
            </tr>
        `).join('');
    } else {
        userRows = '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
    }

    return `
        <h2>Gestionar Usuarios de la Empresa</h2>
        <button>Añadir Nuevo Usuario</button>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${userRows}
            </tbody>
        </table>
    `;
}

// Aquí se agregarán más funciones para cada vista...
// ej. getGestionarEventosView, getMisCursosView, etc.

async function getGestionarAreasView(token) {
    // Asumo un endpoint /api/v1/areas para obtener la lista de áreas de la empresa
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/areas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de áreas.');

        const areas = await response.json();

        let areaRows = '';
        if (areas && areas.length > 0) {
            areaRows = areas.map(area => `
                <tr>
                    <td>${area.id}</td>
                    <td>${area.nombre}</td>
                    <td>${area.jefe_area ? area.jefe_area.nombre_completo : 'No asignado'}</td>
                    <td>${area.descripcion}</td>
                    <td>
                        <button>Editar</button>
                        <button>Ver Detalles</button>
                    </td>
                </tr>
            `).join('');
        } else {
            areaRows = '<tr><td colspan="5">No se encontraron áreas.</td></tr>';
        }

        return `
            <h2>Gestionar Áreas de la Empresa</h2>
            <button>Crear Nueva Área</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Área</th>
                        <th>Jefe de Área</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${areaRows}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error en getGestionarAreasView:', error);
        return `<h2>Gestionar Áreas</h2><p class="message-error">Error al cargar las áreas: ${error.message}</p>`;
    }
}

async function getEventosSalidasView(token) {
    // Asumo un endpoint /api/v1/eventos para obtener la lista de eventos del área
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/eventos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de eventos.');

        const eventos = await response.json();

        let eventoRows = '';
        if (eventos && eventos.length > 0) {
            eventoRows = eventos.map(evento => `
                <tr>
                    <td>${evento.id}</td>
                    <td>${evento.nombre}</td>
                    <td>${evento.tipo}</td>
                    <td>${new Date(evento.fecha).toLocaleDateString()}</td>
                    <td><span class="status-${evento.estado.toLowerCase()}">${evento.estado}</span></td>
                    <td>
                        <button>Editar</button>
                        <button>Gestionar Inscritos</button>
                    </td>
                </tr>
            `).join('');
        } else {
            eventoRows = '<tr><td colspan="6">No se encontraron eventos o salidas.</td></tr>';
        }

        return `
            <h2>Gestionar Eventos y Salidas</h2>
            <button>Crear Nuevo Evento/Salida</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${eventoRows}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error en getEventosSalidasView:', error);
        return `<h2>Eventos y Salidas</h2><p class="message-error">Error al cargar los datos: ${error.message}</p>`;
    }
}

async function getGestionarAlumnosView(token) {
    // Asumo un endpoint /api/v1/profesor/alumnos para obtener los alumnos del profesor
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/profesor/alumnos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de alumnos.');

        const alumnos = await response.json();

        let alumnoRows = '';
        if (alumnos && alumnos.length > 0) {
            alumnoRows = alumnos.map(alumno => `
                <tr>
                    <td>${alumno.id}</td>
                    <td>${alumno.nombre_completo}</td>
                    <td>${alumno.email}</td>
                    <td>${alumno.curso_actual || 'N/A'}</td>
                    <td>
                        <button>Registrar Asistencia</button>
                        <button>Ver Calificaciones</button>
                    </td>
                </tr>
            `).join('');
        } else {
            alumnoRows = '<tr><td colspan="5">No tiene alumnos asignados.</td></tr>';
        }

        return `
            <h2>Gestionar Alumnos</h2>
            <button>Registrar Nuevo Alumno</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Curso/Grupo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${alumnoRows}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error en getGestionarAlumnosView:', error);
        return `<h2>Gestionar Alumnos</h2><p class="message-error">Error al cargar los datos: ${error.message}</p>`;
    }
}

async function getMisCursosView(token) {
    // Asumo un endpoint /api/v1/alumno/cursos para obtener los cursos del alumno
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/alumno/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de cursos.');

        const cursos = await response.json();

        let cursoCards = '';
        if (cursos && cursos.length > 0) {
            cursoCards = cursos.map(curso => `
                <div class="card">
                    <h3>${curso.nombre}</h3>
                    <p><strong>Profesor:</strong> ${curso.profesor.nombre_completo}</p>
                    <p><strong>Horario:</strong> ${curso.horario}</p>
                    <a href="#" data-view="ver-curso-${curso.id}">Ver detalles y notas</a>
                </div>
            `).join('');
        } else {
            cursoCards = '<p>No estás inscrito en ningún curso actualmente.</p>';
        }

        return `
            <h2>Mis Cursos</h2>
            <div class="card-container">
                ${cursoCards}
            </div>
        `;
    } catch (error) {
        console.error('Error en getMisCursosView:', error);
        return `<h2>Mis Cursos</h2><p class="message-error">Error al cargar los datos: ${error.message}</p>`;
    }
}

async function getGamificacionView(token) {
    // Esta es una vista de marcador de posición para el módulo SIGA
    // En una implementación real, se conectarían a endpoints como /api/v1/gamification/rules o /api/v1/gamification/rankings
    return `
        <h2>Módulo de Gamificación (SIGA)</h2>
        <p>Este módulo gestionará el sistema de puntos, niveles, medallas y rankings para los alumnos.</p>

        <div class="tabs">
            <button class="tab-button active">Reglas y Puntos</button>
            <button class="tab-button">Rankings</button>
            <button class="tab-button">Medallas</button>
        </div>

        <div class="tab-content">
            <h3>Propuesta de Implementación:</h3>
            <ul>
                <li><strong>Reglas y Puntos:</strong> El Jefe de Área y el Profesional de Área podrían definir aquí las reglas. (Ej: 'Asistir a clase' = 5 puntos, 'Completar tarea' = 10 puntos).</li>
                <li><strong>Rankings:</strong> Mostraría una tabla con los alumnos con más puntos, filtrable por curso o disciplina.</li>
                <li><strong>Medallas:</strong> Un catálogo de medallas disponibles (Ej: 'Asistencia Perfecta', 'Mejor Compañero') que los profesores pueden asignar.</li>
            </ul>
            <p><strong>Estado actual:</strong> El módulo no está implementado. Esta es una propuesta visual y funcional. Se requiere desarrollo en backend y frontend.</p>
        </div>
    `;
}

async function getVerificarRolesView(token) {
    const rolesRequeridos = [
        'admin_general', 'admin_empresa', 'jefe_area', 'profesional_area',
        'tecnico_area', 'coordinador', 'profesor', 'alumno',
        'padre_acudiente', 'jefe_almacen', 'almacenista', 'jefe_escenarios'
    ];

    let rolesDesdeApi = [];
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText}`);
        }
        const apiResult = await response.json();
        // La API puede devolver una lista de objetos, extraemos solo los nombres
        rolesDesdeApi = apiResult.map(rol => rol.nombre);
    } catch (error) {
        return `<h2>Verificación de Roles en BD</h2>
                <p class="message-error">No se pudieron obtener los roles desde la API. Error: ${error.message}</p>
                <p>Endpoint probado: <code>${config.apiBaseUrl}/api/v1/roles</code></p>`;
    }

    const verificationResults = rolesRequeridos.map(rolRequerido => {
        const encontrado = rolesDesdeApi.includes(rolRequerido);
        return {
            nombre: rolRequerido,
            estado: encontrado ? 'Encontrado' : 'Faltante',
            className: encontrado ? 'status-ok' : 'status-error'
        };
    });

    const rowsHtml = verificationResults.map(res => `
        <tr>
            <td>${res.nombre}</td>
            <td><span class="${res.className}">${res.estado}</span></td>
        </tr>
    `).join('');

    return `
        <h2>Verificación de Roles en Base de Datos</h2>
        <p>Esta tabla compara los 12 roles oficiales requeridos con los roles encontrados en la base de datos a través de la API.</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Rol Requerido</th>
                    <th>Estado en BD</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

async function getCalendarioEscenariosView(token) {
    // Asumo un endpoint /api/v1/escenarios para obtener la lista de escenarios
    const response = await fetch(`${config.apiBaseUrl}/api/v1/escenarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo obtener la lista de escenarios.');

    const escenarios = await response.json();

    let escenarioRows = '';
    if (escenarios && escenarios.length > 0) {
        escenarioRows = escenarios.map(escenario => `
            <tr>
                <td>${escenario.id}</td>
                <td>${escenario.nombre}</td>
                <td>${escenario.tipo}</td>
                <td>${escenario.capacidad || 'N/A'}</td>
                <td><span class="status-${escenario.estado.toLowerCase()}">${escenario.estado}</span></td>
                <td>
                    <button>Ver Horario</button>
                    <button>Editar</button>
                </td>
            </tr>
        `).join('');
    } else {
        escenarioRows = '<tr><td colspan="6">No se encontraron escenarios.</td></tr>';
    }

    return `
        <h2>Calendario y Gestión de Escenarios</h2>
        <button>Añadir Nuevo Escenario</button>
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${escenarioRows}
            </tbody>
        </table>
    `;
}
