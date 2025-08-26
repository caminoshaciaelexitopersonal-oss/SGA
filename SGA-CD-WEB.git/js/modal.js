// --- Lógica para el Modal Genérico ---

const modal = document.getElementById('generic-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('modal-close-btn');

/**
 * Abre el modal con un título y contenido específico.
 * @param {string} title - El título a mostrar en el header del modal.
 * @param {string} bodyContent - El contenido HTML a insertar en el cuerpo del modal.
 */
function openModal(title, bodyContent) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyContent;
    modal.style.display = 'flex';
}

/**
 * Cierra el modal.
 */
function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modalTitle.textContent = '';
    modalBody.innerHTML = '';
}

// Event Listeners para cerrar el modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Cerrar el modal si se hace clic fuera del contenido
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}
