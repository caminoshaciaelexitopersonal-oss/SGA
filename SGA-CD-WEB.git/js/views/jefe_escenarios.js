async function renderJefeEscenariosView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="jefe-escenarios-dashboard">
            <h2>Panel de Gestión de Escenarios</h2>
            <div id="jefe-escenarios-dashboard-content">
                <p>Cargando escenarios...</p>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/jefe_escenarios/scenarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('No se pudo obtener la lista de escenarios.');

        const scenarios = await response.json();
        const scenariosContainer = document.getElementById('jefe-escenarios-dashboard-content');

        scenariosContainer.innerHTML = `
            <button class="btn-primary">Añadir Escenario</button>
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
                    ${renderScenarioRows(scenarios)}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error('Error rendering jefe_escenarios view:', error);
        contentArea.innerHTML = `<p class="message-error">Error al cargar el panel de escenarios: ${error.message}</p>`;
    }
}

function renderScenarioRows(scenarios) {
    if (!scenarios || scenarios.length === 0) {
        return '<tr><td colspan="6">No se encontraron escenarios.</td></tr>';
    }
    return scenarios.map(scenario => `
        <tr>
            <td>${scenario.id}</td>
            <td>${scenario.nombre}</td>
            <td>${scenario.tipo}</td>
            <td>${scenario.capacidad || 'N/A'}</td>
            <td><span class="status-${scenario.estado.toLowerCase()}">${scenario.estado}</span></td>
            <td>
                <button class="btn-secondary">Editar</button>
                <button class="btn-secondary">Ver Calendario</button>
            </td>
        </tr>
    `).join('');
}
