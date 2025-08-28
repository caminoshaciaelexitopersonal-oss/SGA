// js/views/almacenista.js

async function renderAlmacenistaView(viewName, token) {
    const contentArea = document.getElementById('content-area');
    let contentHtml = '';

    switch (viewName) {
        case 'ver-inventario':
            contentHtml = `
                <div class="view-header"><h2><i class="fas fa-boxes"></i> Ver Inventario</h2></div>
                <p>Desde aquí puede consultar el stock actual de los elementos en el almacén.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        case 'registrar-movimientos':
            contentHtml = `
                <div class="view-header"><h2><i class="fas fa-dolly-flatbed"></i> Registrar Movimientos</h2></div>
                <p>Utilice este panel para registrar las entradas y salidas de elementos del inventario.</p>
                <p class="message-info">Esta funcionalidad se implementará en una futura actualización.</p>
            `;
            break;
        default:
            contentHtml = `<h2>Panel de Almacenista</h2><p>Seleccione una opción del menú para comenzar.</p>`;
    }

    contentArea.innerHTML = contentHtml;
}
