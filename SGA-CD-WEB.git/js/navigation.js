// --- Definición de la Estructura de Navegación por Rol ---

const navLinks = {
    // Rol 1: Super Admin (Estructurado con Submenús Jerárquicos)
    admin_general: [
        {
            text: 'Panel de Control',
            icon: 'fa-home',
            submenu: [
                { text: 'Resumen General', view: 'dashboard', icon: 'fa-chart-pie' },
                { text: 'Indicadores del Sistema', view: 'dashboard', icon: 'fa-tachometer-alt' }
            ]
        },
        {
            text: 'Gestión de Landing Page',
            icon: 'fa-sliders-h',
            submenu: [
                { text: 'Editor Comercial & Planes', view: 'gestor-landing', icon: 'fa-edit' },
                { text: 'Metadatos SEO Públicos', view: 'gestor-landing', icon: 'fa-search-dollar' }
            ]
        },
        {
            text: 'Marketing y Crecimiento',
            icon: 'fa-bullhorn',
            submenu: [
                { text: 'CRM & Campañas Social', view: 'dashboard', icon: 'fa-paper-plane' },
                { isHeader: true, text: '3.1. Motor de envió masivo' },
                { text: 'Generador de Videos IA (Predis)', view: 'motor-predis-media', icon: 'fas fa-magic' },
                { text: 'Config. Creacion de videos Cloud', view: 'motor-predis-media', icon: 'fas fa-video' },
                { text: 'Config. Creacion de imágenes Cloud', view: 'motor-predis-media', icon: 'fas fa-image' },
                { text: 'Config. Creacion de Reals Cloud', view: 'motor-predis-media', icon: 'fas fa-film' },
                { isHeader: true, text: '3.2. Motor de ADS' },
                { text: 'Config. WhatsApp Cloud', view: 'configuracion-whatsapp', icon: 'fab fa-whatsapp' },
                { text: 'Config. iNSTAGRAM Cloud', view: 'gestion-api-keys', icon: 'fab fa-instagram' },
                { text: 'Config. TIK TOK Cloud', view: 'gestion-api-keys', icon: 'fab fa-tiktok' },
                { text: 'Config. Gmail Cloud', view: 'gestion-api-keys', icon: 'fas fa-envelope' },
                { text: 'Config. X Cloud', view: 'gestion-api-keys', icon: 'fab fa-x-twitter' },
                { text: 'Config. Youtobe Cloud', view: 'gestion-api-keys', icon: 'fab fa-youtube' },
                { text: 'Promociones y Ofertas', view: 'promociones', icon: 'fa-tags' }
            ]
        },
        {
            text: 'Gestión Financiera',
            icon: 'fa-credit-card',
            submenu: [
                { text: 'Cobros y Transacciones', view: 'suscripcion', icon: 'fa-file-invoice-dollar' },
                { text: 'Suscripciones Activas', view: 'suscripcion', icon: 'fa-users-cog' }
            ]
        },
        {
            text: 'Usuarios y Permisos',
            icon: 'fa-user-shield',
            submenu: [
                { text: 'Gestionar Empresas', view: 'panel-empresa', icon: 'fa-building' },
                { text: 'Roles y Permisos', view: 'roles-permisos', icon: 'fa-shield-alt' },
                { text: 'Verificar Roles BD', view: 'verificar-roles-bd', icon: 'fa-database' }
            ]
        },
        {
            text: 'Configuración y Seguridad',
            icon: 'fa-cog',
            submenu: [
                { text: 'Proveedores de IA & Ollama', view: 'gestion-api-keys', icon: 'fa-key' },
                { text: 'Auditoría General', view: 'auditoria-empresa', icon: 'fa-history' },
                { text: 'Asistente de IA', view: 'asistente-ia', icon: 'fa-robot' }
            ]
        }
    ],
    // Rol 2: Admin de Empresa (Estructura Categorizada con Submenús)
    admin_empresa: [
        {
            text: 'PANEL PRINCIPAL',
            icon: 'fa-chart-pie',
            submenu: [
                { text: 'Dashboard General', view: 'panel-empresa', icon: 'fa-chart-pie' },
                { text: 'Indicadores de Gestión', view: 'panel-empresa', icon: 'fa-tachometer-alt' }
            ]
        },
        {
            text: 'GESTIÓN OPERATIVA',
            icon: 'fa-tasks',
            submenu: [
                { text: 'Escuelas Deportivas', view: 'programas-deportivos', icon: 'fa-running' },
                { text: 'Talleres Culturales', view: 'talleres-culturales', icon: 'fa-palette' },
                { text: 'Sedes y Escenarios', view: 'areas-empresa', icon: 'fa-map-marked-alt' }
            ]
        },
        {
            text: 'TALENTO Y USUARIOS',
            icon: 'fa-users-cog',
            submenu: [
                { text: 'Personal y Profesores', view: 'usuarios-empresa', icon: 'fa-users-cog' },
                { text: 'Roster de Estudiantes', view: 'usuarios-empresa', icon: 'fa-user-graduate' }
            ]
        },
        {
            text: 'MARKETING Y CRM',
            icon: 'fa-bullhorn',
            submenu: [
                { text: 'Campañas y Captación', view: 'crm-empresa', icon: 'fa-bullhorn' },
                { text: 'Generador Multimedia IA', view: 'media-ia-empresa', icon: 'fa-photo-video' }
            ]
        },
        {
            text: 'CONFIGURACIÓN Y CONTROL',
            icon: 'fa-shield-alt',
            submenu: [
                { text: 'Suscripción y Pagos', view: 'suscripcion', icon: 'fa-credit-card' },
                { text: 'Auditoría y Seguridad', view: 'auditoria-empresa', icon: 'fa-shield-alt' }
            ]
        }
    ],
    // Rol 3: Jefe de Área (Estructura Categorizada de 5 Bloques)
    jefe_area: [
        {
            text: 'PANEL PRINCIPAL',
            icon: 'fa-chart-pie',
            submenu: [
                { text: 'Dashboard de Área', view: 'panel-area', icon: 'fa-tachometer-alt' },
                { text: 'Indicadores Operativos', view: 'panel-area', icon: 'fa-chart-line' }
            ]
        },
        {
            text: 'GESTIÓN OPERATIVA',
            icon: 'fa-tasks',
            submenu: [
                { text: 'Disciplinas / Talleres Activos', view: 'panel-area', icon: 'fa-running' },
                { text: 'Supervisión de Clases', view: 'panel-area', icon: 'fa-clipboard-list' }
            ]
        },
        {
            text: 'TALENTO Y EQUIPO',
            icon: 'fa-users-cog',
            submenu: [
                { text: 'Gestionar Personal de Área', view: 'panel-area', icon: 'fa-user-plus' }
            ]
        },
        {
            text: 'LOGÍSTICA Y RECURSOS',
            icon: 'fa-boxes',
            submenu: [
                { text: 'Escenarios y Espacios', view: 'panel-area', icon: 'fa-map-marked-alt' },
                { text: 'Inventario de Área', view: 'panel-area', icon: 'fa-dolly-flatbed' }
            ]
        },
        {
            text: 'CONTROL Y AUDITORÍA',
            icon: 'fa-shield-alt',
            submenu: [
                { text: 'Trazabilidad de Operaciones', view: 'panel-area', icon: 'fa-history' }
            ]
        }
    ],
    // Rol 4: Profesional de Área (Estructura Categorizada de 5 Bloques)
    profesional_area: [
        {
            text: 'PANEL PRINCIPAL',
            icon: 'fa-chart-pie',
            submenu: [
                { text: 'Dashboard Profesional', view: 'dashboard', icon: 'fa-tachometer-alt' },
                { text: 'Indicadores Técnicos', view: 'dashboard', icon: 'fa-chart-bar' }
            ]
        },
        {
            text: 'GESTIÓN OPERATIVA',
            icon: 'fa-tasks',
            submenu: [
                { text: 'Supervisar Actividades', view: 'supervisar-actividades', icon: 'fa-tasks' },
                { text: 'Gestionar Eventos', view: 'gestionar-eventos', icon: 'fa-calendar-plus' },
                { text: 'Disciplinas y Modalidades', view: 'gestionar-disciplinas', icon: 'fa-edit' }
            ]
        },
        {
            text: 'TALENTO Y EQUIPO',
            icon: 'fa-users-cog',
            submenu: [
                { text: 'Personal Operativo', view: 'dashboard', icon: 'fa-user-check' }
            ]
        },
        {
            text: 'LOGÍSTICA Y RECURSOS',
            icon: 'fa-boxes',
            submenu: [
                { text: 'Sedes y Espacios', view: 'supervisar-actividades', icon: 'fa-map-marker-alt' }
            ]
        },
        {
            text: 'CONTROL Y AUDITORÍA',
            icon: 'fa-shield-alt',
            submenu: [
                { text: 'Reportes Operativos', view: 'reportes-operativos', icon: 'fa-chart-line' }
            ]
        }
    ],
    // Rol 5: Técnico de Área (Estructura Categorizada de 5 Bloques)
    tecnico_area: [
        {
            text: 'PANEL PRINCIPAL',
            icon: 'fa-chart-pie',
            submenu: [
                { text: 'Dashboard Técnico', view: 'dashboard', icon: 'fa-tachometer-alt' },
                { text: 'Estado Operativo', view: 'dashboard', icon: 'fa-wrench' }
            ]
        },
        {
            text: 'GESTIÓN OPERATIVA',
            icon: 'fa-tasks',
            submenu: [
                { text: 'Ver Actividades', view: 'asistir-gestion-usuarios', icon: 'fa-eye' },
                { text: 'Gestionar Eventos', view: 'gestionar-eventos', icon: 'fa-calendar-check' },
                { text: 'Ver Disciplinas y Modalidades', view: 'gestionar-disciplinas', icon: 'fa-search' }
            ]
        },
        {
            text: 'TALENTO Y EQUIPO',
            icon: 'fa-users-cog',
            submenu: [
                { text: 'Apoyo a Personal', view: 'asistir-gestion-usuarios', icon: 'fa-users-cog' }
            ]
        },
        {
            text: 'LOGÍSTICA Y RECURSOS',
            icon: 'fa-boxes',
            submenu: [
                { text: 'Mantenimiento de Escenarios', view: 'gestionar-eventos', icon: 'fa-tools' }
            ]
        },
        {
            text: 'CONTROL Y AUDITORÍA',
            icon: 'fa-shield-alt',
            submenu: [
                { text: 'Reportes Operativos', view: 'reportes-operativos', icon: 'fa-file-alt' }
            ]
        }
    ],
    // Rol 6: Coordinador
    coordinador: [
        { text: 'Planificación', view: 'planificacion', icon: 'fa-calendar-day' },
        { text: 'Verificar Programación', view: 'verificar-programacion', icon: 'fa-clipboard-check' },
        { text: 'Aprobaciones', view: 'aprobaciones', icon: 'fa-check-double' },
        { text: 'Gestionar Misiones', view: 'misiones', icon: 'fa-tasks' }
    ],
    // Rol 7: Profesor
    profesor: [
        { text: 'Gestionar Cursos', view: 'gestionar-cursos', icon: 'fa-chalkboard-teacher' },
        { text: 'Gestionar Alumnos', view: 'gestionar-alumnos', icon: 'fa-user-graduate' },
        { text: 'Calificaciones', view: 'calificaciones', icon: 'fa-marker' },
        { text: 'Gamificación', view: 'gamificacion', icon: 'fa-trophy' },
        { text: 'Suscripción y Plan', view: 'suscripcion', icon: 'fa-credit-card' }
    ],
    // Rol 8: Alumno
    alumno: [
        { text: 'Mis Cursos', view: 'mis-cursos', icon: 'fa-book-reader' },
        { text: 'Mi Horario', view: 'mi-horario', icon: 'fa-clock' },
        { text: 'Mis Calificaciones', view: 'mis-calificaciones', icon: 'fa-star' },
        { text: 'Asistencia PWA', view: 'mi-asistencia', icon: 'fa-check-circle' },
        { text: 'Mi Progreso', view: 'mi-progreso', icon: 'fa-gamepad' },
        { text: 'Misiones', view: 'misiones', icon: 'fa-tasks' },
        { text: 'Mercado de Puntos', view: 'mercado', icon: 'fa-store' }
    ],
    // Rol 9: Padre o Acudiente
    padre_acudiente: [
        { text: 'Mis Alumnos', view: 'mis-alumnos', icon: 'fa-child' },
        { text: 'Inscripciones', view: 'mis-alumnos', icon: 'fa-file-signature' },
        { text: 'Autorizaciones', view: 'mis-alumnos', icon: 'fa-user-edit' },
        { text: 'Reportes de Progreso', view: 'mis-alumnos', icon: 'fa-chart-bar' }
    ],
    // Rol 10: Jefe de Almacén
    jefe_almacen: [
        { text: 'Dashboard Inventario', view: 'dashboard-inventario', icon: 'fa-boxes' },
        { text: 'Registrar Movimientos', view: 'registrar-movimientos', icon: 'fa-dolly-flatbed' },
        { text: 'Stock y Reposición', view: 'stock-y-reposicion', icon: 'fa-sort-amount-up' },
        { text: 'Hojas de Vida', view: 'hojas-de-vida', icon: 'fa-file-invoice' },
        { text: 'Reportes de Inventario', view: 'reportes-de-inventario', icon: 'fa-file-excel' }
    ],
    // Rol 11: Almacenista (hereda de jefe_almacen, pero con menos permisos)
    almacenista: [
        { text: 'Ver Inventario', view: 'ver-inventario', icon: 'fa-boxes' },
        { text: 'Registrar Movimientos', view: 'registrar-movimientos', icon: 'fa-dolly-flatbed' }
    ],
    // Rol 12: Jefe de Escenarios
    jefe_escenarios: [
        { text: 'Calendario de Escenarios', view: 'calendario-de-escenarios', icon: 'fa-calendar-alt' },
        { text: 'Asignar Espacios', view: 'asignar-espacios', icon: 'fa-map-marker-alt' },
        { text: 'Mantenimiento', view: 'mantenimiento', icon: 'fa-tools' }
    ],
    // Rol por defecto si no se encuentra uno
    default: [
        { text: 'Mi Perfil', icon: 'fa-user' }
    ]
};

function renderNavigation(roleName) {
    const navContainer = document.getElementById('app-nav');
    if (!navContainer) return;

    const links = navLinks[roleName] || navLinks.default;

    let navHtml = '';
    links.forEach(link => {
        if (link.submenu && Array.isArray(link.submenu)) {
            // Renderizar grupo con submenú
            let subHtml = '';
            link.submenu.forEach(sub => {
                if (sub.isHeader) {
                    subHtml += `<div class="nav-submenu-header" style="color:#38BDF8; font-size:0.75rem; font-weight:800; text-transform:uppercase; tracking:0.05em; padding:0.6rem 0.85rem 0.2rem 0.85rem; border-top:1px solid rgba(56,189,248,0.1); margin-top:0.3rem;">
                                    ${sub.text}
                                </div>`;
                } else {
                    const subView = sub.view || sub.text.toLowerCase().replace(/ /g, '-');
                    subHtml += `<a href="#" data-view="${subView}" class="nav-subitem" tabindex="0">
                                    <i class="fas ${sub.icon}"></i>
                                    <span class="nav-text">${sub.text}</span>
                                </a>`;
                }
            });

            navHtml += `<div class="nav-group">
                            <button class="nav-group-title" aria-expanded="false" tabindex="0">
                                <span><i class="fas ${link.icon}"></i> <span class="nav-text">${link.text}</span></span>
                                <i class="fas fa-chevron-down nav-arrow"></i>
                            </button>
                            <div class="nav-submenu">
                                ${subHtml}
                            </div>
                        </div>`;
        } else {
            // Renderizar enlace plano
            const viewName = link.view || link.text.toLowerCase().replace(/ /g, '-');
            navHtml += `<a href="#" data-view="${viewName}" tabindex="0">
                            <i class="fas ${link.icon}"></i>
                            <span class="nav-text">${link.text}</span>
                        </a>`;
        }
    });

    navContainer.innerHTML = navHtml;
    setupSubmenuInteractions(navContainer);
}

function setupSubmenuInteractions(navContainer) {
    // Interacción Click/Touch para desplegar submenús
    navContainer.querySelectorAll('.nav-group-title').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const group = btn.closest('.nav-group');
            const isOpen = group.classList.contains('open');

            // Cerrar otros grupos
            navContainer.querySelectorAll('.nav-group').forEach(g => g.classList.remove('open'));
            if (!isOpen) {
                group.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Accesibilidad por Teclado
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}
