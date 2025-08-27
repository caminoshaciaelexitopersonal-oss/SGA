async function renderAdminEmpresaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="admin-dashboard">
            <h2>Panel de Administración de la Empresa</h2>
            <div id="admin-dashboard-content">
                <p>Cargando datos...</p>
            </div>
        </div>
    `;

    try {
        // Fetch users and areas concurrently
        const [usersResponse, areasResponse] = await Promise.all([
            fetch(`${config.apiBaseUrl}/api/v1/admin/users/by-empresa`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${config.apiBaseUrl}/api/v1/admin/areas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (!usersResponse.ok) throw new Error('No se pudo obtener la lista de usuarios.');
        if (!areasResponse.ok) throw new Error('No se pudo obtener la lista de áreas.');

        const users = await usersResponse.json();
        const areas = await areasResponse.json();

        // Render the tables
        const dashboardContent = document.getElementById('admin-dashboard-content');
        dashboardContent.innerHTML = `
            <div class="admin-section">
                <h3><i class="fas fa-users"></i> Usuarios de la Empresa</h3>
                <button class="btn-primary">Añadir Usuario</button>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderUserRows(users)}
                    </tbody>
                </table>
            </div>
            <div class="admin-section">
                <h3><i class="fas fa-sitemap"></i> Áreas de la Empresa</h3>
                <button class="btn-primary">Crear Área</button>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Área</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderAreaRows(areas)}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error rendering admin_empresa view:', error);
        contentArea.innerHTML = `<p class="message-error">Error al cargar el panel de administración: ${error.message}</p>`;
    }
}

function renderUserRows(users) {
    if (!users || users.length === 0) {
        return '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
    }
    return users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.nombre_completo}</td>
            <td>${user.correo}</td>
            <td>${user.roles.join(', ')}</td>
            <td>
                <button class="btn-secondary">Editar</button>
                <button class="btn-danger">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function renderAreaRows(areas) {
    if (!areas || areas.length === 0) {
        return '<tr><td colspan="4">No se encontraron áreas.</td></tr>';
    }
    return areas.map(area => `
        <tr>
            <td>${area.id}</td>
            <td>${area.nombre}</td>
            <td>${area.descripcion || 'N/A'}</td>
            <td>
                <button class="btn-secondary">Editar</button>
                <button class="btn-danger">Eliminar</button>
            </td>
        </tr>
    `).join('');
}
