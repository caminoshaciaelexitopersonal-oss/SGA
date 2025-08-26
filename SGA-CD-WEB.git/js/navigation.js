// --- Definición de la Estructura de Navegación por Rol ---

const navLinks = {
    // Rol 1: Super Admin
    admin_general: [
        { text: 'Dashboard', icon: 'fa-home' },
        { text: 'Gestionar Empresas', icon: 'fa-building' },
        { text: 'Roles y Permisos', icon: 'fa-shield-alt' },
        { text: 'Verificar Roles BD', icon: 'fa-database' },
        { text: 'Auditoría General', icon: 'fa-history' },
        { text: 'Gestión de Cobros', icon: 'fa-credit-card' },
        { text: 'Promociones', icon: 'fa-tags' }
    ],
    // Rol 2: Admin de Empresa
    admin_empresa: [
        { text: 'Dashboard', icon: 'fa-tachometer-alt' },
        { text: 'Gestionar Usuarios', icon: 'fa-users-cog' },
        { text: 'Gestionar Áreas', icon: 'fa-sitemap' },
        { text: 'Reportes', icon: 'fa-chart-bar' },
        { text: 'Auditoría de Empresa', icon: 'fa-history' }
    ],
    // Rol 3: Jefe de Área
    jefe_area: [
        { text: 'Dashboard de Área', icon: 'fa-tachometer-alt' },
        { text: 'Gestionar Personal', icon: 'fa-users' },
        { text: 'Eventos y Salidas', icon: 'fa-calendar-alt' },
        { text: 'Disciplinas/Modalidades', icon: 'fa-project-diagram' },
        { text: 'Inscripciones', icon: 'fa-user-plus' },
        { text: 'Gamificación', icon: 'fa-gamepad' },
        { text: 'Reportes de Área', icon: 'fa-chart-pie' }
    ],
    // Rol 4: Profesional de Área
    profesional_area: [
        { text: 'Dashboard', icon: 'fa-tachometer-alt' },
        { text: 'Supervisar Actividades', icon: 'fa-tasks' },
        { text: 'Gestionar Eventos', icon: 'fa-calendar-plus' },
        { text: 'Gestionar Disciplinas', icon: 'fa-edit' },
        { text: 'Reportes', icon: 'fa-chart-line' }
    ],
    // Rol 5: Técnico o Asistente de Área
    tecnico_area: [
        { text: 'Dashboard', icon: 'fa-tachometer-alt' },
        { text: 'Ver Actividades', icon: 'fa-eye' },
        { text: 'Gestionar Eventos', icon: 'fa-calendar-check' },
        { text: 'Ver Disciplinas', icon: 'fa-search' },
        { text: 'Reportes', icon: 'fa-file-alt' }
    ],
    // Rol 6: Coordinador
    coordinador: [
        { text: 'Planificación', icon: 'fa-calendar-day' },
        { text: 'Verificar Programación', icon: 'fa-clipboard-check' },
        { text: 'Enviar Reportes', icon: 'fa-paper-plane' },
        { text: 'Aprobaciones', icon: 'fa-check-double' }
    ],
    // Rol 7: Profesor
    profesor: [
        { text: 'Mi Cronograma', icon: 'fa-calendar-week' },
        { text: 'Gestionar Alumnos', icon: 'fa-user-graduate' },
        { text: 'Registrar Asistencia', icon: 'fa-user-check' },
        { text: 'Calificaciones', icon: 'fa-marker' },
        { text: 'Solicitudes', icon: 'fa-envelope-open-text' },
        { text: 'Gamificación', icon: 'fa-trophy' }
    ],
    // Rol 8: Alumno
    alumno: [
        { text: 'Mis Cursos', icon: 'fa-book-reader' },
        { text: 'Mi Horario', icon: 'fa-clock' },
        { text: 'Mis Calificaciones', icon: 'fa-star' },
        { text: 'Gamificación', icon: 'fa-gamepad' },
        { text: 'Solicitar Elementos', icon: 'fa-hand-holding' }
    ],
    // Rol 9: Padre o Acudiente
    padre_acudiente: [
        { text: 'Mis Alumnos', icon: 'fa-child' },
        { text: 'Inscripciones', icon: 'fa-file-signature' },
        { text: 'Autorizaciones', icon: 'fa-user-edit' },
        { text: 'Reportes de Progreso', icon: 'fa-chart-bar' }
    ],
    // Rol 10: Jefe de Almacén
    jefe_almacen: [
        { text: 'Dashboard Inventario', icon: 'fa-boxes' },
        { text: 'Registrar Movimientos', icon: 'fa-dolly-flatbed' },
        { text: 'Stock y Reposición', icon: 'fa-sort-amount-up' },
        { text: 'Hojas de Vida', icon: 'fa-file-invoice' },
        { text: 'Reportes de Inventario', icon: 'fa-file-excel' }
    ],
    // Rol 11: Almacenista (hereda de jefe_almacen, pero con menos permisos)
    almacenista: [
        { text: 'Ver Inventario', icon: 'fa-boxes' },
        { text: 'Registrar Movimientos', icon: 'fa-dolly-flatbed' }
    ],
    // Rol 12: Jefe de Escenarios
    jefe_escenarios: [
        { text: 'Calendario de Escenarios', icon: 'fa-calendar-alt' },
        { text: 'Asignar Espacios', icon: 'fa-map-marker-alt' },
        { text: 'Mantenimiento', icon: 'fa-tools' }
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
        // El atributo data-view será usado para cargar el contenido dinámicamente
        navHtml += `<a href="#" data-view="${link.text.toLowerCase().replace(/ /g, '-')}">
                        <i class="fas ${link.icon}"></i>
                        <span>${link.text}</span>
                    </a>`;
    });

    navContainer.innerHTML = navHtml;
}
