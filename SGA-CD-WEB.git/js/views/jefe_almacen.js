// js/views/jefe_almacen.js

// --- Vistas para el Rol de Jefe de Almacén ---

/**
 * Renderiza el dashboard principal de inventario.
 */
async function renderDashboardInventarioView(token) {
    const contentArea = document.getElementById('content-area');
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

        contentArea.innerHTML = `
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
        contentArea.innerHTML = `<p class="message-error">Error al cargar el inventario: ${error.message}</p>`;
    }
}

/**
 * Renderiza el formulario para registrar movimientos de inventario.
 */
async function renderRegistrarMovimientosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
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
    // Aquí se añadirían los listeners para el formulario.
}

/**
 * Renderiza la vista de Stock y Reposición. (Placeholder)
 */
async function renderStockReposicionView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-sort-amount-up"></i> Stock y Reposición</h2></div>
        <p>Herramientas para ver los niveles de stock actuales y gestionar órdenes de reposición.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

/**
 * Renderiza la vista de Hojas de Vida de Elementos. (Placeholder)
 */
async function renderHojasDeVidaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-file-invoice"></i> Hojas de Vida de Elementos</h2></div>
        <p>Consulta del historial, fechas de mantenimiento y estado de cada elemento individual del inventario.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

/**
 * Renderiza la vista de Reportes de Inventario. (Placeholder)
 */
async function renderReportesInventarioView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-file-excel"></i> Reportes de Inventario</h2></div>
        <p>Generación de reportes de inventario (valoración, rotación, etc.) en diferentes formatos.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

// --- Registrar las vistas de Jefe de Almacén en el Router ---
if (typeof registerView === 'function') {
    registerView('jefe_almacen', 'dashboard-inventario', renderDashboardInventarioView);
    registerView('jefe_almacen', 'registrar-movimientos', renderRegistrarMovimientosView);
    registerView('jefe_almacen', 'stock-y-reposicion', renderStockReposicionView);
    registerView('jefe_almacen', 'hojas-de-vida', renderHojasDeVidaView);
    registerView('jefe_almacen', 'reportes-de-inventario', renderReportesInventarioView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
