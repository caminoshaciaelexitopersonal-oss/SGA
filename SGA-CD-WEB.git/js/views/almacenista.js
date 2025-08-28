// js/views/almacenista.js

// --- Vistas para el Rol de Almacenista ---

/**
 * Renderiza la vista para Ver Inventario. (Placeholder)
 */
async function renderVerInventarioView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-boxes"></i> Ver Inventario</h2></div>
        <p>Desde aquí puede consultar el stock actual de los elementos en el almacén.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}

/**
 * Renderiza la vista para Registrar Movimientos. (Placeholder)
 */
async function renderAlmacenistaRegistrarMovimientosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-dolly-flatbed"></i> Registrar Movimientos</h2></div>
        <p>Utilice este panel para registrar las entradas y salidas de elementos del inventario.</p>
        <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
    `;
}


// --- Registrar las vistas de Almacenista en el Router ---
if (typeof registerView === 'function') {
    registerView('almacenista', 'ver-inventario', renderVerInventarioView);
    registerView('almacenista', 'registrar-movimientos', renderAlmacenistaRegistrarMovimientosView);
} else {
    console.error("El sistema de registro de vistas no está disponible.");
}
