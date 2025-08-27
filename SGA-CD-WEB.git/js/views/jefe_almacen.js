// js/views/jefe_almacen.js

async function renderJefeAlmacenView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    let contentHtml = '';

    switch (viewName) {
        case 'dashboard-inventario':
            {
                contentArea.innerHTML = `<div class="view-header"><h2><i class="fas fa-boxes"></i> Dashboard de Inventario</h2></div><p>Cargando inventario...</p>`;
                try {
                    const response = await fetch(`${config.apiBaseUrl}/api/v1/inventory/items`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!response.ok) throw new Error('No se pudo obtener el inventario.');
                    const items = await response.json();

                    const rows = items.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.nombre}</td>
                            <td>${item.categoria}</td>
                            <td>${item.stock}</td>
                            <td><span class="status-${item.estado.toLowerCase()}">${item.estado}</span></td>
                            <td>
                                <button class="btn-secondary btn-hoja-vida" data-id="${item.id}">Ver Hoja de Vida</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="6">No hay elementos en el inventario.</td></tr>';

                    contentHtml = `
                        <div class="view-header">
                            <h2><i class="fas fa-boxes"></i> Inventario General</h2>
                            <button class="btn-primary">Añadir Nuevo Elemento</button>
                        </div>
                        <table class="data-table">
                            <thead><tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    `;
                } catch (error) {
                    contentHtml = `<p class="message-error">Error al cargar el inventario: ${error.message}</p>`;
                }
            }
            break;
        case 'registrar-movimientos':
            contentHtml = `
                <div class="view-header"><h2><i class="fas fa-dolly-flatbed"></i> Registrar Movimientos</h2></div>
                <form id="movimiento-form" class="form-container">
                    <select id="movimiento-tipo" required>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                    </select>
                    <input type="number" id="movimiento-item-id" placeholder="ID del Elemento" required>
                    <input type="number" id="movimiento-cantidad" placeholder="Cantidad" required>
                    <textarea id="movimiento-justificacion" placeholder="Justificación del movimiento..."></textarea>
                    <button type="submit" class="btn-primary">Registrar Movimiento</button>
                </form>
                <div id="movimiento-feedback" class="message-info" style="display:none;"></div>
            `;
            // Listener para este formulario se añadiría aquí, similar a otros.
            break;
        case 'stock-y-reposicion':
            contentHtml = `
                <div class="view-header"><h2><i class="fas fa-sort-amount-up"></i> Stock y Reposición</h2></div>
                <p>Herramientas para ver los niveles de stock actuales y gestionar órdenes de reposición.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'hojas-de-vida':
            contentHtml = `
                <div class="view-header"><h2><i class="fas fa-file-invoice"></i> Hojas de Vida de Elementos</h2></div>
                <p>Consulta del historial, fechas de mantenimiento y estado de cada elemento individual del inventario.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'reportes-de-inventario':
            contentHtml = `
                <div class="view-header"><h2><i class="fas fa-file-excel"></i> Reportes de Inventario</h2></div>
                <p>Generación de reportes de inventario (valoración, rotación, etc.) en diferentes formatos.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        default:
            contentHtml = `<h2>Panel de Jefe de Almacén</h2><p>Seleccione una opción del menú para gestionar el inventario.</p>`;
    }

    contentArea.innerHTML = contentHtml;
}
