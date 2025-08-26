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
                contentArea.innerHTML = '<h2>Gestionar Áreas</h2><p>Aquí se mostrará la gestión de áreas de la empresa.</p>';
                break;
            case 'reportes':
                contentArea.innerHTML = '<h2>Reportes</h2><p>Aquí se mostrarán los reportes de la empresa.</p>';
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
