// --- Funciones para Renderizar Vistas Específicas ---

// Esta función actuará como un enrutador del lado del cliente
async function renderContentForView(viewName, token, roleName = 'default') {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // Limpiar el área de contenido anterior
    contentArea.innerHTML = '<h2>Cargando...</h2>';

    try {
        // Un gran switch para manejar todas las vistas
        switch (viewName) {
            // Vistas para admin_empresa
            case 'panel-empresa':
                await renderAdminEmpresaView(token);
                break;

            // Vistas para jefe_area
            case 'panel-area':
                await renderJefeAreaView(token);
                break;

            case 'dashboard':
                contentArea.innerHTML = await getDashboardView();
                break;
            case 'gestionar-usuarios':
                contentArea.innerHTML = await getGestionarUsuariosView(token);
                setupGestionarUsuariosListeners(token);
                break;
            case 'gestionar-áreas':
                contentArea.innerHTML = await getGestionarAreasView(token);
                setupGestionarAreasListeners(token);
                break;
            case 'reportes':
                contentArea.innerHTML = '<h2>Reportes</h2><p>Aquí se mostrarán los reportes de la empresa.</p>';
                break;

            // Vistas para jefe_area
            case 'eventos-y-salidas':
                contentArea.innerHTML = await getEventosSalidasView(token);
                break;

            // Vistas para profesor
            case 'gestionar-cursos':
                await renderProfesorView(token);
                break;

            case 'gamificación':
                // La vista de gamificación depende del rol del usuario
                if (roleName === 'alumno') {
                    contentArea.innerHTML = await getGamificacionAlumnoView(token);
                } else if (['jefe_area', 'profesional_area'].includes(roleName)) {
                    contentArea.innerHTML = await getGamificacionAdminView(token);
                    setupGamificacionAdminListeners(token);
                } else if (roleName === 'profesor') {
                    contentArea.innerHTML = await getGamificacionProfesorView(token);
                    setupGamificacionProfesorListeners(token);
                } else {
                    contentArea.innerHTML = '<h2>Gamificación</h2><p>La vista de gamificación no está configurada para tu rol.</p>';
                }
                break;

            // Vistas para profesor (duplicado, se puede unificar)
            // case 'gestionar-cursos':
            //     contentArea.innerHTML = await getGestionarCursosView(token);
            //     setupGestionarCursosListeners(token);
            //     break;
            case 'gestionar-alumnos':
                contentArea.innerHTML = await getGestionarAlumnosView(token);
                break;

            // Vistas para alumno
            case 'mis-cursos':
                await renderMisCursosView(token);
                break;
            case 'mi-horario':
                await renderMiHorarioView(token);
                break;
            case 'mis-calificaciones':
                await renderMisCalificacionesView(token);
                break;

            // Vistas para padre_acudiente
            case 'mis-alumnos':
                await renderPadreAcudienteView(token);
                break;

            // Vistas para coordinador
            case 'planificacion':
            case 'verificar-programacion':
            case 'aprobaciones':
            case 'enviar-reportes':
                await renderCoordinadorView(viewName, token);
                break;

            // Vistas para Roles de Soporte de Área (Profesional y Técnico)
            case 'supervisar-actividades': // solo profesional
            case 'gestionar-eventos': // ambos
            case 'gestionar-disciplinas': // solo profesional
            case 'ver-actividades': // solo tecnico
            case 'ver-disciplinas': // solo tecnico
                if (roleName === 'profesional_area') {
                    await renderProfesionalAreaView(viewName, token);
                } else if (roleName === 'tecnico_area') {
                    await renderTecnicoAreaView(viewName, token);
                }
                break;

            // Vistas para Roles de Logística (Almacén)
            case 'dashboard-inventario':
            case 'registrar-movimientos':
            case 'stock-y-reposicion':
            case 'hojas-de-vida':
            case 'reportes-de-inventario':
            case 'ver-inventario':
                if (roleName === 'jefe_almacen') {
                    await renderJefeAlmacenView(viewName, token);
                } else if (roleName === 'almacenista') {
                    await renderAlmacenistaView(viewName, token);
                }
                break;

            // Vistas para jefe_escenarios
            case 'calendario-de-escenarios':
            case 'asignar-espacios':
            case 'mantenimiento':
                await renderJefeEscenariosView(viewName, token);
                break;

            // Vistas para admin_general
            case 'verificar-roles-bd':
                contentArea.innerHTML = await getVerificarRolesView(token);
                setupVerificarRolesListeners(token);
                break;
            case 'auditoría-general': // STAR
                contentArea.innerHTML = await getAuditoriaView(token);
                break;

            // Vistas genéricas
            case 'asistente-de-ia': // Agente de IA
                contentArea.innerHTML = await getAsistenteIAView();
                break;

            default:
                contentArea.innerHTML = `<h2>Vista no encontrada: ${viewName}</h2><p>La vista solicitada no existe o no está configurada.</p>`;
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
                    <button class="btn-editar-usuario" data-user-id="${user.id}">Editar</button>
                    <button class="btn-eliminar-usuario" data-user-id="${user.id}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } else {
        userRows = '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
    }

    return `
        <h2>Gestionar Usuarios de la Empresa</h2>
        <button id="btn-anadir-usuario">Añadir Nuevo Usuario</button>
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

// --- Propuestas de Integración para Módulos Faltantes ---

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
            encontrado: encontrado,
            estado: encontrado ? '✅ Encontrado' : '❌ Faltante',
            className: encontrado ? 'status-ok' : 'status-error'
        };
    });

    const rowsHtml = verificationResults.map(res => `
        <tr>
            <td>${res.nombre}</td>
            <td><span class="${res.className}">${res.estado}</span></td>
            <td>
                ${!res.encontrado ? `<button class="btn-primary btn-crear-rol" data-rol-nombre="${res.nombre}">Crear Rol</button>` : ''}
            </td>
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
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

async function getAuditoriaView(token) {
    // Propuesta para el módulo STAR (Auditoría de Logs)
    let logsHtml;
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/audit-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("El endpoint de auditoría no está disponible.");

        const logs = await response.json();
        logsHtml = logs.map(log => `
            <tr>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.user.username}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            </tr>
        `).join('');

    } catch (error) {
        // Mock data en caso de que la API falle (que lo hará, porque no existe)
        logsHtml = `
            <tr>
                <td>${new Date().toLocaleString()}</td>
                <td>admin_empresa_1</td>
                <td>UPDATE_USER</td>
                <td>Se actualizó el rol del usuario 'profesor_2' a 'coordinador'.</td>
            </tr>
            <tr>
                <td>${new Date().toLocaleString()}</td>
                <td>jefe_area_cultura</td>
                <td>CREATE_EVENT</td>
                <td>Se creó el evento 'Festival de Teatro'.</td>
            </tr>
        `;
    }

    return `
        <h2><i class="fas fa-history"></i> Visor de Auditoría (STAR)</h2>
        <p>Esta es una propuesta de integración para el módulo de auditoría. Los datos mostrados son de ejemplo.</p>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Detalles</th>
                </tr>
            </thead>
            <tbody>
                ${logsHtml}
            </tbody>
        </table>
    `;
}

async function getAsistenteIAView() {
    // Propuesta para el módulo de Agente de IA (LangChain)
    return `
        <h2><i class="fas fa-robot"></i> Asistente de IA</h2>
        <p>Propuesta de integración para un agente de IA conversacional. La lógica de backend se conectaría a un servicio como LangChain.</p>
        <div class="chat-container">
            <div class="chat-box" id="ai-chat-box">
                <div class="chat-message bot">
                    <p>Hola, soy el asistente virtual de SGA-CD. ¿Cómo puedo ayudarte hoy?</p>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="ai-chat-input" placeholder="Escribe tu pregunta...">
                <button id="ai-chat-send">Enviar</button>
            </div>
        </div>
    `;
}

function setupVerificarRolesListeners(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-crear-rol')) {
            const rolNombre = e.target.dataset.rolNombre;

            const modalBodyContent = `
                <form id="crear-rol-form">
                    <p>Estás a punto de crear el rol que falta:</p>
                    <input type="text" id="rol-nombre-input" value="${rolNombre}" readonly>
                    <textarea id="rol-descripcion-input" placeholder="Añade una descripción para el rol..." required></textarea>
                    <button type="submit">Confirmar Creación</button>
                </form>
                <div id="modal-feedback"></div>
            `;

            openModal(`Crear Rol: ${rolNombre}`, modalBodyContent);

            const form = document.getElementById('crear-rol-form');
            form.addEventListener('submit', async (submitEvent) => {
                submitEvent.preventDefault();
                const feedbackDiv = document.getElementById('modal-feedback');
                feedbackDiv.textContent = 'Creando rol...';

                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nombre: rolNombre,
                            descripcion: document.getElementById('rol-descripcion-input').value
                        })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        feedbackDiv.className = 'message-success';
                        feedbackDiv.textContent = '¡Rol creado exitosamente! La vista se refrescará.';
                        setTimeout(() => {
                            closeModal();
                            renderContentForView('verificar-roles-bd', token);
                        }, 2000);
                    } else {
                        throw new Error(result.detail || 'Error desconocido del servidor');
                    }
                } catch (error) {
                    feedbackDiv.className = 'message-error';
                    feedbackDiv.textContent = `Error: ${error.message}`;
                }
            });
        }
    });
}

function setupMisCursosListeners(token) {
    const contentArea = document.getElementById('content-area');

    contentArea.addEventListener('click', async (e) => {
        if (e.target.id === 'btn-inscribirse-curso') {
            try {
                const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('No se pudo obtener la lista de cursos disponibles.');
                const cursosDisponibles = await response.json();

                let cursosHtml = 'No hay cursos disponibles para inscripción.';
                if (cursosDisponibles && cursosDisponibles.length > 0) {
                    cursosHtml = cursosDisponibles.map(curso => `
                        <div class="curso-disponible">
                            <h4>${curso.nombre}</h4>
                            <p>${curso.descripcion}</p>
                            <button class="btn-inscribir" data-curso-id="${curso.id}">Inscribirme</button>
                        </div>
                    `).join('');
                }

                const modalBodyContent = `
                    <div id="lista-cursos-disponibles">
                        ${cursosHtml}
                    </div>
                    <div id="modal-feedback"></div>
                `;
                openModal('Inscribirse a un Nuevo Curso', modalBodyContent);

            } catch (error) {
                openModal('Error', `<p class="message-error">${error.message}</p>`);
            }
        }

        if (e.target.classList.contains('btn-inscribir')) {
            const cursoId = e.target.dataset.cursoId;
            const feedbackDiv = document.querySelector('#lista-cursos-disponibles').nextElementSibling;
            feedbackDiv.textContent = 'Inscribiendo...';

            try {
                const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos/${cursoId}/inscribir`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'No se pudo completar la inscripción.');
                }
                feedbackDiv.className = 'message-success';
                feedbackDiv.textContent = '¡Inscripción exitosa!';
                setTimeout(() => {
                    closeModal();
                    renderContentForView('mis-cursos', token);
                }, 1500);
            } catch (error) {
                feedbackDiv.className = 'message-error';
                feedbackDiv.textContent = `Error: ${error.message}`;
            }
        }
    });
}

// All obsolete functions have been removed. The remaining functions are above.
