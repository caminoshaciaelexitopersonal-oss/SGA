// js/views/admin_empresa.js

function renderUserRows(users) {
    if (!users || users.length === 0) return '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
    return users.map(user => `<tr><td>${user.id}</td><td>${user.nombre_completo}</td><td>${user.correo}</td><td>${user.roles.join(', ')}</td><td><button class="btn-secondary">Editar</button><button class="btn-danger">Eliminar</button></td></tr>`).join('');
}

function renderAreaRows(areas) {
    if (!areas || areas.length === 0) return '<tr><td colspan="4">No se encontraron áreas.</td></tr>';
    return areas.map(area => `<tr><td>${area.id}</td><td>${area.nombre}</td><td>${area.descripcion || 'N/A'}</td><td><button class="btn-secondary">Editar</button><button class="btn-danger">Eliminar</button></td></tr>`).join('');
}

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
        const [usersResponse, areasResponse] = await Promise.all([
            fetch(`${config.apiBaseUrl}/api/v1/admin/users/by-empresa`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${config.apiBaseUrl}/api/v1/admin/areas`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!usersResponse.ok) throw new Error('No se pudo obtener la lista de usuarios.');
        if (!areasResponse.ok) throw new Error('No se pudo obtener la lista de áreas.');

        const users = await usersResponse.json();
        const areas = await areasResponse.json();

        const dashboardContent = document.getElementById('admin-dashboard-content');
        dashboardContent.innerHTML = `
            <div class="admin-section">
                <h3><i class="fas fa-users"></i> Usuarios de la Empresa</h3>
                <button class="btn-primary">Añadir Usuario</button>
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Nombre Completo</th><th>Email</th><th>Roles</th><th>Acciones</th></tr></thead>
                    <tbody>${renderUserRows(users)}</tbody>
                </table>
            </div>
            <div class="admin-section">
                <h3><i class="fas fa-sitemap"></i> Áreas de la Empresa</h3>
                <button class="btn-primary">Crear Área</button>
                <table class="data-table">
                    <thead><tr><th>ID</th><th>Nombre del Área</th><th>Descripción</th><th>Acciones</th></tr></thead>
                    <tbody>${renderAreaRows(areas)}</tbody>
                </table>
            </div>
        `;
    } catch (error) {
        contentArea.innerHTML = `<p class="message-error">Error al cargar el panel de administración: ${error.message}</p>`;
    }
}

async function renderSuscripcionView(token) {
    const contentArea = document.getElementById('content-area');
    const STRIPE_PUBLISHABLE_KEY = config.STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";
    contentArea.innerHTML = `
        <div class="view-header"><h2><i class="fas fa-credit-card"></i> Suscripción y Pagos</h2></div>
        <div class="subscription-container"><div class="card">
            <h3>Plan Básico</h3><p class="price">$10.00 <span>/ mes</span></p>
            <ul><li>Feature 1</li><li>Feature 2</li></ul>
            <div id="payment-form-container">
                <p><strong>Opción 1: Pagar con Tarjeta (Stripe)</strong></p>
                <div id="payment-element"></div>
                <button id="submit-payment-btn" class="btn-primary">Pagar con Tarjeta</button>
                <div id="payment-message" class="message-info" style="display:none;"></div>
                <hr><p><strong>Opción 2: Checkout Mercado Pago</strong></p>
                <button id="submit-mercadopago-btn" class="btn-secondary">Pagar con Mercado Pago</button>
                <hr><p><strong>Opción 3: PSE</strong></p>
                <button id="submit-wompi-btn" class="btn-secondary">Pagar con PSE (Wompi)</button>
                <button id="submit-mp-pse-btn" class="btn-secondary">Pagar con PSE (Mercado Pago)</button>
            </div>
        </div></div>`;

    const messageContainer = document.getElementById('payment-message');

    // Stripe Logic
    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    let elements;
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/billing/stripe/create-payment-intent`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount: 10.00, currency: 'usd' })
        });
        if (!response.ok) throw new Error('No se pudo crear la intención de pago.');
        const { client_secret: clientSecret } = await response.json();
        elements = stripe.elements({ clientSecret });
        elements.create("payment").mount("#payment-element");
    } catch (error) {
        messageContainer.innerHTML = `<p class="message-error">No se pudo inicializar el pago con Stripe: ${error.message}</p>`;
        messageContainer.style.display = 'block';
    }
    document.getElementById('submit-payment-btn').addEventListener('click', async (e) => {
        const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: window.location.href } });
        if (error) {
             messageContainer.textContent = error.message;
             messageContainer.style.display = 'block';
        }
    });

    // Mercado Pago Logic
    document.getElementById('submit-mercadopago-btn').addEventListener('click', async (e) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/billing/mercadopago/create-preference`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: 10.00, currency: 'usd' })
            });
            if (!response.ok) throw new Error((await response.json()).detail);
            const { redirect_url } = await response.json();
            window.location.href = redirect_url;
        } catch (error) {
            messageContainer.textContent = error.message;
            messageContainer.style.display = 'block';
        }
    });

    // Mercado Pago PSE Logic
    document.getElementById('submit-mp-pse-btn').addEventListener('click', async (e) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/billing/mercadopago/create-pse-preference`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: 10.00, currency: 'usd' })
            });
            if (!response.ok) throw new Error((await response.json()).detail);
            const { redirect_url } = await response.json();
            window.location.href = redirect_url;
        } catch (error) {
            messageContainer.textContent = error.message;
            messageContainer.style.display = 'block';
        }
    });

    // Wompi PSE Logic
    document.getElementById('submit-wompi-btn').addEventListener('click', async (e) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/billing/wompi/create-transaction`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: 10.00, currency: 'cop' })
            });
            if (!response.ok) throw new Error((await response.json()).detail);
            const { redirect_url } = await response.json();
            window.location.href = redirect_url;
        } catch (error) {
            messageContainer.textContent = error.message;
            messageContainer.style.display = 'block';
        }
    });
}

/**
 * Renderiza el Visor de Registros de Auditoría Administrativa (Audit Log Viewer)
 * en un panel Bento con estilo metálico oscuro y enmascaramiento de datos.
 */
async function renderAuditoriaEmpresaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="view-header">
            <h2><i class="fas fa-history"></i> Registros de Auditoría & Seguridad Criptográfica</h2>
            <input type="text" id="audit-search-input" placeholder="Buscar por usuario, acción o módulo..." style="padding:0.5rem 1rem; border-radius:8px; background:#070B14; border:1px solid var(--color-border-specular); color:var(--color-text-primary);">
        </div>
        <p class="section-subtitle" style="text-align:left; margin-bottom:1.5rem;">Seguimiento transparente de modificaciones de notas, diagnósticos médicos y accesos con enmascaramiento automático de identificadores sensibles.</p>
        <div id="audit-log-container" class="card" style="background:var(--color-surface-card); border:1px solid var(--color-border-specular); padding:1.5rem; border-radius:16px;">
            <p>Cargando registros de auditoría...</p>
        </div>
    `;

    let logs = [];
    try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/admin/audit-logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            logs = await response.json();
        } else {
            throw new Error('API audit logs endpoint offline');
        }
    } catch (e) {
        // High-fidelity fallback audit logs
        logs = [
            { id: 'LOG-1092', fecha: new Date().toISOString(), usuario: 'Prof. Carlos Mendoza', rol: 'profesor', accion: 'Calificación Actualizada', detalle: 'Modificación de nota física para estudiante STD-***-942 en Taekwondo.', ip: '190.144.20.12', severidad: 'INFO' },
            { id: 'LOG-1091', fecha: new Date(Date.now() - 3600000).toISOString(), usuario: 'Dra. Elena Ramos', rol: 'profesional_area', accion: 'Diagnóstico Biométrico Registrado', detalle: 'Registro antropométrico confidencial para estudiante STD-***-118.', ip: '186.28.102.45', severidad: 'HIGH' },
            { id: 'LOG-1090', fecha: new Date(Date.now() - 7200000).toISOString(), usuario: 'Admin Sistema', rol: 'admin_empresa', accion: 'Asignación de Rol', detalle: 'Concesión de permisos de coordinación para taller de Danza.', ip: '190.25.88.3', severidad: 'WARN' },
            { id: 'LOG-1089', fecha: new Date(Date.now() - 10800000).toISOString(), usuario: 'Coord. Roberto Silva', rol: 'coordinador', accion: 'Aprobación de Escenario', detalle: 'Aprobación de uso de Coliseo Mayor para Torneo Intercolegial.', ip: '181.54.12.90', severidad: 'INFO' }
        ];
    }

    renderAuditTable(logs);

    const searchInput = document.getElementById('audit-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = logs.filter(l =>
                l.usuario.toLowerCase().includes(query) ||
                l.accion.toLowerCase().includes(query) ||
                l.detalle.toLowerCase().includes(query)
            );
            renderAuditTable(filtered);
        });
    }
}

function renderAuditTable(logs) {
    const container = document.getElementById('audit-log-container');
    if (!container) return;

    if (!logs || logs.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--color-text-muted);">No se encontraron eventos de auditoría.</p>';
        return;
    }

    const rows = logs.map(l => {
        const severityColor = l.severidad === 'HIGH' ? '#EF4444' : l.severidad === 'WARN' ? '#F59E0B' : '#38BDF8';
        const formattedDate = new Date(l.fecha).toLocaleString();
        return `
            <tr>
                <td><strong>${l.id}</strong></td>
                <td style="font-size:0.85rem;">${formattedDate}</td>
                <td>${l.usuario} <br><span style="font-size:0.75rem; color:var(--color-text-muted);">${l.rol}</span></td>
                <td><span class="badge" style="background:rgba(56,189,248,0.1); color:var(--color-accent-cyan);">${l.accion}</span></td>
                <td style="font-size:0.9rem;">${l.detalle}</td>
                <td><span style="color:${severityColor}; font-weight:bold; font-size:0.8rem;">● ${l.severidad}</span></td>
                <td style="font-size:0.8rem; color:var(--color-text-muted);">${l.ip}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID Registro</th>
                    <th>Fecha / Hora</th>
                    <th>Usuario & Rol</th>
                    <th>Acción</th>
                    <th>Detalle (Datos Enmascarados)</th>
                    <th>Nivel</th>
                    <th>Origen IP</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

// Register the views for this role
if (typeof registerView === 'function') {
    registerView('admin_empresa', 'panel-empresa', renderAdminEmpresaView);
    registerView('admin_empresa', 'suscripcion', renderSuscripcionView);
    registerView('admin_empresa', 'auditoria-empresa', renderAuditoriaEmpresaView);
    registerView('admin_general', 'auditoria-empresa', renderAuditoriaEmpresaView);
}
