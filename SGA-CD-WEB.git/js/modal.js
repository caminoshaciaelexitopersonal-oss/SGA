// --- Lógica Mejorada para el Modal Genérico ---

/**
 * Abre el modal con un título y contenido específico.
 * Esta función es segura de usar porque busca los elementos del DOM cada vez que se llama.
 * @param {string} title - El título a mostrar en el header del modal.
 * @param {string} bodyContent - El contenido HTML a insertar en el cuerpo del modal.
 */
function openModal(title, bodyContent) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalTitle || !modalBody) {
        console.error("No se encontraron los elementos del modal en el DOM.");
        // Fallback de emergencia si el modal no existe.
        alert(`${title}\n\n${(bodyContent || '').replace(/<[^>]*>/g, '')}`);
        return;
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyContent;
    modal.style.display = 'flex'; // Usar flex para centrar, como en la app principal.
}

/**
 * Cierra el modal y limpia su contenido para evitar datos residuales.
 */
function closeModal() {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (modal) {
        modal.style.display = 'none';
    }
    if (modalTitle) {
        modalTitle.textContent = '';
    }
    if (modalBody) {
        modalBody.innerHTML = '';
    }
}

/**
 * Configura los listeners para el modal.
 * Se debe llamar una vez que el DOM esté completamente cargado.
 */
function setupModalListeners() {
    const modal = document.getElementById('generic-modal');
    // El botón de cierre en app.html tiene id 'modal-close-btn' pero el css lo selecciona como .modal-close
    const closeModalButton = document.getElementById('modal-close-btn') || document.querySelector('.modal-close');

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    // Cierra el modal si se hace clic en el overlay (el fondo oscuro)
    if (modal) {
        modal.addEventListener('click', (event) => {
            // El overlay en app.html es el div con id 'generic-modal' y clase 'modal-overlay'
            if (event.target.id === 'generic-modal') {
                closeModal();
            }
        });
    }
}

// Aseguramos que los listeners se configuren solo cuando el DOM esté listo.
// Esto evita errores si el script se carga antes de que el HTML del modal exista.
document.addEventListener('DOMContentLoaded', setupModalListeners);
