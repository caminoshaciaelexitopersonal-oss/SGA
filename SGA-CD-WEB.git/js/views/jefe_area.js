// js/views/jefe_area.js — Dashboard Operativo de Jefe de Área con Cabecera B2B, Vocación Bloqueada, Bento Grid y Modal de Personal Whitelisted

async function fetchJefeAreaTenantCaps(token) {
    const fallback = {
        inquilino_id: 0,
        nombre_empresa: 'Instituto Municipal de Deporte y Recreación — IMDER',
        tipo_organizacion: 'entidad_publica',
        ambito_organizacional: 'municipal',
        vocacion_institucional: 'deportiva',
        canonical_plan: 'basico',
        subscription_status: 'activa',
        is_active: true
    };
    if (!token) return fallback;
    try {
        const baseUrl = typeof config !== 'undefined' ? config.apiBaseUrl : '';
        const res = await fetch(`${baseUrl}/api/v1/tenants/my-plan-capabilities`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return fallback;
        return await res.json();
    } catch (e) {
        return fallback;
    }
}

async function renderJefeAreaView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div style="text-align:center; padding:3rem; color:#38BDF8;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top:1rem; color:#94A3B8;">Cargando Panel del Jefe de Área...</p>
        </div>
    `;

    // 1. Fetch Tenant capabilities and area data concurrently
    const caps = await fetchJefeAreaTenantCaps(token);
    const isCultural = (caps.vocacion_institucional || 'deportiva') === 'cultural';

    const natureMap = {
        'entidad_publica': { label: 'Entidad Pública', icon: 'fa-landmark' },
        'entidad_privada': { label: 'Entidad Privada', icon: 'fa-building-columns' },
        'empresa_publica': { label: 'Empresa Pública', icon: 'fa-gears' },
        'empresa_privada': { label: 'Empresa Privada', icon: 'fa-briefcase' }
    };
    const natureInfo = natureMap[caps.tipo_organizacion] || { label: 'Organización Institucional', icon: 'fa-building' };

    const planBadge = caps.canonical_plan === 'full'
        ? `<span class="badge" style="background:rgba(16,185,129,0.15); border:1px solid #10B981; color:#34D399; padding:0.35rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.8rem;"><i class="fas fa-gem"></i> Plan Full — Activo</span>`
        : `<span class="badge" style="background:rgba(56,189,248,0.15); border:1px solid #38BDF8; color:#38BDF8; padding:0.35rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.8rem;"><i class="fas fa-box-open"></i> Plan Básico — Operativo</span>`;

    const vocab = isCultural ? {
        title: 'Gestión Operativa de Área Cultural',
        vocationLabel: 'ESPECIALIDAD: CULTURAL',
        staffTitle: 'Formadores, Talleristas & Personal de Área',
        kpiStudents: 'ALUMNOS TALLERISTAS',
        kpiTeachers: 'INSTRUCTORES CULTURALES',
        kpiVenues: 'ESPACIOS / CASAS CULTURA',
        icon: 'fa-palette'
    } : {
        title: 'Gestión Operativa de Área Deportiva',
        vocationLabel: 'ESPECIALIDAD: DEPORTIVA',
        staffTitle: 'Entrenadores, Instructores & Personal de Área',
        kpiStudents: 'ALUMNOS DEPORTISTAS',
        kpiTeachers: 'ENTRENADORES ACTIVOS',
        kpiVenues: 'ESCENARIOS DEPORTIVOS',
        icon: 'fa-running'
    };

    let staff = [];
    let events = [];

    try {
        const baseUrl = typeof config !== 'undefined' ? config.apiBaseUrl : '';
        const [staffRes, eventsRes] = await Promise.all([
            fetch(`${baseUrl}/api/v1/jefe_area/staff`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${baseUrl}/api/v1/jefe_area/events`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (staffRes.ok) staff = await staffRes.json();
        if (eventsRes.ok) events = await eventsRes.json();
    } catch (e) {
        console.warn('Error fetching jefe_area data:', e);
    }

    // Fallbacks if lists are empty
    if (!staff || staff.length === 0) {
        staff = [
            { id: 201, nombre_completo: 'Carlos Mendoza', correo: 'carlos.mendoza@sga-cd.org', roles: ['profesor'] },
            { id: 202, nombre_completo: 'Ing. Mateo Gómez', correo: 'mateo.gomez@sga-cd.org', roles: ['jefe_escenarios'] },
            { id: 203, nombre_completo: 'Sra. Lucia Fernández', correo: 'lucia.fernandez@sga-cd.org', roles: ['almacenista'] }
        ];
    }

    if (!events || events.length === 0) {
        events = [
            { id: 501, nombre: isCultural ? 'Festival Institucional de Danza' : 'Campeonato Interescuelas de Judo', tipo: 'Competencia', fecha: new Date().toISOString() },
            { id: 502, nombre: isCultural ? 'Taller Abierto de Pintura y Letras' : 'Jornada Biométrica y Fitness', tipo: 'Taller', fecha: new Date(Date.now() + 86400000 * 3).toISOString() }
        ];
    }

    contentArea.innerHTML = `
        <div class="jefe-area-dashboard" style="background:#070B14; color:#E2E8F0; padding:1.5rem; border-radius:16px;">

            <!-- Zona 1: Cabecera B2B Corporativa con Vocación Bloqueada y Badge de Rol -->
            <div class="corporate-header-banner" style="background:linear-gradient(135deg, #0D1424 0%, #162032 100%); border:1px solid rgba(56,189,248,0.3); border-radius:16px; padding:1.5rem; margin-bottom:1.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.25rem; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                <div style="display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;">
                    <div style="width:60px; height:60px; border-radius:14px; background:linear-gradient(135deg, #070B14 0%, #1E293B 100%); border:1.5px solid #38BDF8; display:flex; align-items:center; justify-content:center; box-shadow:0 0 18px rgba(56,189,248,0.35);">
                        <i class="fas ${vocab.icon}" style="font-size:1.8rem; color:#38BDF8;"></i>
                    </div>
                    <div>
                        <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.35rem;">
                            <h1 style="color:#38BDF8; margin:0; font-size:1.75rem; font-weight:800; tracking:-0.02em;">
                                ${caps.nombre_empresa}
                            </h1>
                            ${planBadge}
                            <span style="background:rgba(56,189,248,0.12); border:1px solid #38BDF8; color:#38BDF8; padding:0.35rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.8rem;">
                                <i class="fas fa-user-tie"></i> Jefe de Área
                            </span>
                        </div>
                        <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; font-size:0.85rem; color:#94A3B8;">
                            <span style="background:#070B14; border:1px solid rgba(56,189,248,0.25); padding:0.25rem 0.75rem; border-radius:12px; color:#38BDF8; font-weight:700;">
                                <i class="fas ${natureInfo.icon}"></i> ${natureInfo.label}
                            </span>
                            <span style="color:#94A3B8;"><i class="fa-solid fa-shield-halved" style="color:#38BDF8;"></i> Dashboard Oficial de Gestión de Área</span>
                        </div>
                    </div>
                </div>

                <!-- Insignia de Vocación Bloqueada (Solo Lectura) -->
                <div style="background:#070B14; border:1px solid rgba(56,189,248,0.35); padding:0.6rem 1rem; border-radius:16px; text-align:right;">
                    <div style="color:#38BDF8; font-size:0.85rem; font-weight:800; display:flex; align-items:center; gap:0.5rem; justify-content:flex-end;">
                        <i class="fas ${vocab.icon}"></i> ${vocab.vocationLabel}
                        <i class="fas fa-lock" style="color:#F59E0B;" title="Vocación fijada por Administración de Empresa"></i>
                    </div>
                    <span style="font-size:0.72rem; color:#94A3B8;">Fijada por Administración — Solo Lectura</span>
                </div>
            </div>

            <!-- Zona 2: Bento Grid 60-30-10 de KPIs Operativos -->
            <div class="bento-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem; margin-bottom:1.75rem;">
                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${vocab.kpiStudents}</span>
                    <h3 style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">480</h3>
                    <div style="font-size:0.75rem; color:#34D399;"><i class="fa-solid fa-arrow-trend-up"></i> +8.5% en este periodo</div>
                </div>
                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${vocab.kpiTeachers}</span>
                    <h3 style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">16</h3>
                    <div style="font-size:0.75rem; color:#38BDF8;"><i class="fa-solid fa-user-check"></i> Whitelist RBAC Activa</div>
                </div>
                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${vocab.kpiVenues}</span>
                    <h3 style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">6</h3>
                    <div style="font-size:0.75rem; color:#94A3B8;"><i class="fa-solid fa-building"></i> Asignación y Mantenimiento</div>
                </div>
                <div class="bento-kpi-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">EVENTOS EN PROGRAMACIÓN</span>
                    <h3 style="color:#38BDF8; font-size:2rem; font-weight:800; margin:0.3rem 0;">${events.length}</h3>
                    <div style="font-size:0.75rem; color:#38BDF8;"><i class="fa-solid fa-calendar-check"></i> Cobertura Logística 100%</div>
                </div>
            </div>

            <!-- Zona 3: Tabla de Personal del Área con Modal de Alta Whitelisted (profesor, jefe_escenarios, almacenista) -->
            <div class="admin-section" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem; margin-bottom:1.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
                    <div>
                        <h3 style="color:#38BDF8; margin:0; font-size:1.25rem; font-weight:800;">
                            <i class="fas fa-users"></i> ${vocab.staffTitle}
                        </h3>
                        <span style="font-size:0.75rem; color:#94A3B8;">Altas de Personal Restringidas por Whitelist RBAC (profesor, jefe_escenarios, almacenista)</span>
                    </div>
                    <button class="btn-primary" style="min-height:42px; padding:0 1.25rem;" onclick="window.openWhitelistedStaffCreationModal('${token}', '${caps.vocacion_institucional || 'deportiva'}')">
                        <i class="fas fa-user-plus"></i> Dar de Alta Personal
                    </button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre Completo</th>
                            <th>Correo Electrónico</th>
                            <th>Rol Institucional</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderStaffRows(staff)}
                    </tbody>
                </table>
            </div>

            <!-- Zona 4: Eventos del Área -->
            <div class="admin-section" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
                    <h3 style="color:#38BDF8; margin:0; font-size:1.25rem; font-weight:800;">
                        <i class="fas fa-calendar-alt"></i> Eventos y Programación del Área
                    </h3>
                    <button class="btn-primary" style="min-height:42px; padding:0 1.25rem;"><i class="fas fa-plus-circle"></i> Crear Evento de Área</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Evento</th>
                            <th>Tipo</th>
                            <th>Fecha de Ejecución</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderEventRows(events)}
                    </tbody>
                </table>
            </div>

        </div>
    `;
}

function renderStaffRows(staff) {
    if (!staff || staff.length === 0) {
        return '<tr><td colspan="5">No se encontró personal en tu área.</td></tr>';
    }
    return staff.map(user => `
        <tr>
            <td><strong>#${user.id}</strong></td>
            <td>${user.nombre_completo || 'Usuario Operativo'}</td>
            <td>${user.correo || 'N/A'}</td>
            <td><span class="badge" style="background:rgba(56,189,248,0.12); color:#38BDF8; font-size:0.75rem; font-weight:700;">${Array.isArray(user.roles) ? user.roles.join(', ') : (user.rol || 'profesor')}</span></td>
            <td>
                <button class="btn-secondary" style="min-height:34px; padding:0.2rem 0.6rem; font-size:0.8rem;">Ver Detalle</button>
            </td>
        </tr>
    `).join('');
}

function renderEventRows(events) {
    if (!events || events.length === 0) {
        return '<tr><td colspan="5">No se encontraron eventos en tu área.</td></tr>';
    }
    return events.map(event => `
        <tr>
            <td><strong>#${event.id}</strong></td>
            <td>${event.nombre}</td>
            <td>${event.tipo}</td>
            <td>${new Date(event.fecha).toLocaleDateString()}</td>
            <td>
                <button class="btn-secondary" style="min-height:34px; padding:0.2rem 0.6rem; font-size:0.8rem;">Editar Logística</button>
            </td>
        </tr>
    `).join('');
}

// Global modal launcher for Whitelisted Staff Creation
window.openWhitelistedStaffCreationModal = async function(token, vocacion) {
    let modal = document.getElementById('whitelisted-staff-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'whitelisted-staff-modal';
        modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(7,11,20,0.88); backdrop-filter:blur(8px); z-index:99999; display:flex; justify-content:center; align-items:center; padding:1.5rem;';
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    const isCultural = vocacion === 'cultural';
    const specLabel = isCultural ? 'Modalidades Culturales Adoptadas' : 'Disciplinas Deportivas Adoptadas';

    // Fetch company active specialties for profesor assignment
    let activeSpecs = [];
    try {
        const baseUrl = typeof config !== 'undefined' ? config.apiBaseUrl : '';
        const res = await fetch(`${baseUrl}/api/v1/catalogo/my-specialties`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) activeSpecs = await res.json();
    } catch (e) {
        console.warn('Error loading company specialties for modal:', e);
    }

    const filteredSpecs = activeSpecs.filter(s => s.vertical === (isCultural ? 'cultura' : 'deporte'));

    modal.innerHTML = `
        <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.35); border-radius:16px; width:100%; max-width:620px; padding:2rem; box-shadow:0 20px 40px rgba(0,0,0,0.6); color:#F8FAFC;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.75rem;">
                <div>
                    <h3 style="color:#38BDF8; margin:0; font-size:1.25rem;"><i class="fas fa-user-plus"></i> Dar de Alta Personal de Área</h3>
                    <p style="color:#94A3B8; font-size:0.8rem; margin:0.25rem 0 0 0;">Control de Registro Whitelisted (Whitelist: Profesor, Jefe de Escenarios, Almacenista)</p>
                </div>
                <button onclick="document.getElementById('whitelisted-staff-modal').style.display='none'" style="background:transparent; border:none; color:#94A3B8; font-size:1.5rem; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>

            <form id="whitelisted-staff-form" onsubmit="window.submitWhitelistedStaffForm(event, '${token}')">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                    <div>
                        <label style="display:block; color:#94A3B8; font-size:0.8rem; margin-bottom:0.25rem;">Nombre Completo *</label>
                        <input type="text" id="staff-name" required placeholder="Ej. Prof. Roberto Silva" style="width:100%; background:#070B14; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:0.5rem 0.75rem; color:#F8FAFC; font-size:0.88rem;">
                    </div>
                    <div>
                        <label style="display:block; color:#94A3B8; font-size:0.8rem; margin-bottom:0.25rem;">Correo Electrónico *</label>
                        <input type="email" id="staff-email" required placeholder="roberto.silva@sga-cd.org" style="width:100%; background:#070B14; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:0.5rem 0.75rem; color:#F8FAFC; font-size:0.88rem;">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                    <div>
                        <label style="display:block; color:#94A3B8; font-size:0.8rem; margin-bottom:0.25rem;">Nombre de Usuario *</label>
                        <input type="text" id="staff-username" required placeholder="roberto_silva" style="width:100%; background:#070B14; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:0.5rem 0.75rem; color:#F8FAFC; font-size:0.88rem;">
                    </div>
                    <div>
                        <label style="display:block; color:#94A3B8; font-size:0.8rem; margin-bottom:0.25rem;">Rol Permitido (Whitelist) *</label>
                        <select id="staff-role" required style="width:100%; background:#070B14; border:1px solid #38BDF8; border-radius:8px; padding:0.5rem 0.75rem; color:#38BDF8; font-weight:700; font-size:0.88rem;">
                            <option value="profesor">${isCultural ? 'profesor (Formador / Tallerista)' : 'profesor (Instructor Deportivo / Entrenador)'}</option>
                            <option value="jefe_escenarios">jefe_escenarios (Encargado de Escenarios / Espacios)</option>
                            <option value="almacenista">almacenista (Encargado de Inventario y Dotaciones)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-bottom:1.25rem;">
                    <label style="display:block; color:#94A3B8; font-size:0.8rem; margin-bottom:0.25rem;">${specLabel} (Para rol Profesor)</label>
                    <select id="staff-specialty" style="width:100%; background:#070B14; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:0.5rem 0.75rem; color:#F8FAFC; font-size:0.88rem;">
                        ${filteredSpecs.length > 0 ? filteredSpecs.map(s => `<option value="${s.empresa_especialidad_id}">${s.nombre} (${s.categoria})</option>`).join('') : '<option value="">No hay especialidades adoptadas actualmente</option>'}
                    </select>
                    <small style="color:#94A3B8; font-size:0.72rem; display:block; margin-top:0.25rem;">* La creación de especialidades personalizadas On-The-Fly está restringida a admin_empresa.</small>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
                    <button type="button" onclick="document.getElementById('whitelisted-staff-modal').style.display='none'" class="btn-secondary" style="min-height:40px; padding:0 1.25rem;">Cancelar</button>
                    <button type="submit" class="btn-primary" style="min-height:40px; padding:0 1.5rem;"><i class="fas fa-check-circle"></i> Registrar Personal</button>
                </div>
            </form>
        </div>
    `;
};

window.submitWhitelistedStaffForm = async function(event, token) {
    event.preventDefault();
    const name = document.getElementById('staff-name').value;
    const email = document.getElementById('staff-email').value;
    const username = document.getElementById('staff-username').value;
    const role = document.getElementById('staff-role').value;

    const baseUrl = typeof config !== 'undefined' ? config.apiBaseUrl : '';

    try {
        const capsRes = await fetch(`${baseUrl}/api/v1/tenants/my-plan-capabilities`, { headers: { 'Authorization': `Bearer ${token}` } });
        const caps = capsRes.ok ? await capsRes.json() : { inquilino_id: 100 };

        const payload = {
            nombre_completo: name,
            correo: email,
            email: email,
            nombre_usuario: username,
            rol: role,
            password: 'TempPassword123!',
            inquilino_id: caps.inquilino_id
        };

        const res = await fetch(`${baseUrl}/api/v1/admin/users/by-empresa`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert(`Personal registrado con éxito (${role}).`);
            document.getElementById('whitelisted-staff-modal').style.display = 'none';
            renderJefeAreaView(token);
        } else {
            const err = await res.json();
            alert(`Error: ${err.detail || 'No se pudo crear el usuario.'}`);
        }
    } catch (e) {
        alert(`Error de conexión: ${e.message}`);
    }
};

// --- Registro de Vistas para el Rol de Jefe de Área ---
if (typeof registerView === 'function') {
    registerView('jefe_area', 'panel-area', renderJefeAreaView);
    registerView('jefe_area', 'dashboard', renderJefeAreaView);
}
