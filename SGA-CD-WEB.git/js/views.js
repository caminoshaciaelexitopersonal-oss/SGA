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
            case 'gamificación':
                // Esta vista es diferente para un alumno que para un admin/jefe
                if (roleName === 'alumno') {
                    contentArea.innerHTML = await getGamificacionAlumnoView(token);
                } else {
                    contentArea.innerHTML = await getGamificacionView(token);
                }
                break;

            // Vistas para profesor
            case 'gestionar-cursos':
                contentArea.innerHTML = await getGestionarCursosView(token);
                setupGestionarCursosListeners(token);
                break;
            case 'gestionar-alumnos':
                contentArea.innerHTML = await getGestionarAlumnosView(token);
                break;

            // Vistas para alumno
            case 'mis-cursos':
                contentArea.innerHTML = await getMisCursosView(token);
                setupMisCursosListeners(token);
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
                setupVerificarRolesListeners(token); // Añadir listeners específicos para esta vista
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
                            renderContentForView('verificar-roles-bd', token); // Recargar la vista
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

// --- Funciones para CRUD de Cursos ---

async function getGestionarCursosView(token) {
    // Asumo un endpoint que devuelve los cursos creados por el profesor actual
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/profesor/cursos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de cursos.');
        const cursos = await response.json();

        let cursoRows = '';
        if (cursos && cursos.length > 0) {
            cursoRows = cursos.map(curso => `
                <tr>
                    <td>${curso.id}</td>
                    <td>${curso.nombre}</td>
                    <td>${curso.descripcion}</td>
                    <td>${curso.alumnos_inscritos || 0}</td>
                    <td>
                        <button class="btn-editar-curso" data-curso-id="${curso.id}">Editar</button>
                        <button class="btn-eliminar-curso" data-curso-id="${curso.id}">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        } else {
            cursoRows = '<tr><td colspan="5">No has creado ningún curso todavía.</td></tr>';
        }

        return `
            <h2>Gestionar Mis Cursos</h2>
            <button id="btn-crear-curso">Crear Nuevo Curso</button>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre del Curso</th>
                        <th>Descripción</th>
                        <th>Inscritos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${cursoRows}
                </tbody>
            </table>
        `;
    } catch (error) {
        return `<h2>Gestionar Mis Cursos</h2><p class="message-error">Error al cargar los cursos: ${error.message}</p>`;
    }
}

function setupGestionarCursosListeners(token) {
    const contentArea = document.getElementById('content-area');

    contentArea.addEventListener('click', async (e) => {
        // --- Crear Curso ---
        if (e.target.id === 'btn-crear-curso') {
            const modalBodyContent = `
                <form id="crear-curso-form">
                    <input type="text" id="curso-nombre-input" placeholder="Nombre del curso" required>
                    <textarea id="curso-descripcion-input" placeholder="Descripción del curso" required></textarea>
                    <button type="submit">Crear Curso</button>
                </form>
                <div id="modal-feedback"></div>
            `;
            openModal('Crear Nuevo Curso', modalBodyContent);

            document.getElementById('crear-curso-form').addEventListener('submit', async (submitEvent) => {
                submitEvent.preventDefault();
                const feedbackDiv = document.getElementById('modal-feedback');
                feedbackDiv.textContent = 'Creando curso...';

                const newCurso = {
                    nombre: document.getElementById('curso-nombre-input').value,
                    descripcion: document.getElementById('curso-descripcion-input').value,
                };

                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(newCurso)
                    });
                    const result = await response.json();
                    if (response.ok) {
                        feedbackDiv.className = 'message-success';
                        feedbackDiv.textContent = '¡Curso creado exitosamente!';
                        setTimeout(() => {
                            closeModal();
                            renderContentForView('gestionar-cursos', token);
                        }, 1500);
                    } else {
                        throw new Error(result.detail || 'Error desconocido');
                    }
                } catch (error) {
                    feedbackDiv.className = 'message-error';
                    feedbackDiv.textContent = `Error: ${error.message}`;
                }
            });
        }

        // --- Editar Curso ---
        if (e.target.classList.contains('btn-editar-curso')) {
            const cursoId = e.target.dataset.cursoId;
            try {
                const cursoResponse = await fetch(`${config.apiBaseUrl}/api/v1/cursos/${cursoId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!cursoResponse.ok) throw new Error('No se pudo obtener la info del curso.');
                const cursoData = await cursoResponse.json();

                const modalBodyContent = `
                    <form id="editar-curso-form">
                        <input type="text" id="curso-nombre-input" value="${cursoData.nombre}" required>
                        <textarea id="curso-descripcion-input" required>${cursoData.descripcion}</textarea>
                        <button type="submit">Actualizar Curso</button>
                    </form>
                    <div id="modal-feedback"></div>
                `;
                openModal(`Editar Curso: ${cursoData.nombre}`, modalBodyContent);

                document.getElementById('editar-curso-form').addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    // Lógica PUT aquí...
                    const feedbackDiv = document.getElementById('modal-feedback');
                    feedbackDiv.textContent = 'Actualizando...';
                    const updatedCurso = {
                        nombre: document.getElementById('curso-nombre-input').value,
                        descripcion: document.getElementById('curso-descripcion-input').value
                    };
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos/${cursoId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(updatedCurso)
                    });
                    if (!response.ok) throw new Error('Falló la actualización');
                    feedbackDiv.className = 'message-success';
                    feedbackDiv.textContent = '¡Curso actualizado!';
                    setTimeout(() => { closeModal(); renderContentForView('gestionar-cursos', token); }, 1500);
                });
            } catch (error) {
                openModal('Error', `<p class="message-error">${error.message}</p>`);
            }
        }

        // --- Eliminar Curso ---
        if (e.target.classList.contains('btn-eliminar-curso')) {
            const cursoId = e.target.dataset.cursoId;
            openModal('Confirmar Eliminación', `
                <p>¿Seguro que quieres eliminar este curso?</p>
                <button id="confirm-delete-btn" class="btn-danger">Sí, Eliminar</p>
                <div id="modal-feedback"></div>
            `);
            document.getElementById('confirm-delete-btn').onclick = async () => {
                // Lógica DELETE aquí...
                const feedbackDiv = document.getElementById('modal-feedback');
                feedbackDiv.textContent = 'Eliminando...';
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos/${cursoId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('Falló la eliminación');
                     feedbackDiv.className = 'message-success';
                    feedbackDiv.textContent = '¡Curso eliminado!';
                    setTimeout(() => { closeModal(); renderContentForView('gestionar-cursos', token); }, 1500);
                } catch (error) {
                    feedbackDiv.className = 'message-error';
                    feedbackDiv.textContent = `Error: ${error.message}`;
                }
            };
        }
    });
}

// --- Funciones para CRUD de Áreas ---

async function fetchJefesDeArea(token) {
    // Asumo un endpoint que devuelve usuarios filtrados por el rol 'jefe_area'
    const response = await fetch(`${config.apiBaseUrl}/api/v1/users?rol=jefe_area`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo obtener la lista de jefes de área.');
    return await response.json();
}

function setupGestionarAreasListeners(token) {
    const contentArea = document.getElementById('content-area');

    contentArea.addEventListener('click', async (e) => {
        // --- Crear Área ---
        if (e.target.id === 'btn-crear-area') {
            try {
                const jefes = await fetchJefesDeArea(token);
                const jefesOptions = jefes.map(jefe => `<option value="${jefe.id}">${jefe.nombre_completo}</option>`).join('');

                const modalBodyContent = `
                    <form id="crear-area-form">
                        <input type="text" id="area-nombre-input" placeholder="Nombre del área" required>
                        <textarea id="area-descripcion-input" placeholder="Descripción del área" required></textarea>
                        <select id="area-jefe-select">
                            <option value="">Seleccionar jefe de área (opcional)...</option>
                            ${jefesOptions}
                        </select>
                        <button type="submit">Crear Área</button>
                    </form>
                    <div id="modal-feedback"></div>
                `;
                openModal('Crear Nueva Área', modalBodyContent);

                document.getElementById('crear-area-form').addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    const feedbackDiv = document.getElementById('modal-feedback');
                    feedbackDiv.textContent = 'Creando área...';

                    const newArea = {
                        nombre: document.getElementById('area-nombre-input').value,
                        descripcion: document.getElementById('area-descripcion-input').value,
                        jefe_area_id: parseInt(document.getElementById('area-jefe-select').value) || null
                    };

                    try {
                        const response = await fetch(`${config.apiBaseUrl}/api/v1/areas`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify(newArea)
                        });
                        const result = await response.json();
                        if (response.ok) {
                            feedbackDiv.className = 'message-success';
                            feedbackDiv.textContent = '¡Área creada exitosamente!';
                            setTimeout(() => {
                                closeModal();
                                renderContentForView('gestionar-áreas', token);
                            }, 1500);
                        } else {
                            throw new Error(result.detail || 'Error desconocido');
                        }
                    } catch (error) {
                        feedbackDiv.className = 'message-error';
                        feedbackDiv.textContent = `Error: ${error.message}`;
                    }
                });
            } catch (error) {
                openModal('Error', `<p class="message-error">${error.message}</p>`);
            }
        }

        // --- Editar Área ---
        if (e.target.classList.contains('btn-editar-area')) {
            const areaId = e.target.dataset.areaId;
            try {
                const areaResponse = await fetch(`${config.apiBaseUrl}/api/v1/areas/${areaId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!areaResponse.ok) throw new Error('No se pudo obtener la información del área.');
                const areaData = await areaResponse.json();

                const jefes = await fetchJefesDeArea(token);
                const jefesOptions = jefes.map(jefe =>
                    `<option value="${jefe.id}" ${areaData.jefe_area_id === jefe.id ? 'selected' : ''}>${jefe.nombre_completo}</option>`
                ).join('');

                const modalBodyContent = `
                    <form id="editar-area-form">
                        <input type="text" id="area-nombre-input" value="${areaData.nombre}" required>
                        <textarea id="area-descripcion-input" required>${areaData.descripcion}</textarea>
                        <select id="area-jefe-select">
                            <option value="">Seleccionar jefe de área (opcional)...</option>
                            ${jefesOptions}
                        </select>
                        <button type="submit">Actualizar Área</button>
                    </form>
                    <div id="modal-feedback"></div>
                `;
                openModal(`Editar Área: ${areaData.nombre}`, modalBodyContent);

                document.getElementById('editar-area-form').addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    const feedbackDiv = document.getElementById('modal-feedback');
                    feedbackDiv.textContent = 'Actualizando área...';

                    const updatedArea = {
                        nombre: document.getElementById('area-nombre-input').value,
                        descripcion: document.getElementById('area-descripcion-input').value,
                        jefe_area_id: parseInt(document.getElementById('area-jefe-select').value) || null
                    };

                    try {
                        const response = await fetch(`${config.apiBaseUrl}/api/v1/areas/${areaId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify(updatedArea)
                        });
                        const result = await response.json();
                        if (response.ok) {
                            feedbackDiv.className = 'message-success';
                            feedbackDiv.textContent = '¡Área actualizada exitosamente!';
                            setTimeout(() => {
                                closeModal();
                                renderContentForView('gestionar-áreas', token);
                            }, 1500);
                        } else {
                            throw new Error(result.detail || 'Error desconocido');
                        }
                    } catch (error) {
                        feedbackDiv.className = 'message-error';
                        feedbackDiv.textContent = `Error: ${error.message}`;
                    }
                });
            } catch (error) {
                openModal('Error', `<p class="message-error">${error.message}</p>`);
            }
        }

        // --- Eliminar Área ---
        if (e.target.classList.contains('btn-eliminar-area')) {
            const areaId = e.target.dataset.areaId;

            const modalBodyContent = `
                <p>¿Estás seguro de que quieres eliminar esta área? Esta acción no se puede deshacer.</p>
                <div id="modal-feedback"></div>
                <button id="confirm-delete-btn" class="btn-danger">Sí, Eliminar</button>
                <button id="cancel-delete-btn">Cancelar</button>
            `;
            openModal('Confirmar Eliminación de Área', modalBodyContent);

            document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
                const feedbackDiv = document.getElementById('modal-feedback');
                feedbackDiv.textContent = 'Eliminando área...';

                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/areas/${areaId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        feedbackDiv.className = 'message-success';
                        feedbackDiv.textContent = '¡Área eliminada exitosamente!';
                        setTimeout(() => {
                            closeModal();
                            renderContentForView('gestionar-áreas', token);
                        }, 1500);
                    } else {
                        const result = await response.json();
                        throw new Error(result.detail || 'Error desconocido');
                    }
                } catch (error) {
                    feedbackDiv.className = 'message-error';
                    feedbackDiv.textContent = `Error: ${error.message}`;
                }
            });

            document.getElementById('cancel-delete-btn').addEventListener('click', () => {
                closeModal();
            });
        }
    });
}

// --- Funciones para CRUD de Usuarios ---

async function fetchRoles(token) {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo obtener la lista de roles.');
    return await response.json();
}

function setupGestionarUsuariosListeners(token) {
    const contentArea = document.getElementById('content-area');

    contentArea.addEventListener('click', async (e) => {
        // --- Crear Usuario ---
        if (e.target.id === 'btn-anadir-usuario') {
            try {
                const roles = await fetchRoles(token);
                const rolesOptions = roles.map(rol => `<option value="${rol.id}">${rol.nombre}</option>`).join('');

                const modalBodyContent = `
                    <form id="crear-usuario-form">
                        <input type="text" id="usuario-nombre-input" placeholder="Nombre completo" required>
                        <input type="email" id="usuario-email-input" placeholder="Email" required>
                        <input type="password" id="usuario-password-input" placeholder="Contraseña" required>
                        <select id="usuario-rol-select" required>
                            <option value="">Seleccionar rol...</option>
                            ${rolesOptions}
                        </select>
                        <button type="submit">Crear Usuario</button>
                    </form>
                    <div id="modal-feedback"></div>
                `;
                openModal('Añadir Nuevo Usuario', modalBodyContent);

                // Listener para el formulario de creación
                const form = document.getElementById('crear-usuario-form');
                form.addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    const feedbackDiv = document.getElementById('modal-feedback');
                    feedbackDiv.textContent = 'Creando usuario...';

                    const newUser = {
                        nombre_completo: document.getElementById('usuario-nombre-input').value,
                        email: document.getElementById('usuario-email-input').value,
                        password: document.getElementById('usuario-password-input').value,
                        rol_id: parseInt(document.getElementById('usuario-rol-select').value)
                    };

                    try {
                        const response = await fetch(`${config.apiBaseUrl}/api/v1/users`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(newUser)
                        });

                        const result = await response.json();

                        if (response.ok) {
                            feedbackDiv.className = 'message-success';
                            feedbackDiv.textContent = '¡Usuario creado exitosamente! La vista se refrescará.';
                            setTimeout(() => {
                                closeModal();
                                renderContentForView('gestionar-usuarios', token);
                            }, 2000);
                        } else {
                            throw new Error(result.detail || 'Error desconocido del servidor');
                        }
                    } catch (error) {
                        feedbackDiv.className = 'message-error';
                        feedbackDiv.textContent = `Error: ${error.message}`;
                    }
                });

            } catch (error) {
                openModal('Error', `<p class="message-error">${error.message}</p>`);
            }
        }

        // --- Editar Usuario ---
        if (e.target.classList.contains('btn-editar-usuario')) {
            const userId = e.target.dataset.userId;
            try {
                // 1. Fetch current user data
                const userResponse = await fetch(`${config.apiBaseUrl}/api/v1/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!userResponse.ok) throw new Error('No se pudo obtener la información del usuario.');
                const userData = await userResponse.json();

                // 2. Fetch all roles for the dropdown
                const roles = await fetchRoles(token);
                const rolesOptions = roles.map(rol =>
                    `<option value="${rol.id}" ${rol.id === userData.rol.id ? 'selected' : ''}>${rol.nombre}</option>`
                ).join('');

                // 3. Open modal with pre-filled form
                const modalBodyContent = `
                    <form id="editar-usuario-form">
                        <input type="text" id="usuario-nombre-input" value="${userData.nombre_completo}" required>
                        <input type="email" id="usuario-email-input" value="${userData.email}" required>
                        <input type="password" id="usuario-password-input" placeholder="Dejar en blanco para no cambiar la contraseña">
                        <select id="usuario-rol-select" required>${rolesOptions}</select>
                        <button type="submit">Actualizar Usuario</button>
                    </form>
                    <div id="modal-feedback"></div>
                `;
                openModal(`Editar Usuario: ${userData.nombre_completo}`, modalBodyContent);

                // 4. Listener for the edit form submission
                const form = document.getElementById('editar-usuario-form');
                form.addEventListener('submit', async (submitEvent) => {
                    submitEvent.preventDefault();
                    const feedbackDiv = document.getElementById('modal-feedback');
                    feedbackDiv.textContent = 'Actualizando usuario...';

                    const updatedUserData = {
                        nombre_completo: document.getElementById('usuario-nombre-input').value,
                        email: document.getElementById('usuario-email-input').value,
                        rol_id: parseInt(document.getElementById('usuario-rol-select').value)
                    };

                    const password = document.getElementById('usuario-password-input').value;
                    if (password) {
                        updatedUserData.password = password;
                    }

                    try {
                        const response = await fetch(`${config.apiBaseUrl}/api/v1/users/${userId}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(updatedUserData)
                        });
                        const result = await response.json();
                        if (response.ok) {
                            feedbackDiv.className = 'message-success';
                            feedbackDiv.textContent = '¡Usuario actualizado exitosamente!';
                            setTimeout(() => {
                                closeModal();
                                renderContentForView('gestionar-usuarios', token);
                            }, 1500);
                        } else {
                            throw new Error(result.detail || 'Error desconocido');
                        }
                    } catch (error) {
                        feedbackDiv.className = 'message-error';
                        feedbackDiv.textContent = `Error: ${error.message}`;
                    }
                });

            } catch (error) {
                openModal('Error', `<p class="message-error">${error.message}</p>`);
            }
        }

        // --- Eliminar Usuario ---
        if (e.target.classList.contains('btn-eliminar-usuario')) {
            const userId = e.target.dataset.userId;

            const modalBodyContent = `
                <p>¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.</p>
                <div id="modal-feedback"></div>
                <button id="confirm-delete-btn" class="btn-danger">Sí, Eliminar</button>
                <button id="cancel-delete-btn">Cancelar</button>
            `;
            openModal('Confirmar Eliminación', modalBodyContent);

            document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
                const feedbackDiv = document.getElementById('modal-feedback');
                feedbackDiv.textContent = 'Eliminando usuario...';

                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/users/${userId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        feedbackDiv.className = 'message-success';
                        feedbackDiv.textContent = '¡Usuario eliminado exitosamente!';
                        setTimeout(() => {
                            closeModal();
                            renderContentForView('gestionar-usuarios', token);
                        }, 1500);
                    } else {
                        const result = await response.json();
                        throw new Error(result.detail || 'Error desconocido');
                    }
                } catch (error) {
                    feedbackDiv.className = 'message-error';
                    feedbackDiv.textContent = `Error: ${error.message}`;
                }
            });

            document.getElementById('cancel-delete-btn').addEventListener('click', () => {
                closeModal();
            });
        }
    });
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
                        <button class="btn-editar-area" data-area-id="${area.id}">Editar</button>
                        <button class="btn-eliminar-area" data-area-id="${area.id}">Eliminar</button>
                    </td>
                </tr>
            `).join('');
        } else {
            areaRows = '<tr><td colspan="5">No se encontraron áreas.</td></tr>';
        }

        return `
            <h2>Gestionar Áreas de la Empresa</h2>
            <button id="btn-crear-area">Crear Nueva Área</button>
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
            <div class="view-header">
                <h2>Mis Cursos</h2>
                <button id="btn-inscribirse-curso">Inscribirse a Cursos</button>
            </div>
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

async function getGamificacionAlumnoView(token) {
    try {
        // Asumo dos endpoints: uno para las estadísticas personales y otro para el ranking general
        const [statsRes, rankingRes] = await Promise.all([
            fetch(`${config.apiBaseUrl}/api/v1/gamification/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${config.apiBaseUrl}/api/v1/gamification/ranking`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!statsRes.ok) throw new Error('No se pudieron cargar tus estadísticas.');
        if (!rankingRes.ok) throw new Error('No se pudo cargar el ranking.');

        const stats = await statsRes.json();
        const ranking = await rankingRes.json();

        // Renderizar medallas
        let medallasHtml = '<li>Aún no has ganado medallas. ¡Sigue esforzándote!</li>';
        if (stats.medallas && stats.medallas.length > 0) {
            medallasHtml = stats.medallas.map(m => `<li><i class="fas fa-medal"></i> ${m.nombre} - <span>${m.descripcion}</span></li>`).join('');
        }

        // Renderizar ranking
        let rankingHtml = '<tr><td colspan="3">No hay datos de ranking disponibles.</td></tr>';
        if (ranking && ranking.length > 0) {
            rankingHtml = ranking.map((r, index) => `
                <tr>
                    <td>#${index + 1}</td>
                    <td>${r.nombre_completo}</td>
                    <td>${r.puntos}</td>
                </tr>
            `).join('');
        }

        return `
            <h2><i class="fas fa-trophy"></i> Mi Progreso de Gamificación</h2>
            <div class="gamificacion-alumno">
                <div class="stats-card">
                    <h3>Puntaje Total</h3>
                    <p class="puntaje">${stats.puntos_totales || 0}</p>
                </div>
                <div class="stats-card">
                    <h3>Mis Medallas</h3>
                    <ul class="lista-medallas">${medallasHtml}</ul>
                </div>
                <div class="stats-card ranking">
                    <h3><i class="fas fa-list-ol"></i> Ranking General (Top 10)</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Puesto</th>
                                <th>Alumno</th>
                                <th>Puntos</th>
                            </tr>
                        </thead>
                        <tbody>${rankingHtml}</tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        return `<h2>Gamificación</h2><p class="message-error">Error al cargar tu progreso: ${error.message}</p>`;
    }
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
                ${!res.encontrado ? `<button class="btn-crear-rol" data-rol-nombre="${res.nombre}">Crear Rol</button>` : ''}
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
