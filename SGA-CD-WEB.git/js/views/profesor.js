// js/views/profesor.js — Panel del Profesor / Instructor (Centro Operativo del Sistema)

async function fetchProfesorTenantCaps(token) {
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

async function renderProfesorView(token) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div style="text-align:center; padding:3rem; color:#38BDF8;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top:1rem; color:#94A3B8;">Cargando Centro Operativo del Profesor...</p>
        </div>
    `;

    const caps = await fetchProfesorTenantCaps(token);
    const isCultural = (caps.vocacion_institucional || 'deportiva') === 'cultural';

    const natureMap = {
        'entidad_publica': { label: 'Entidad Pública', icon: 'fa-landmark' },
        'entidad_privada': { label: 'Entidad Privada', icon: 'fa-building-columns' },
        'empresa_publica': { label: 'Empresa Pública', icon: 'fa-gears' },
        'empresa_privada': { label: 'Empresa Privada', icon: 'fa-briefcase' }
    };
    const natureInfo = natureMap[caps.tipo_organizacion] || { label: 'Organización Institucional', icon: 'fa-building' };

    const vocab = isCultural ? {
        vocationLabel: 'ESPECIALIDAD: CULTURAL',
        title: 'Gestión Pedagógica de Talleres & Formación Artística',
        myStudentsCount: 42,
        attendanceRate: '96.2%',
        hoursTaught: 120,
        icon: 'fa-chalkboard-teacher'
    } : {
        vocationLabel: 'ESPECIALIDAD: DEPORTIVA',
        title: 'Gestión Técnica de Escuelas Deportivas & Alto Rendimiento',
        myStudentsCount: 40,
        attendanceRate: '95.8%',
        hoursTaught: 140,
        icon: 'fa-chalkboard-teacher'
    };

    contentArea.innerHTML = `
        <div class="profesor-dashboard" style="background:#070B14; color:#E2E8F0; padding:1.5rem; border-radius:16px;">

            <!-- Zona 1: Cabecera B2B Corporativa -->
            <div class="corporate-header-banner" style="background:linear-gradient(135deg, #0D1424 0%, #162032 100%); border:1px solid rgba(56,189,248,0.3); border-radius:16px; padding:1.5rem; margin-bottom:1.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.25rem; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
                <div style="display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;">
                    <div style="width:60px; height:60px; border-radius:14px; background:linear-gradient(135deg, #070B14 0%, #1E293B 100%); border:1.5px solid #38BDF8; display:flex; align-items:center; justify-content:center; box-shadow:0 0 18px rgba(56,189,248,0.35);">
                        <i class="fas ${vocab.icon}" style="font-size:1.8rem; color:#38BDF8;"></i>
                    </div>
                    <div>
                        <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; margin-bottom:0.35rem;">
                            <h1 style="color:#38BDF8; margin:0; font-size:1.75rem; font-weight:800;">${caps.nombre_empresa}</h1>
                            <span class="badge" style="background:rgba(56,189,248,0.15); border:1px solid #38BDF8; color:#38BDF8; padding:0.35rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.8rem;">
                                <i class="fas fa-user-graduate"></i> Instructor Acreditado
                            </span>
                        </div>
                        <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; font-size:0.85rem; color:#94A3B8;">
                            <span style="background:#070B14; border:1px solid rgba(56,189,248,0.25); padding:0.25rem 0.75rem; border-radius:12px; color:#38BDF8; font-weight:700;">
                                <i class="fas ${natureInfo.icon}"></i> ${natureInfo.label}
                            </span>
                            <span style="color:#94A3B8;"><i class="fa-solid fa-shield-halved" style="color:#38BDF8;"></i> ${vocab.title}</span>
                        </div>
                    </div>
                </div>

                <div style="background:#070B14; border:1px solid rgba(56,189,248,0.35); padding:0.6rem 1rem; border-radius:16px; text-align:right;">
                    <div style="color:#38BDF8; font-size:0.85rem; font-weight:800; display:flex; align-items:center; gap:0.5rem; justify-content:flex-end;">
                        <i class="fas ${isCultural ? 'fa-palette' : 'fa-running'}"></i> ${vocab.vocationLabel}
                        <i class="fas fa-lock" style="color:#F59E0B;" title="Vocación fija de la organización"></i>
                    </div>
                    <span style="font-size:0.72rem; color:#94A3B8;">Telemetría Scoped a Mis Alumnos</span>
                </div>
            </div>

            <!-- Módulo Power BI Personalizado (Acotado estrictamente a sus alumnos) -->
            <div class="bento-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:1.25rem; margin-bottom:1.75rem;">
                <div class="bento-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">MIS ALUMNOS A CARGO</span>
                    <h3 style="color:#38BDF8; font-size:2.1rem; font-weight:800; margin:0.3rem 0;">${vocab.myStudentsCount}</h3>
                    <div style="font-size:0.75rem; color:#34D399;"><i class="fas fa-users"></i> Asignación Docente Verificada</div>
                </div>
                <div class="bento-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">TASA ASISTENCIA PROMEDIO</span>
                    <h3 style="color:#34D399; font-size:2.1rem; font-weight:800; margin:0.3rem 0;">${vocab.attendanceRate}</h3>
                    <div style="font-size:0.75rem; color:#34D399;"><i class="fas fa-check-circle"></i> Sincronizado PWA Offline</div>
                </div>
                <div class="bento-card" style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <span style="color:#94A3B8; font-size:0.75rem; font-weight:700; text-transform:uppercase;">HORAS CUMPILIDAS EN AÑO</span>
                    <h3 style="color:#38BDF8; font-size:2.1rem; font-weight:800; margin:0.3rem 0;">${vocab.hoursTaught} hrs</h3>
                    <div style="font-size:0.75rem; color:#38BDF8;"><i class="fas fa-clock"></i> Cumplimiento Horario 100%</div>
                </div>
            </div>

            <!-- Control de Asistencia Diaria & Alerta Temprana de Deserción -->
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem; margin-bottom:1.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
                    <div>
                        <h3 style="color:#38BDF8; margin:0; font-size:1.2rem; font-weight:800;"><i class="fas fa-user-check"></i> Roster de Mis Alumnos & Alerta de Deserción</h3>
                        <span style="font-size:0.75rem; color:#94A3B8;">Detector automático al acumular 3 faltas consecutivas</span>
                    </div>
                    <button class="btn-primary" style="min-height:40px; padding:0 1.25rem;" onclick="alert('Iniciando toma de asistencia masiva PWA.')"><i class="fas fa-check-square"></i> Tomar Asistencia Sesión Hoy</button>
                </div>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Estudiante</th>
                            <th>Nombre Completo</th>
                            <th>Asistencia %</th>
                            <th>Estado de Asistencia & Alerta</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>#101</strong></td>
                            <td>Mateo Andrés Ríos</td>
                            <td>98.5%</td>
                            <td><span class="badge" style="background:rgba(34,197,94,0.15); border:1px solid #34D399; color:#34D399;"><i class="fas fa-check-circle"></i> Excelente Asistencia</span></td>
                            <td><button class="btn-secondary" style="min-height:32px; padding:0.2rem 0.5rem; font-size:0.8rem;">Ver Ficha</button></td>
                        </tr>
                        <tr>
                            <td><strong>#102</strong></td>
                            <td>Sofía Valentina Cruz</td>
                            <td>65.0%</td>
                            <td>
                                <span class="badge" style="background:rgba(245,158,11,0.2); border:1px solid #F59E0B; color:#FBBF24; font-weight:800; padding:0.35rem 0.75rem; border-radius:12px;">
                                    <i class="fas fa-exclamation-triangle"></i> Riesgo de Deserción — Contactar Acudiente (3 Faltas)
                                </span>
                            </td>
                            <td><button class="btn-primary" style="min-height:32px; padding:0.2rem 0.5rem; font-size:0.8rem; background:#F59E0B; color:#070B14;" onclick="alert('Contactando a Acudiente: Sra. Maria Cruz (Tel: 3115928401)')"><i class="fas fa-phone"></i> Contactar</button></td>
                        </tr>
                        <tr>
                            <td><strong>#103</strong></td>
                            <td>Gabriel Esteban Morales</td>
                            <td>92.0%</td>
                            <td><span class="badge" style="background:rgba(34,197,94,0.15); border:1px solid #34D399; color:#34D399;"><i class="fas fa-check-circle"></i> Regular Confirmada</span></td>
                            <td><button class="btn-secondary" style="min-height:32px; padding:0.2rem 0.5rem; font-size:0.8rem;">Ver Ficha</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Planificador Curricular Anual de 52 Semanas -->
            <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.5rem; margin-bottom:1.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.75rem;">
                    <div>
                        <h3 style="color:#38BDF8; margin:0; font-size:1.2rem; font-weight:800;"><i class="fas fa-calendar-alt"></i> Planificador Curricular Anual (52 Semanas)</h3>
                        <span style="font-size:0.75rem; color:#94A3B8;">Programación técnico-pedagógica semana a semana</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <label style="color:#94A3B8; font-size:0.85rem;">Seleccionar Semana:</label>
                        <select id="select-semana-curriculo" onchange="window.updateCurriculumWeekView(this.value)" style="background:#070B14; border:1px solid #38BDF8; border-radius:8px; padding:0.4rem 0.75rem; color:#38BDF8; font-weight:700;">
                            ${Array.from({length: 52}, (_, i) => `<option value="${i+1}">Semana ${i+1}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="curriculum-week-container" style="background:#070B14; border:1px solid rgba(56,189,248,0.2); border-radius:12px; padding:1.25rem;">
                    <h4 style="color:#38BDF8; margin:0 0 0.5rem 0;" id="curr-week-title">Semana 1: Fundamentación y Diagnóstico Biométrico / Técnico</h4>
                    <p style="color:#94A3B8; font-size:0.88rem; margin:0.25rem 0;"><strong>Objetivo de la Sesión:</strong> Evaluación de movilidad, postura corporal e iniciación de patrones de movimiento básicos.</p>
                    <p style="color:#94A3B8; font-size:0.88rem; margin:0.25rem 0;"><strong>Estructura:</strong> Calentamiento dinámico (15 min) -> Técnica específica (45 min) -> Vuelta a la calma y estiramiento (15 min).</p>
                    <p style="color:#38BDF8; font-size:0.85rem; margin-top:0.5rem;"><strong>Implementos Requeridos:</strong> Cronómetros, petos / matas de yoga, planillas de registro.</p>
                </div>
            </div>

            <!-- Custodia de Elementos & Solicitud de Escenarios -->
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.25rem;">
                <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <h4 style="color:#38BDF8; margin:0 0 0.75rem 0; font-size:1.05rem;"><i class="fas fa-boxes"></i> Elementos Bajo Mi Custodia Docente</h4>
                    <ul style="color:#94A3B8; font-size:0.85rem; line-height:1.8; padding-left:1.25rem; margin:0;">
                        <li>Peto Taekwondo Reversible #SER-001 (<strong style="color:#34D399;">Recibido OK</strong>)</li>
                        <li>Set de Balones Calibrados #SER-010 (<strong style="color:#34D399;">Recibido OK</strong>)</li>
                    </ul>
                    <button class="btn-secondary" style="width:100%; margin-top:1rem; min-height:36px; padding:0.4rem; font-size:0.8rem;" onclick="alert('Solicitando devolución al Almacén.')">Solicitar Devolución a Almacén</button>
                </div>

                <div style="background:#0D1424; border:1px solid rgba(56,189,248,0.25); border-radius:14px; padding:1.25rem;">
                    <h4 style="color:#38BDF8; margin:0 0 0.75rem 0; font-size:1.05rem;"><i class="fas fa-map-marker-alt"></i> Salones & Espacios Asignados</h4>
                    <p style="color:#94A3B8; font-size:0.85rem; margin:0.25rem 0;">Dojo de Tatami A (Martes y Jueves 14:00 - 16:00)</p>
                    <button class="btn-primary" style="width:100%; margin-top:1rem; min-height:36px; padding:0.4rem; font-size:0.8rem;" onclick="alert('Solicitud de franja horaria adicional enviada a Jefe de Escenarios.')">Solicitar Franja Extra</button>
                </div>
            </div>

        </div>
    `;
}

window.updateCurriculumWeekView = function(weekNum) {
    const titleEl = document.getElementById('curr-week-title');
    if (titleEl) {
        titleEl.textContent = `Semana ${weekNum}: Programación Técnica Específica y Progresión Cargas / Repertorio`;
    }
};

// --- Registro de Vistas para el Rol de Profesor / Instructor ---
if (typeof registerView === 'function') {
    registerView('profesor', 'gestionar-cursos', renderProfesorView);
    registerView('profesor', 'dashboard', renderProfesorView);
}
