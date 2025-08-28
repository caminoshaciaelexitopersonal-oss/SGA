/* ==========================================================================
   Archivo de Vistas Principales SGA-CD
   Recreado por Jules para resolver un error de sintaxis fatal.
   Contiene solo la lógica esencial del router y las vistas que no
   están en módulos individuales (ej. la vista de admin_general).
   ========================================================================== */

/* --- Config defensiva --- */
const config = (typeof window !== 'undefined' && window.config) ? window.config : {
  apiBaseUrl: '/api'
};

/* --- Utils de Modales --- */
function openModal(title, bodyHtml) {
  const id = 'generic-modal';
  let modal = document.getElementById(id);
  if (!modal) {
    console.error("El HTML del modal genérico no se encontró en el DOM.");
    // Fallback simple si el modal principal no existe
    alert(`${title}\n\n${bodyHtml.replace(/<[^>]*>/g, '')}`);
    return;
  }

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('generic-modal');
  if (modal) modal.style.display = 'none';
}


/* ==========================================================================
   Router principal de vistas
   ========================================================================== */
async function renderContentForView(viewName, token, roleName = 'default') {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) {
    console.error("El área de contenido principal #content-area no fue encontrada.");
    return;
  }

  contentArea.innerHTML = '<h2>Cargando...</h2>';

  try {
    // Un switch para manejar las vistas.
    // Las vistas como 'mis-cursos' son manejadas por sus propios archivos
    // (ej. alumno.js) que son cargados en app.html.
    // Este router solo necesita manejar las vistas que no tienen su propio archivo.
    switch (viewName) {
      // Vistas para admin_general
      case 'verificar-roles-bd':
        contentArea.innerHTML = await getVerificarRolesView(token);
        setupVerificarRolesListeners(token);
        break;

      // Vistas de Gamificación Social
      case 'misiones':
        await renderMisionesView(token);
        break;

      case 'mercado':
        await renderMercadoView(token);
        break;

      // Se pueden añadir otros casos aquí si es necesario para vistas
      // que no tengan su propio archivo modular.
      default:
        // Si la vista no es manejada aquí, se asume que un script modular
        // (como alumno.js, profesor.js) la manejará.
        // Si después de un momento no carga nada, mostramos un error.
        setTimeout(() => {
          if (contentArea.innerHTML === '<h2>Cargando...</h2>') {
            contentArea.innerHTML = `<h2>Vista no encontrada: ${viewName}</h2><p>La vista solicitada no fue encontrada o no está configurada en el router principal.</p>`;
          }
        }, 500);
        break;
    }
  } catch (error) {
    console.error(`Error al renderizar la vista ${viewName}:`, error);
    contentArea.innerHTML = `<p style="color: red;">Error al cargar el contenido: ${error.message}</p>`;
  }
}

/* ==========================================================================
   Funciones de la Vista para Admin General
   ========================================================================== */

async function fetchRoles(token) {
  try {
    const res = await fetch(`${config.apiBaseUrl}/api/v1/roles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudieron obtener roles');
    return await res.json();
  } catch (e) {
    console.error("Error en fetchRoles:", e);
    return []; // Devuelve un array vacío en caso de error para no romper la renderización
  }
}

async function getVerificarRolesView(token) {
  const roles = await fetchRoles(token);
  const rolesRequeridos = [
    'admin_general', 'admin_empresa', 'jefe_area',
    'profesional_area', 'tecnico_area', 'coordinador',
    'profesor', 'alumno', 'padre_acudiente',
    'jefe_almacen', 'almacenista', 'jefe_escenarios'
  ];

  const faltantes = rolesRequeridos.filter(r => !(roles || []).some(x => x.nombre === r));

  const rows = (roles || []).map(r => `
    <tr>
      <td>${r.id ?? '—'}</td>
      <td>${r.nombre ?? 'N/A'}</td>
      <td>${r.descripcion ?? '—'}</td>
    </tr>
  `).join('');

  const faltHtml = faltantes.length
    ? `<div class="missing-roles">${faltantes.map(n => `<button class="btn-primary btn-crear-rol" data-rol-nombre="${n}">Crear rol: ${n}</button>`).join(' ')}</div>`
    : '<p class="message-success">¡Excelente! Todos los roles requeridos existen en la base de datos.</p>';

  return `
    <div class="view-header">
        <h2><i class="fas fa-user-shield"></i> Verificar Roles en la BD</h2>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="3">No se encontraron roles.</td></tr>'}
      </tbody>
    </table>
    <div class="actions-footer">
        <h3>Roles Faltantes</h3>
        ${faltHtml}
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
          <input type="text" id="rol-nombre-input" class="form-input" value="${rolNombre}" readonly>
          <textarea id="rol-descripcion-input" class="form-textarea" placeholder="Añade una descripción para el rol..." required></textarea>
          <div class="form-actions">
            <button type="submit" class="btn-primary">Confirmar Creación</button>
          </div>
        </form>
        <div id="modal-feedback" class="modal-feedback"></div>
      `;

      openModal(`Crear Rol: ${rolNombre}`, modalBodyContent);

      const form = document.getElementById('crear-rol-form');
      form.addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
        const feedbackDiv = document.getElementById('modal-feedback');
        feedbackDiv.textContent = 'Creando rol...';
        feedbackDiv.className = 'modal-feedback message-info';

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
            feedbackDiv.className = 'modal-feedback message-success';
            feedbackDiv.textContent = '¡Rol creado exitosamente! La vista se refrescará.';
            setTimeout(() => {
              closeModal();
              renderContentForView('verificar-roles-bd', token);
            }, 1200);
          } else {
            throw new Error(result.detail || 'Error desconocido del servidor');
          }
        } catch (error) {
          feedbackDiv.className = 'modal-feedback message-error';
          feedbackDiv.textContent = `Error: ${error.message}`;
        }
      });
    }
  });
}