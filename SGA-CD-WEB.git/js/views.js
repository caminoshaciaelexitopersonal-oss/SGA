/* ==========================================================================
   Router de Vistas SGA-CD (merge resuelto)
   - Unifica ramas: feat/implement-all-missing-views  +  main
   - Elimina marcadores de conflicto y conserva compatibilidad
   - Provee stubs seguros para TODAS las funciones referenciadas
   ========================================================================== */

/* --- Config defensiva --- */
const config = (typeof window !== 'undefined' && window.config) ? window.config : {
  apiBaseUrl: '/api' // cambia esto si tu backend vive en otra ruta
};

/* --- Utils mínimos para modales (no-op si ya existen en otro archivo) --- */
if (typeof window !== 'undefined') {
  window.__SGACD_MODAL__ = window.__SGACD_MODAL__ || { open: null, close: null };
}

function openModal(title, bodyHtml) {
  // Si tu proyecto ya tiene sistema de modales, conecta aquí.
  // Fallback simple:
  const id = 'sgacd-modal';
  let modal = document.getElementById(id);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = id;
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.background = 'rgba(0,0,0,.45)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
      <div id="sgacd-modal-card" style="background:#fff;max-width:800px;width:95%;border-radius:12px;padding:16px;">
        <h3 style="margin:0 0 8px 0">${title || 'Modal'}</h3>
        <div id="sgacd-modal-body"></div>
        <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px">
          <button id="sgacd-modal-close">Cerrar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'sgacd-modal' || e.target.id === 'sgacd-modal-close') closeModal();
    });
  }
  modal.querySelector('#sgacd-modal-body').innerHTML = bodyHtml || '';
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('sgacd-modal');
  if (modal) modal.style.display = 'none';
}

/* --- Helpers de UI --- */
function htmlInfoCard(title, text) {
  return `
    <div class="card">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}

/* ==========================================================================
   Router principal de vistas
   ========================================================================== */

// Esta función actuará como un enrutador del lado del cliente
async function renderContentForView(viewName, token, roleName = 'default') {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  // Limpiar el área de contenido anterior
  contentArea.innerHTML = '<h2>Cargando...</h2>';

  try {
    // Un gran switch para manejar todas las vistas
    switch (viewName) {
      // Vistas para admin_empresa
      case 'panel-empresa':
        await renderAdminEmpresaView(token);
        break;

      // Vistas para jefe_area
      case 'panel-area':
        await renderJefeAreaView(token);
        break;

      case 'dashboard':
        contentArea.innerHTML = await getDashboardView();
        break;

      case 'gestionar-usuarios':
        contentArea.innerHTML = await getGestionarUsuariosView(token);
        setupGestionarUsuariosListeners(token);
        break;

      case 'gestionar-áreas':
        contentArea.innerHTML = await getGestionarAreasView(token);
        setupGestionarAreasListeners(token);
        break;

      case 'reportes':
        contentArea.innerHTML = '<h2>Reportes</h2><p>Aquí se mostrarán los reportes de la empresa.</p>';
        break;

      // Vistas para jefe_area
      case 'eventos-y-salidas':
        contentArea.innerHTML = await getEventosSalidasView(token);
        break;

      // Vistas para profesor
      case 'gestionar-cursos':
        await renderProfesorView(token);
        break;

      case 'gamificación':
        // La vista de gamificación depende del rol del usuario
        if (roleName === 'alumno') {
          contentArea.innerHTML = await getGamificacionAlumnoView(token);
        } else if (['jefe_area', 'profesional_area'].includes(roleName)) {
          contentArea.innerHTML = await getGamificacionAdminView(token);
          setupGamificacionAdminListeners(token);
        } else if (roleName === 'profesor') {
          contentArea.innerHTML = await getGamificacionProfesorView(token);
          setupGamificacionProfesorListeners(token);
        } else {
          contentArea.innerHTML = '<h2>Gamificación</h2><p>La vista de gamificación no está configurada para tu rol.</p>';
        }
        break;

      case 'gestionar-alumnos':
        contentArea.innerHTML = await getGestionarAlumnosView(token);
        break;

      // Vistas para alumno
      case 'mis-cursos':
        await renderMisCursosView(token);
        break;

      case 'mi-horario':
        await renderMiHorarioView(token);
        break;

      case 'mis-calificaciones':
        await renderMisCalificacionesView(token);
        break;

      // Vistas para padre_acudiente
      case 'mis-alumnos':
        await renderPadreAcudienteView(token);
        break;

      // Vistas para coordinador
      case 'planificacion':
      case 'verificar-programacion':
      case 'aprobaciones':
      case 'enviar-reportes':
        await renderCoordinadorView(viewName, token);
        break;

      // Vistas para Roles de Soporte de Área (Profesional y Técnico)
      case 'supervisar-actividades': // solo profesional
      case 'gestionar-eventos': // ambos
      case 'gestionar-disciplinas': // solo profesional
      case 'ver-actividades': // solo tecnico
      case 'ver-disciplinas': // solo tecnico
        if (roleName === 'profesional_area') {
          await renderProfesionalAreaView(viewName, token);
        } else if (roleName === 'tecnico_area') {
          await renderTecnicoAreaView(viewName, token);
        }
        break;

      // Vistas para Roles de Logística (Almacén)
      case 'dashboard-inventario':
      case 'registrar-movimientos':
      case 'stock-y-reposicion':
      case 'hojas-de-vida':
      case 'reportes-de-inventario':
      case 'ver-inventario':
        if (roleName === 'jefe_almacen') {
          await renderJefeAlmacenView(viewName, token);
        } else if (roleName === 'almacenista') {
          await renderAlmacenistaView(viewName, token);
        }
        break;

      // Vistas para jefe_escenarios
      case 'calendario-de-escenarios':
      case 'asignar-espacios':
      case 'mantenimiento':
        await renderJefeEscenariosView(viewName, token);
        break;

      // Vistas para admin_general
      case 'verificar-roles-bd':
        contentArea.innerHTML = await getVerificarRolesView(token);
        setupVerificarRolesListeners(token);
        break;

      case 'auditoría-general': // STAR
        contentArea.innerHTML = await getAuditoriaView(token);
        break;

      // Vistas genéricas
      case 'asistente-de-ia': // Agente de IA
        contentArea.innerHTML = await getAsistenteIAView();
        break;

      default:
        contentArea.innerHTML = `<h2>Vista no encontrada: ${viewName}</h2><p>La vista solicitada no existe o no está configurada.</p>`;
    }
  } catch (error) {
    console.error(`Error al renderizar la vista ${viewName}:`, error);
    contentArea.innerHTML = `<p style="color: red;">Error al cargar el contenido: ${error.message}</p>`;
  }
}

/* ==========================================================================
   Vistas reales (con lógica) ya presentes en tu código
   ========================================================================== */

async function getDashboardView() {
  // En un caso real, esto podría obtener estadísticas de la API
  return `
    <h2>Dashboard Principal</h2>
    <p>Bienvenido a la plataforma SGA-CD. Aquí verás un resumen de la actividad de tu organización.</p>
    <!-- Aquí podrían ir tarjetas con estadísticas -->
  `;
}

async function getGestionarUsuariosView(token) {
  // Asumo un endpoint /api/v1/users para obtener la lista de usuarios de la empresa
  const response = await fetch(`${config.apiBaseUrl}/api/v1/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('No se pudo obtener la lista de usuarios.');

  const users = await response.json();

  let userRows = '';
  if (users && users.length > 0) {
    userRows = users.map(user => `
      <tr>
        <td>${user.id}</td>
        <td>${user.nombre_completo || user.username}</td>
        <td>${user.email}</td>
        <td>${user.rol?.nombre ?? '—'}</td>
        <td>
          <button class="btn-editar-usuario" data-user-id="${user.id}">Editar</button>
          <button class="btn-eliminar-usuario" data-user-id="${user.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } else {
    userRows = '<tr><td colspan="5">No se encontraron usuarios.</td></tr>';
  }

  return `
    <h2>Gestionar Usuarios de la Empresa</h2>
    <button id="btn-anadir-usuario">Añadir Nuevo Usuario</button>
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${userRows}
      </tbody>
    </table>
  `;
}

async function getAuditoriaView(token) {
  // Propuesta para el módulo STAR (Auditoría de Logs)
  let logsHtml;
  try {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/audit-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("El endpoint de auditoría no está disponible.");

    const logs = await response.json();
    logsHtml = (logs || []).map(log => `
      <tr>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td>${log.user?.username ?? '—'}</td>
        <td>${log.action}</td>
        <td>${log.details}</td>
      </tr>
    ).join('');
  } catch (error) {
    // Mock data en caso de que la API falle (que lo hará, porque no existe)
    logsHtml = `
      <tr>
        <td>${new Date().toLocaleString()}</td>
        <td>admin_empresa_1</td>
        <td>UPDATE_USER</td>
        <td>Se actualizó el rol del usuario 'profesor_2' a 'coordinador'.</td>
      </tr>
      <tr>
        <td>${new Date().toLocaleString()}</td>
        <td>jefe_area_cultura</td>
        <td>CREATE_EVENT</td>
        <td>Se creó el evento 'Festival de Teatro'.</td>
      </tr>
    `;
  }

  return `
    <h2><i class="fas fa-history"></i> Visor de Auditoría (STAR)</h2>
    <p>Esta es una propuesta de integración para el módulo de auditoría. Los datos mostrados son de ejemplo.</p>
    <table class="data-table">
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Usuario</th>
          <th>Acción</th>
          <th>Detalles</th>
        </tr>
      </thead>
      <tbody>
        ${logsHtml}
      </tbody>
    </table>
  `;
}

async function getAsistenteIAView() {
  // Propuesta para el módulo de Agente de IA (LangChain)
  return `
    <h2><i class="fas fa-robot"></i> Asistente de IA</h2>
    <p>Propuesta de integración para un agente de IA conversacional. La lógica de backend se conectaría a un servicio como LangChain.</p>
    <div class="chat-container">
      <div class="chat-box" id="ai-chat-box">
        <div class="chat-message bot">
          <p>Hola, soy el asistente virtual de SGA-CD. ¿Cómo puedo ayudarte hoy?</p>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" id="ai-chat-input" placeholder="Escribe tu pregunta...">
        <button id="ai-chat-send">Enviar</button>
      </div>
    </div>
  `;
}

function setupVerificarRolesListeners(token) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  contentArea.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-crear-rol')) {
      const rolNombre = e.target.dataset.rolNombre;

      const modalBodyContent = `
        <form id="crear-rol-form">
          <p>Estás a punto de crear el rol que falta:</p>
          <input type="text" id="rol-nombre-input" value="${rolNombre}" readonly>
          <textarea id="rol-descripcion-input" placeholder="Añade una descripción para el rol..." required></textarea>
          <button type="submit">Confirmar Creación</button>
        </form>
        <div id="modal-feedback"></div>
      `;

      openModal(`Crear Rol: ${rolNombre}`, modalBodyContent);

      const form = document.getElementById('crear-rol-form');
      form.addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
        const feedbackDiv = document.getElementById('modal-feedback');
        feedbackDiv.textContent = 'Creando rol...';

        try {
          const response = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              nombre: rolNombre,
              descripcion: document.getElementById('rol-descripcion-input').value
            })
          });

          const result = await response.json();

          if (response.ok) {
            feedbackDiv.className = 'message-success';
            feedbackDiv.textContent = '¡Rol creado exitosamente! La vista se refrescará.';
            setTimeout(() => {
              closeModal();
              renderContentForView('verificar-roles-bd', token);
            }, 1200);
          } else {
            throw new Error(result.detail || 'Error desconocido del servidor');
          }
        } catch (error) {
          feedbackDiv.className = 'message-error';
          feedbackDiv.textContent = `Error: ${error.message}`;
        }
      });
    }
  });
}

function setupMisCursosListeners(token) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  contentArea.addEventListener('click', async (e) => {
    if (e.target.id === 'btn-inscribirse-curso') {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo obtener la lista de cursos disponibles.');
        const cursosDisponibles = await response.json();

        let cursosHtml = 'No hay cursos disponibles para inscripción.';
        if (cursosDisponibles && cursosDisponibles.length > 0) {
          cursosHtml = cursosDisponibles.map(curso => `
            <div class="curso-disponible">
              <h4>${curso.nombre}</h4>
              <p>${curso.descripcion}</p>
              <button class="btn-inscribir" data-curso-id="${curso.id}">Inscribirme</button>
            </div>
          `).join('');
        }

        const modalBodyContent = `
          <div id="lista-cursos-disponibles">
            ${cursosHtml}
          </div>
          <div id="modal-feedback"></div>
        `;
        openModal('Inscribirse a un Nuevo Curso', modalBodyContent);

      } catch (error) {
        openModal('Error', `<p class="message-error">${error.message}</p>`);
      }
    }

    if (e.target.classList.contains('btn-inscribir')) {
      const cursoId = e.target.dataset.cursoId;
      const feedbackDiv = document.querySelector('#lista-cursos-disponibles').nextElementSibling;
      feedbackDiv.textContent = 'Inscribiendo...';

      try {
        const response = await fetch(`${config.apiBaseUrl}/api/v1/cursos/${cursoId}/inscribir`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'No se pudo completar la inscripción.');
        }
        feedbackDiv.className = 'message-success';
        feedbackDiv.textContent = '¡Inscripción exitosa!';
        setTimeout(() => {
          closeModal();
          renderContentForView('mis-cursos', token);
        }, 900);
      } catch (error) {
        feedbackDiv.className = 'message-error';
        feedbackDiv.textContent = `Error: ${error.message}`;
      }
    }
  });
}

/* ==========================================================================
   Stubs/Implementaciones mínimas para TODAS las funciones referenciadas
   (evitan ReferenceError y muestran contenido básico)
   Reemplaza gradualmente por sus módulos reales.
   ========================================================================== */

async function renderAdminEmpresaView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Panel Empresa</h2>
    ${htmlInfoCard('Resumen', 'Aquí irá el panel para administradores de empresa.')}
  `;
}

async function renderJefeAreaView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Panel Jefe de Área</h2>
    ${htmlInfoCard('Tareas', 'Aquí irán tareas y métricas del área.')}
  `;
}

async function renderProfesorView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Gestionar Cursos (Profesor)</h2>
    <p>Vista simplificada para gestión de cursos por parte del profesor.</p>
    <button id="btn-crear-curso">Crear Curso</button>
    <div id="profesor-cursos-list" style="margin-top:8px;">(lista de cursos...)</div>
  `;
  setupGestionarCursosListeners(token);
}

async function renderMisCursosView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Mis Cursos</h2>
    <div id="mis-cursos-list">(aquí tus cursos actuales)</div>
    <button id="btn-inscribirse-curso">Inscribirse a nuevo curso</button>
  `;
  setupMisCursosListeners(token);
}

async function renderMiHorarioView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Mi Horario</h2>
    <p>Tu horario aparecerá aquí.</p>
  `;
}

async function renderMisCalificacionesView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Mis Calificaciones</h2>
    <p>Tus calificaciones aparecerán aquí.</p>
  `;
}

async function renderPadreAcudienteView(token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Mis Alumnos</h2>
    <p>Listado y progreso de tus acudidos.</p>
  `;
}

async function renderCoordinadorView(viewName, token) {
  const el = document.getElementById('content-area');
  const etiquetas = {
    'planificacion': 'Planificación',
    'verificar-programacion': 'Verificar Programación',
    'aprobaciones': 'Aprobaciones',
    'enviar-reportes': 'Enviar Reportes'
  };
  el.innerHTML = `
    <h2>Coordinación: ${etiquetas[viewName] || viewName}</h2>
    <p>Contenido de coordinación para: ${etiquetas[viewName] || viewName}.</p>
  `;
}

async function renderProfesionalAreaView(viewName, token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Profesional de Área</h2>
    <p>Vista: ${viewName}</p>
  `;
}

async function renderTecnicoAreaView(viewName, token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Técnico de Área</h2>
    <p>Vista: ${viewName}</p>
  `;
}

async function renderJefeAlmacenView(viewName, token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Jefe de Almacén</h2>
    <p>Vista de logística: ${viewName}</p>
  `;
}

async function renderAlmacenistaView(viewName, token) {
  const el = document.getElementById('content-area');
  el.innerHTML = `
    <h2>Almacenista</h2>
    <p>Vista de logística: ${viewName}</p>
  `;
}

async function renderJefeEscenariosView(viewName, token) {
  const el = document.getElementById('content-area');
  const label = {
    'calendario-de-escenarios': 'Calendario de Escenarios',
    'asignar-espacios': 'Asignar Espacios',
    'mantenimiento': 'Mantenimiento'
  }[viewName] || viewName;

  el.innerHTML = `
    <h2>Jefe de Escenarios: ${label}</h2>
    <p>Contenido básico para ${label}.</p>
  `;
}

/* --- Placeholders de funciones que la rama main declaraba pero no estaban implementadas --- */

async function getGestionarCursosView(token) {
  return `
    <h2>Gestionar Cursos</h2>
    <p>(Placeholder) Aquí podrás crear, editar y eliminar cursos.</p>
  `;
}

function setupGestionarCursosListeners(token) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;
  contentArea.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-crear-curso') {
      openModal('Crear Curso', `
        <form id="form-crear-curso">
          <input type="text" id="curso-nombre" placeholder="Nombre del curso" required />
          <textarea id="curso-descripcion" placeholder="Descripción"></textarea>
          <button type="submit">Guardar</button>
        </form>
        <div id="modal-feedback"></div>
      `);
      const form = document.getElementById('form-crear-curso');
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fb = document.getElementById('modal-feedback');
        fb.textContent = 'Guardando...';
        try {
          const res = await fetch(`${config.apiBaseUrl}/api/v1/cursos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              nombre: document.getElementById('curso-nombre').value,
              descripcion: document.getElementById('curso-descripcion').value
            })
          });
          if (!res.ok) throw new Error('Error al crear curso');
          fb.className = 'message-success';
          fb.textContent = 'Curso creado';
          setTimeout(closeModal, 900);
        } catch (err) {
          fb.className = 'message-error';
          fb.textContent = err.message;
        }
      });
    }
  });
}

async function fetchJefesDeArea(token) {
  try {
    const res = await fetch(`${config.apiBaseUrl}/api/v1/jefes-area`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudieron obtener jefes de área');
    return await res.json();
  } catch (e) {
    return [];
  }
}

function setupGestionarAreasListeners(token) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;
  contentArea.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btn-crear-area') {
      openModal('Crear Área', `
        <form id="form-crear-area">
          <input id="area-nombre" placeholder="Nombre del área" required />
          <button type="submit">Guardar</button>
        </form>
        <div id="modal-feedback"></div>
      `);
      const form = document.getElementById('form-crear-area');
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fb = document.getElementById('modal-feedback');
        fb.textContent = 'Guardando...';
        try {
          const res = await fetch(`${config.apiBaseUrl}/api/v1/areas`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: document.getElementById('area-nombre').value })
          });
          if (!res.ok) throw new Error('No se pudo crear el área');
          fb.className = 'message-success';
          fb.textContent = 'Área creada';
          setTimeout(closeModal, 900);
        } catch (err) {
          fb.className = 'message-error';
          fb.textContent = err.message;
        }
      });
    }
  });
}

async function fetchRoles(token) {
  try {
    const res = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudieron obtener roles');
    return await res.json();
  } catch (e) {
    return [];
  }
}

function setupGestionarUsuariosListeners(token) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  contentArea.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-eliminar-usuario')) {
      const id = e.target.dataset.userId;
      if (!confirm(`¿Eliminar usuario #${id}?`)) return;
      try {
        const res = await fetch(`${config.apiBaseUrl}/api/v1/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('No se pudo eliminar');
        renderContentForView('gestionar-usuarios', token);
      } catch (err) {
        openModal('Error', `<p class="message-error">${err.message}</p>`);
      }
    }

    if (e.target && e.target.id === 'btn-anadir-usuario') {
      openModal('Añadir Usuario', `
        <form id="form-crear-usuario">
          <input required id="u-nombre" placeholder="Nombre completo o username" />
          <input required id="u-email" type="email" placeholder="Email" />
          <button type="submit">Crear</button>
        </form>
        <div id="modal-feedback"></div>
      `);
      document.getElementById('form-crear-usuario').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fb = document.getElementById('modal-feedback');
        fb.textContent = 'Creando...';
        try {
          const res = await fetch(`${config.apiBaseUrl}/api/v1/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              username: document.getElementById('u-nombre').value,
              email: document.getElementById('u-email').value
            })
          });
          if (!res.ok) throw new Error('No se pudo crear el usuario');
          fb.className = 'message-success';
          fb.textContent = 'Usuario creado';
          setTimeout(() => {
            closeModal();
            renderContentForView('gestionar-usuarios', token);
          }, 900);
        } catch (err) {
          fb.className = 'message-error';
          fb.textContent = err.message;
        }
      });
    }
  });
}

async function getGestionarAreasView(token) {
  const jefes = await fetchJefesDeArea(token);
  const options = (jefes || []).map(j => `<option value="${j.id}">${j.nombre || j.username || ('Jefe '+j.id)}</option>`).join('');
  return `
    <h2>Gestionar Áreas</h2>
    <button id="btn-crear-area">Crear Área</button>
    <div style="margin-top:8px;">
      <label>Asignar Jefe de Área: </label>
      <select>${options || '<option>(sin datos)</option>'}</select>
    </div>
  `;
}

async function getEventosSalidasView(token) {
  return `
    <h2>Eventos y Salidas</h2>
    <p>(Placeholder) Listado de eventos y acciones para crearlos/gestionarlos.</p>
  `;
}

async function getGestionarAlumnosView(token) {
  return `
    <h2>Gestionar Alumnos</h2>
    <p>(Placeholder) CRUD de alumnos, filtros y acciones.</p>
  `;
}

async function getMisCursosView(token) {
  return `
    <h3>Mis Cursos (parcial)</h3>
    <p>Usa el botón "Inscribirse a nuevo curso" de la vista.</p>
  `;
}

async function getGamificacionAdminView(token) {
  return `
    <h2>Gamificación (Admin/Área)</h2>
    <p>(Placeholder) Configura reglas, puntos y recompensas.</p>
  `;
}

function setupGamificacionAdminListeners(token) {
  // Placeholder: listeners para formularios/reglas de gamificación
}

async function getGamificacionProfesorView(token) {
  return `
    <h2>Gamificación (Profesor)</h2>
    <p>(Placeholder) Herramientas para asignar badges y puntos a estudiantes.</p>
  `;
}

function setupGamificacionProfesorListeners(token) {
  // Placeholder
}

async function getGamificacionAlumnoView(token) {
  return `
    <h2>Mi Gamificación</h2>
    <p>(Placeholder) Progreso, puntos y recompensas del estudiante.</p>
  `;
}

async function getVerificarRolesView(token) {
  const roles = await fetchRoles(token);
  const faltantes = ['admin_general','admin_empresa','jefe_area','profesor','alumno']
    .filter(r => !(roles || []).some(x => (x.nombre || x) === r));
  const rows = (roles || []).map(r => `
    <tr><td>${r.id ?? '—'}</td><td>${r.nombre ?? r}</td><td>${r.descripcion ?? '—'}</td></tr>
  `).join('');
  const faltHtml = faltantes.length
    ? faltantes.map(n => `<button class="btn-crear-rol" data-rol-nombre="${n}">Crear rol: ${n}</button>`).join(' ')
    : '<em>No hay roles faltantes detectados.</em>';
  return `
    <h2>Verificar Roles en la BD</h2>
    <table class="data-table">
      <thead><tr><th>ID</th><th>Nombre</th><th>Descripción</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">(sin datos)</td></tr>'}</tbody>
    </table>
    <div style="margin-top:8px;">${faltHtml}</div>
  `;
}

/* Nota histórica:
   En la rama feat/implement-all-missing-views se indicaba que ciertas funciones
   quedaban obsoletas y se movían a archivos por rol (p.ej. jefe_escenarios.js).
   Para evitar errores en el merge y mientras migras, mantenemos stubs aquí.
   Cuando integres los módulos por rol, elimina los stubs duplicados. */