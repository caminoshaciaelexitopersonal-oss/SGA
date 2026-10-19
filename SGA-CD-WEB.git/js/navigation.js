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
                { text: 'Config. WhatsApp Cloud', view: 'configuracion-whatsapp', icon: 'fab fa-whatsapp' },
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
                { text: 'Verificar Roles BD', view: 'verificar-roles', icon: 'fa-database' }
            ]
        },
        {
            text: 'Configuración y Seguridad',
            icon: 'fa-cog',
            submenu: [
                { text: 'Proveedores de IA & Ollama', view: 'gestion-api-keys', icon: 'fa-key' },
                { text: 'Auditoría General', view: 'auditoria', icon: 'fa-history' },
                { text: 'Asistente de IA', view: 'asistente-ia', icon: 'fa-robot' }
            ]
        }
    ],
    // Rol 2: Admin de Empresa
    admin_empresa: [
        { text: 'Panel de Empresa', view: 'panel-empresa', icon: 'fa-tachometer-alt' },
        { text: 'Suscripción y Pagos', view: 'suscripcion', icon: 'fa-credit-card' },
        { text: 'Reportes', view: 'reportes-empresa', icon: 'fa-chart-bar' },
        { text: 'Auditoría', view: 'auditoria-empresa', icon: 'fa-history' },
        { text: 'Configuración', view: 'config-empresa', icon: 'fa-cog' }
    ],
    // Rol 3: Jefe de Área
    jefe_area: [
        { text: 'Panel de Área', view: 'panel-area', icon: 'fa-tachometer-alt' },
        { text: 'Reportes', view: 'reportes-area', icon: 'fa-chart-pie' },
        { text: 'Configuración', view: 'config-area', icon: 'fa-cog' }
    ],
    // Rol 4: Profesional de Área
    profesional_area: [
        { text: 'Dashboard', view: 'dashboard', icon: 'fa-tachometer-alt' },
        { text: 'Supervisar Actividades', view: 'supervisar-actividades', icon: 'fa-tasks' },
        { text: 'Gestionar Eventos', view: 'gestionar-eventos', icon: 'fa-calendar-plus' },
        { text: 'Gestionar Disciplinas Deportivas y Modalidades', view: 'gestionar-disciplinas', icon: 'fa-edit' },
        { text: 'Reportes', view: 'reportes-operativos', icon: 'fa-chart-line' }
    ],
    // Rol 5: Técnico o Asistente de Área
    tecnico_area: [
        { text: 'Dashboard', view: 'dashboard', icon: 'fa-tachometer-alt' },
        { text: 'Ver Actividades', view: 'asistir-gestion-usuarios', icon: 'fa-eye' },
        { text: 'Gestionar Eventos', view: 'gestionar-eventos', icon: 'fa-calendar-check' },
        { text: 'Ver Disciplinas Deportivas y Modalidades', view: 'gestionar-disciplinas', icon: 'fa-search' },
        { text: 'Reportes', view: 'reportes-operativos', icon: 'fa-file-alt' }
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
                const subView = sub.view || sub.text.toLowerCase().replace(/ /g, '-');
                subHtml += `<a href="#" data-view="${subView}" class="nav-subitem" tabindex="0">
                                <i class="fas ${sub.icon}"></i>
                                <span class="nav-text">${sub.text}</span>
                            </a>`;
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
