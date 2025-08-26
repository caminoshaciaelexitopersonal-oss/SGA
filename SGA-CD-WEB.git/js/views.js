// --- Funciones para Renderizar Vistas Específicas ---

// Esta función actuará como un enrutador del lado del cliente
async function renderContentForView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // Limpiar el área de contenido anterior
    contentArea.innerHTML = `<h2>${i18n.t('app_loading')}</h2>`;

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
                contentArea.innerHTML = '<h2>Gestionar Áreas</h2><p>Aquí se mostrará la gestión de áreas de la empresa.</p>';
                break;
            case 'reportes':
                contentArea.innerHTML = '<h2>Reportes</h2><p>Aquí se mostrarán los reportes de la empresa.</p>';
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

            // Vistas para jefe_area (Módulo Académico)
            case 'disciplinas/modalidades':
                contentArea.innerHTML = await getGestionarDisciplinasView(token);
                break;

            // Vista de Gamificación
            case 'gamificación':
                contentArea.innerHTML = await getGamificacionView(token);
                break;

            // Añadir más casos para otras vistas y roles aquí...

            default:
                contentArea.innerHTML = `<h2>${i18n.t('app_view_not_found')}</h2><p>${i18n.t('app_view_not_found_text')}</p>`;
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
            <tr data-user-id="${user.id}">
                <td>${user.id}</td>
                <td>${user.nombre_completo || user.username}</td>
                <td>${user.email}</td>
                <td>${user.rol.nombre}</td>
                <td>
                    <button class="edit-btn">${i18n.t('users_edit')}</button>
                    <button class="delete-btn">${i18n.t('users_delete')}</button>
                </td>
            </tr>
        `).join('');
    } else {
        userRows = '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
    }

    // Attach event listeners after rendering
    setTimeout(() => attachUserViewListeners(token), 0);

    return `
        <h2 data-i18n="users_manage_title">${i18n.t('users_manage_title')}</h2>
        <button class="add-user-btn" data-i18n="users_add_new">${i18n.t('users_add_new')}</button>
        <table class="data-table">
            <thead>
                <tr>
                    <th data-i18n="users_table_id">${i18n.t('users_table_id')}</th>
                    <th data-i18n="users_table_name">${i18n.t('users_table_name')}</th>
                    <th data-i18n="users_table_email">${i18n.t('users_table_email')}</th>
                    <th data-i18n="users_table_role">${i18n.t('users_table_role')}</th>
                    <th data-i18n="users_table_actions">${i18n.t('users_table_actions')}</th>
                </tr>
            </thead>
            <tbody id="user-table-body">
                ${userRows}
            </tbody>
        </table>
    `;
}

function attachUserViewListeners(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.addEventListener('click', e => {
        const userId = e.target.closest('tr')?.dataset.userId;

        if (e.target.classList.contains('delete-btn')) {
            handleDeleteUser(userId, token);
        }
        if (e.target.classList.contains('edit-btn')) {
            openUserModal(userId, token);
        }
        if (e.target.classList.contains('add-user-btn')) {
            openUserModal(null, token); // No user ID means we are creating
        }
    });
}

async function handleDeleteUser(userId, token) {
    if (!confirm(i18n.t('users_delete_confirm', { userId }))) {
        return;
    }
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar el usuario.');

        // Refresh the view
        renderContentForView('gestionar-usuarios', token);
    } catch (error) {
        alert(error.message);
    }
}

async function openUserModal(userId, token) {
    let userData = {};
    let isEditing = userId !== null;

    try {
        // Fetch user data if editing
        if (isEditing) {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudieron obtener los datos del usuario.');
            userData = await response.json();
        }

        // Fetch available roles for the dropdown
        const rolesResponse = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!rolesResponse.ok) throw new Error('No se pudieron obtener los roles.');
        const roles = await rolesResponse.json();
        const rolesOptions = roles.map(role =>
            `<option value="${role.id}" ${userData.rol_id === role.id ? 'selected' : ''}>${role.nombre}</option>`
        ).join('');

        // Create modal HTML
        const modalHtml = `
            <div class="modal-backdrop" id="user-modal">
                <div class="modal-content">
                    <button class="modal-close-btn">&times;</button>
                    <h2>${isEditing ? i18n.t('users_modal_edit_title') : i18n.t('users_modal_add_title')}</h2>
                    <form id="user-form">
                        <input type="hidden" name="id" value="${userData.id || ''}">
                        <input type="text" name="nombre_completo" placeholder="${i18n.t('users_form_fullname')}" value="${userData.nombre_completo || ''}" required>
                        <input type="email" name="email" placeholder="${i18n.t('users_table_email')}" value="${userData.email || ''}" required>
                        <input type="text" name="username" placeholder="${i18n.t('login_username_placeholder')}" value="${userData.username || ''}" required>
                        <input type="password" name="password" placeholder="${isEditing ? i18n.t('users_form_password_edit') : i18n.t('users_form_password_new')}" ${!isEditing ? 'required' : ''}>
                        <select name="rol_id" required>
                            <option value="">${i18n.t('users_form_select_role')}</option>
                            ${rolesOptions}
                        </select>
                        <button type="submit">${isEditing ? i18n.t('users_form_update_button') : i18n.t('users_form_create_button')}</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Add event listeners for the modal
        const modal = document.getElementById('user-modal');
        modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
        modal.querySelector('#user-form').addEventListener('submit', e => {
            e.preventDefault();
            handleUserFormSubmit(e.target, token);
        });

    } catch (error) {
        alert(`Error al abrir el modal: ${error.message}`);
    }
}

async function handleUserFormSubmit(form, token) {
    const formData = new FormData(form);
    const userId = formData.get('id');
    const isEditing = !!userId;

    const data = Object.fromEntries(formData.entries());
    // Do not send empty password on edit
    if (isEditing && !data.password) {
        delete data.password;
    }

    const url = isEditing
        ? `${config.apiBaseUrl}/api/v1/users/${userId}`
        : `${config.apiBaseUrl}/api/v1/users`;

    try {
        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Ocurrió un error.');
        }

        document.getElementById('user-modal').remove();
        renderContentForView('gestionar-usuarios', token);

    } catch (error) {
        alert(`Error al guardar: ${error.message}`);
    }
}

// Aquí se agregarán más funciones para cada vista...
// ej. getGestionarEventosView, getMisCursosView, etc.

async function getGamificacionView(token) {
    try {
        // Fetch all gamification data concurrently
        const [profileRes, medallasRes, rankingRes] = await Promise.all([
            fetch(`${config.apiBaseUrl}/api/v1/gamification/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${config.apiBaseUrl}/api/v1/gamification/medallas`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${config.apiBaseUrl}/api/v1/gamification/ranking`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!profileRes.ok || !medallasRes.ok || !rankingRes.ok) {
            throw new Error('No se pudieron cargar todos los datos de gamificación.');
        }

        const profile = await profileRes.json();
        const medallas = await medallasRes.json();
        const ranking = await rankingRes.json();

        // --- Render Profile Section ---
        const profileHtml = `
            <div class="gamification-profile-card">
                <h3>${profile.nombre_usuario}</h3>
                <p>${i18n.t('gamification_level')} ${profile.nivel}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${profile.progreso_porcentaje}%;"></div>
                </div>
                <p>${profile.puntos} / ${profile.puntos_siguiente_nivel} ${i18n.t('gamification_points')}</p>
                <p>${i18n.t('gamification_rank')}: #${profile.rango}</p>
            </div>
        `;

        // --- Render Medals Section ---
        const medallasHtml = medallas.map(medalla => `
            <div class="medalla-card ${medalla.obtenida ? 'obtenida' : ''}" title="${medalla.descripcion}">
                <i class="fas ${medalla.icono} fa-3x"></i>
                <span>${medalla.nombre}</span>
            </div>
        `).join('');

        // --- Render Ranking Section ---
        const rankingHtml = ranking.map((user, index) => `
            <li>
                <span class="rank">#${index + 1}</span>
                <span class="name">${user.nombre_usuario}</span>
                <span class="points">${user.puntos} Pts</span>
            </li>
        `).join('');

        return `
            <h2><i class="fas fa-gamepad"></i> ${i18n.t('gamification_title')}</h2>
            <div class="gamification-grid">
                <div class="main-profile-section">
                    ${profileHtml}
                </div>
                <div class="medallas-section">
                    <h3>${i18n.t('gamification_my_medals')}</h3>
                    <div class="medallas-grid">${medallasHtml}</div>
                </div>
                <div class="ranking-section">
                    <h3>${i18n.t('gamification_top_10')}</h3>
                    <ul class="ranking-list">${rankingHtml}</ul>
                </div>
            </div>
        `;

    } catch (error) {
        return `<p style="color: red;">${error.message}</p>`;
    }
}


async function getGestionarDisciplinasView(token) {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/disciplinas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('No se pudo obtener la lista de disciplinas.');
    const disciplinas = await response.json();

    let disciplinaRows = disciplinas.map(d => `
        <tr data-disciplina-id="${d.id}">
            <td>${d.id}</td>
            <td>${d.nombre}</td>
            <td>${d.area}</td>
            <td>${d.descripcion || ''}</td>
            <td>
                <button class="edit-btn">${i18n.t('users_edit')}</button>
                <button class="delete-btn">${i18n.t('users_delete')}</button>
            </td>
        </tr>
    `).join('');

    setTimeout(() => attachDisciplinaViewListeners(token), 0);

    return `
        <h2>${i18n.t('disciplinas_manage_title')}</h2>
        <button class="add-disciplina-btn">${i18n.t('disciplinas_add_new')}</button>
        <table class="data-table">
            <thead>
                <tr>
                    <th>${i18n.t('users_table_id')}</th>
                    <th>${i18n.t('disciplinas_table_name')}</th>
                    <th>${i18n.t('disciplinas_table_area')}</th>
                    <th>${i18n.t('disciplinas_table_description')}</th>
                    <th>${i18n.t('users_table_actions')}</th>
                </tr>
            </thead>
            <tbody>
                ${disciplinaRows}
            </tbody>
        </table>
    `;
}

function attachDisciplinaViewListeners(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.addEventListener('click', e => {
        const disciplinaId = e.target.closest('tr')?.dataset.disciplinaId;

        if (e.target.classList.contains('delete-btn')) {
            handleDeleteDisciplina(disciplinaId, token);
        }
        if (e.target.classList.contains('edit-btn')) {
            openDisciplinaModal(disciplinaId, token);
        }
        if (e.target.classList.contains('add-disciplina-btn')) {
            openDisciplinaModal(null, token);
        }
    });
}

async function handleDeleteDisciplina(id, token) {
    if (!confirm(i18n.t('disciplinas_delete_confirm', { id }))) return;
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/disciplinas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al eliminar.');
        renderContentForView('disciplinas/modalidades', token);
    } catch (error) {
        alert(error.message);
    }
}

async function openDisciplinaModal(id, token) {
    const isEditing = id !== null;
    let disciplina = {};
    if (isEditing) {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/disciplinas/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            alert('No se pudieron cargar los datos.');
            return;
        }
        disciplina = await response.json();
    }

    const modalHtml = `
        <div class="modal-backdrop" id="disciplina-modal">
            <div class="modal-content">
                <button class="modal-close-btn">&times;</button>
                <h2>${isEditing ? i18n.t('users_modal_edit_title') : i18n.t('users_modal_add_title')} Disciplina</h2>
                <form id="disciplina-form">
                    <input type="hidden" name="id" value="${disciplina.id || ''}">
                    <input type="text" name="nombre" placeholder="${i18n.t('disciplinas_table_name')}" value="${disciplina.nombre || ''}" required>
                    <textarea name="descripcion" placeholder="${i18n.t('disciplinas_table_description')}">${disciplina.descripcion || ''}</textarea>
                    <select name="area" required>
                        <option value="">${i18n.t('users_form_select_role')}</option>
                        <option value="Cultura" ${disciplina.area === 'Cultura' ? 'selected' : ''}>Cultura</option>
                        <option value="Deporte" ${disciplina.area === 'Deporte' ? 'selected' : ''}>Deporte</option>
                    </select>
                    <button type="submit">${isEditing ? i18n.t('users_form_update_button') : i18n.t('users_form_create_button')}</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('disciplina-modal');
    modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('#disciplina-form').addEventListener('submit', e => {
        e.preventDefault();
        handleDisciplinaFormSubmit(e.target, token);
    });
}

async function handleDisciplinaFormSubmit(form, token) {
    const formData = new FormData(form);
    const id = formData.get('id');
    const isEditing = !!id;
    const data = Object.fromEntries(formData.entries());
    const url = isEditing ? `${config.apiBaseUrl}/api/v1/disciplinas/${id}` : `${config.apiBaseUrl}/api/v1/disciplinas`;

    try {
        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Ocurrió un error.');
        }
        document.getElementById('disciplina-modal').remove();
        renderContentForView('disciplinas/modalidades', token);
    } catch (error) {
        alert(`Error al guardar: ${error.message}`);
    }
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
                    <button>${i18n.t('users_edit')}</button>
                </td>
            </tr>
        `).join('');
    } else {
        escenarioRows = '<tr><td colspan="6">No se encontraron escenarios.</td></tr>';
    }

    return `
        <h2>Calendario y Gestión de Escenarios</h2>
        <button>${i18n.t('disciplinas_add_new')}</button>
        <table class="data-table">
            <thead>
                <tr>
                    <th>${i18n.t('users_table_id')}</th>
                    <th>${i18n.t('disciplinas_table_name')}</th>
                    <th>Tipo</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th>${i18n.t('users_table_actions')}</th>
                </tr>
            </thead>
            <tbody>
                ${escenarioRows}
            </tbody>
        </table>
    `;
}
