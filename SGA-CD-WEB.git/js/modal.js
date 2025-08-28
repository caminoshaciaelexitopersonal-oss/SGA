// --- Lógica Mejorada para el Modal Genérico ---
function openModal(title, bodyContent) {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalTitle || !modalBody) {
        console.error("No se encontraron los elementos del modal en el DOM.");
        alert(`${title}\n\n${(bodyContent || '').replace(/<[^>]*>/g, '')}`);
        return;
    }
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyContent;
    modal.style.display = 'flex';
}
function closeModal() {
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (modal) { modal.style.display = 'none'; }
    if (modalTitle) { modalTitle.textContent = ''; }
    if (modalBody) { modalBody.innerHTML = ''; }
}
function setupModalListeners() {
    const modal = document.getElementById('generic-modal');
    const closeModalButton = document.getElementById('modal-close-btn') || document.querySelector('.modal-close');
    if (closeModalButton) { closeModalButton.addEventListener('click', closeModal); }
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target.id === 'generic-modal') {
                closeModal();
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', setupModalListeners);
