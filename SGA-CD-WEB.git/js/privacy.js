// SGA-CD - Gestor de Consentimiento de Cookies y Privacidad
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Inject Cookie Banner if no consent stored
    if (!localStorage.getItem('sgacd_cookie_consent')) {
        showCookieBanner();
    }
});

function showCookieBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.backgroundColor = '#1e293b';
    banner.style.color = '#ffffff';
    banner.style.padding = '1.25rem 1.5rem';
    banner.style.zIndex = '999999';
    banner.style.boxShadow = '0 -4px 12px rgba(0,0,0,0.15)';
    banner.style.display = 'flex';
    banner.style.flexWrap = 'wrap';
    banner.style.alignItems = 'center';
    banner.style.justifyContent = 'space-between';
    banner.style.gap = '1rem';
    banner.style.fontSize = '0.9rem';

    banner.innerHTML = `
        <div style="flex: 1 1 500px;">
            <strong>Protección de Datos y Cookies en SGA-CD</strong>
            <p style="margin: 0.25rem 0 0 0; color: #cbd5e1;">
                Utilizamos cookies técnicas estrictamente necesarias para autenticación y funcionamiento del sistema SaaS.
                Los datos de estudiantes desde los 5 años están resguardados con acceso exclusivo para la institución, instructores asignados y padres/acudientes.
                Consulta nuestra <a href="privacy.html" style="color: #4ade80; text-decoration: underline;" target="_blank">Política de Privacidad</a> y <a href="terms.html" style="color: #4ade80; text-decoration: underline;" target="_blank">Términos</a>.
            </p>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button id="accept-cookies-btn" style="background-color: #00A651; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; font-weight: bold; cursor: pointer;">
                Aceptar Todo
            </button>
            <button id="reject-cookies-btn" style="background-color: #475569; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer;">
                Sólo Esenciales
            </button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('accept-cookies-btn').addEventListener('click', () => {
        localStorage.setItem('sgacd_cookie_consent', 'accepted_all');
        banner.remove();
    });

    document.getElementById('reject-cookies-btn').addEventListener('click', () => {
        localStorage.setItem('sgacd_cookie_consent', 'essential_only');
        banner.remove();
    });
}
