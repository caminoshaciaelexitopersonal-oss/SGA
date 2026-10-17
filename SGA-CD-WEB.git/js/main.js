document.addEventListener('DOMContentLoaded', () => {

    // --- XSS Escaping Helper ---
    function sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = String(str);
        return temp.innerHTML;
    }

    // --- 1. Load Dynamic Content from API ---
    async function loadAndRenderContent() {
        try {
            const response = await fetch(`${config.apiBaseUrl}/api/website/content`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.json();

            renderVideo(content.contact?.video_url);
            renderFeatures(content.features || []);
            renderPartners(content.partners || []);
            renderFaq(content.faq || []);
            renderPlans(content.plans || []);
            renderLaunchOffer(content.contact?.launch_offer_text);
            renderFooter(content.contact || {});

            // Initialize GSAP animations after DOM injection
            initializeGSAPAnimations();

        } catch (error) {
            console.warn("Using default fallback content for marketing page due to API offline state:", error);
            renderFallbackContent();
            initializeGSAPAnimations();
        }
    }

    function renderFallbackContent() {
        const defaultFeatures = [
            { titulo: "Gestión Roster Deportivo", descripcion: "Inscripciones a escuelas de formación, plantillas de torneos y acreditaciones digitales.", icono: "fa-solid fa-running" },
            { titulo: "Talleres Culturales", descripcion: "Inscripción a música, danza, teatro y control de asistencia para instructores y estudiantes.", icono: "fa-solid fa-masks-theater" },
            { titulo: "Diagnóstico Biométrico", descripcion: "Evaluación antropométrica, rendimiento físico y alertas preventivas de lesiones.", icono: "fa-solid fa-heart-pulse" },
            { titulo: "Reserva de Escenarios", descripcion: "Programación de canchas, coliseos y auditorios con control de aforo e inventario.", icono: "fa-solid fa-building-columns" },
            { titulo: "Gamificación & Logros", descripcion: "Insignias, cuadro de medallería y clasificaciones por rendimiento académico-deportivo.", icono: "fa-solid fa-award" },
            { titulo: "Multi-Inquilino Seguro", descripcion: "Aislamiento estricto de datos por empresa, seguridad JWT y derechos ARCO.", icono: "fa-solid fa-shield-halved" }
        ];

        const defaultPlans = [
            { nombre: "Básico", precio_mensual: "0", descripcion: "Para pequeñas academias y clubes deportivos locales.", caracteristicas: '["Hasta 100 alumnos", "Gestión de asistencia", "1 Escenario deportivo"]', recomendado: false },
            { nombre: "Profesional Institucional", precio_mensual: "149", precio_anual: "1490", descripcion: "Para instituciones educativas y redes culturales.", caracteristicas: '["Alumnos ilimitados", "Diagnóstico biométrico", "Reserva de escenarios", "Soporte prioritario"]', recomendado: true },
            { nombre: "Gubernamental / Enterprise", precio_mensual: "399", precio_anual: "3990", descripcion: "Para secretarías de deportes y municipios.", caracteristicas: '["Multi-inquilino dedicado", "SLA 99.9%", "Capacitación personalizada", "Integración API"]', recomendado: false }
        ];

        renderFeatures(defaultFeatures);
        renderPlans(defaultPlans);
        renderFaq([]);
        renderVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        renderLaunchOffer("¡Invita a 10 instituciones o empresas y recibe 6 meses de licenciamiento completamente gratis!");
        renderFooter({
            nombre_empresa: "SGA-CD Inc.",
            mission: "Democratizar la gestión deportiva y cultural mediante soluciones tecnológicas de alto rendimiento.",
            vision: "Ser la plataforma estándar de administración atlética y artística en Latinoamérica.",
            email_contacto: "contacto@sga-cd.org",
            telefono_contacto: "+57 (601) 800-7422",
            direccion: "Calle 100 #11B-27, Bogotá, Colombia"
        });
    }

    // --- RENDER FUNCTIONS WITH SANITIZATION ---
    function renderFeatures(features) {
        const grid = document.getElementById('features-grid');
        if (!grid) return;
        grid.innerHTML = '';

        features.forEach((feature, index) => {
            const card = document.createElement('div');
            card.className = `feature-card ${index === 0 ? 'bento-highlight' : ''}`;
            const iconClass = feature.icono ? sanitizeHTML(feature.icono) : 'fa-solid fa-star';

            card.innerHTML = `
                <i class="${iconClass}"></i>
                <h3>${sanitizeHTML(feature.titulo)}</h3>
                <p>${sanitizeHTML(feature.descripcion)}</p>
            `;
            grid.appendChild(card);
        });
    }

    function renderVideo(videoUrl) {
        const container = document.getElementById('video-container');
        if (!container || !videoUrl) return;

        let videoId = '';
        if (videoUrl.includes('youtube.com/watch?v=')) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        }

        if (videoId) {
            const cleanVideoId = sanitizeHTML(videoId);
            container.innerHTML = `
                <iframe
                    src="https://www.youtube-nocookie.com/embed/${cleanVideoId}"
                    title="Video Institucional SGA-CD"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>`;
        }
    }

    function renderPartners(partners) {
        const clientsGrid = document.getElementById('clients-grid');
        const testersGrid = document.getElementById('testers-grid');
        if (!clientsGrid || !testersGrid) return;

        clientsGrid.innerHTML = '';
        testersGrid.innerHTML = '';

        if (!partners || partners.length === 0) {
            clientsGrid.innerHTML = '<p style="color: var(--color-text-muted);">Academia Central de Deportes, Instituto de Cultura Municipal, Universidad del Deporte</p>';
            return;
        }

        partners.forEach(partner => {
            const partnerLogo = document.createElement('div');
            partnerLogo.className = 'partner-logo';
            const cleanName = sanitizeHTML(partner.nombre);
            const cleanLogo = sanitizeHTML(partner.logo_url);

            let innerHTML = `<img src="${cleanLogo}" alt="${cleanName}">`;
            if (partner.website_url) {
                innerHTML = `<a href="${sanitizeHTML(partner.website_url)}" target="_blank" rel="noopener noreferrer">${innerHTML}</a>`;
            }
            if (partner.es_autentico_verificado !== false) {
                innerHTML += `<div style="font-size:0.75rem; color: var(--color-accent-cyan); font-weight:bold; margin-top:0.25rem;"><i class="fa-solid fa-circle-check"></i> Verificado</div>`;
            }
            partnerLogo.innerHTML = innerHTML;

            if (partner.tipo === 'cliente') {
                clientsGrid.appendChild(partnerLogo);
            } else {
                testersGrid.appendChild(partnerLogo);
            }
        });
    }

    function renderPlans(plans) {
        const grid = document.getElementById('pricing-grid');
        if (!grid) return;
        grid.innerHTML = '';

        plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'plan-card' + (plan.recomendado ? ' recommended' : '');

            let featuresHtml = '';
            if (plan.caracteristicas) {
                try {
                    const features = typeof plan.caracteristicas === 'string' ? JSON.parse(plan.caracteristicas) : plan.caracteristicas;
                    featuresHtml = features.map(f => `<li><i class="fa-solid fa-check" style="color: var(--color-accent-cyan); margin-right: 0.5rem;"></i>${sanitizeHTML(f)}</li>`).join('');
                } catch (e) {
                    console.error("Could not parse plan features JSON:", e);
                }
            }

            const cleanNombre = sanitizeHTML(plan.nombre);
            const cleanPrecio = plan.precio_mensual ? `$${sanitizeHTML(plan.precio_mensual)}/mes` : 'Gratis';
            const cleanDescripcion = sanitizeHTML(plan.descripcion);

            card.innerHTML = `
                ${plan.recomendado ? '<div class="recommended-badge">Recomendado</div>' : ''}
                <h3>${cleanNombre}</h3>
                <p class="price">${cleanPrecio}</p>
                ${plan.precio_anual ? `<p style="font-size:0.85rem; color:var(--color-text-muted);">o $${sanitizeHTML(plan.precio_anual)}/año</p>` : ''}
                <p style="margin-top: 1rem;">${cleanDescripcion}</p>
                <ul>${featuresHtml}</ul>
                <a href="register.html" class="plan-button" style="width: 100%;">Seleccionar Plan</a>
            `;
            grid.appendChild(card);
        });
    }

    function renderLaunchOffer(offerText) {
        const container = document.getElementById('launch-offer-container');
        if (!container || !offerText) return;
        container.innerHTML = `<p style="font-size: 1.1rem; color: var(--color-text-primary); margin: 0;">${sanitizeHTML(offerText)}</p>`;
    }

    function renderFaq(faqs) {
        const container = document.getElementById('faq-container');
        if (!container) return;
        container.innerHTML = '';

        const faqData = (faqs && faqs.length > 0) ? faqs : [
            { pregunta: "¿Qué es la suite SGA-CD?", respuesta: "Es la plataforma integrada para la gestión de inscripciones deportivas, escuelas culturales, evaluación biológica y control de escenarios." },
            { pregunta: "¿Cómo funciona el aislamiento multi-inquilino?", respuesta: "Cada institución opera sobre una partición aislada garantizando privacidad de datos de menores y cumplimiento normativo ARCO." },
            { pregunta: "¿Qué metodos de pago y facturación soporta?", respuesta: "Integración con Stripe, PSE y pasarelas bancarias locales con facturación recurrente automatizada." },
            { pregunta: "¿Soporta uso en dispositivos móviles?", respuesta: "Sí, la plataforma cuenta con soporte PWA responsivo optimizado para tabletas y smartphones en campo." }
        ];

        faqData.forEach(faq => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <button class="faq-question">
                    <span>${sanitizeHTML(faq.pregunta)}</span>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.85rem;"></i>
                </button>
                <div class="faq-answer">
                    <p>${sanitizeHTML(faq.respuesta)}</p>
                </div>
            `;
            container.appendChild(faqItem);
        });

        container.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const answer = button.nextElementSibling;
                const icon = button.querySelector('i');
                const isOpen = answer.style.maxHeight;

                if (isOpen) {
                    answer.style.maxHeight = null;
                    if (icon) icon.style.transform = 'rotate(0deg)';
                } else {
                    answer.style.maxHeight = answer.scrollHeight + "px";
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    }

    function renderFooter(contact) {
        const companyContainer = document.getElementById('company-info');
        const contactContainer = document.getElementById('contact-info');
        const socialContainer = document.getElementById('social-media');
        const footer = document.getElementById('main-footer');

        if (companyContainer) {
            companyContainer.innerHTML = `
                <h4>${sanitizeHTML(contact.nombre_empresa || 'SGA-CD')}</h4>
                <h5>Misión</h5>
                <p>${sanitizeHTML(contact.mission || '')}</p>
                <h5>Visión</h5>
                <p>${sanitizeHTML(contact.vision || '')}</p>
            `;
        }
        if (contactContainer) {
            contactContainer.innerHTML = `
                <h4>Contacto Institucional</h4>
                <p>${sanitizeHTML(contact.direccion || '')}</p>
                <p>Email: <a href="mailto:${sanitizeHTML(contact.email_contacto)}">${sanitizeHTML(contact.email_contacto || '')}</a></p>
                <p>Teléfono: ${sanitizeHTML(contact.telefono_contacto || '')}</p>
            `;
        }
        if (socialContainer) {
            socialContainer.innerHTML = `
                <h4>Redes & Canales</h4>
                <div style="display:flex; gap:1rem; margin-top:0.5rem; font-size:1.2rem;">
                    <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
                </div>
            `;
        }
        if (footer) {
            const year = new Date().getFullYear();
            let copy = footer.querySelector('.footer-copy');
            if (!copy) {
                copy = document.createElement('p');
                copy.className = 'footer-copy';
                footer.appendChild(copy);
            }
            copy.innerHTML = `&copy; ${year} ${sanitizeHTML(contact.nombre_empresa || 'SGA-CD')}. Todos los derechos reservados.`;
        }
    }

    // --- 2. GSAP & ScrollTrigger Animations ---
    function initializeGSAPAnimations() {
        if (typeof gsap === 'undefined') return;

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Hero title & CTA entrance
        gsap.from('#hero .hero-title, #hero .hero-tagline, #hero .cta-button', {
            duration: 1,
            y: 30,
            opacity: 0,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // Animated Statistics Counter with ScrollTrigger
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target') || '0', 10);

            if (typeof ScrollTrigger !== 'undefined') {
                gsap.to(stat, {
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 85%'
                    },
                    duration: 2,
                    innerText: target,
                    snap: { innerText: 1 },
                    ease: 'power2.out',
                    onUpdate: function() {
                        const val = Math.ceil(this.targets()[0].innerText);
                        stat.innerText = val.toLocaleString() + (target >= 1000 ? '+' : '');
                    }
                });
            } else {
                stat.innerText = target.toLocaleString() + '+';
            }
        });

        // Feature & Plan Cards Reveal
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.from('.feature-card, .plan-card', {
                scrollTrigger: {
                    trigger: '#funcionalidades',
                    start: 'top 80%'
                },
                duration: 0.8,
                y: 40,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }
    }

    // --- 3. AI Sales Agent Chat Handler ---
    function initializeAIAgent() {
        const toggleButton = document.getElementById('ai-agent-toggle');
        const chatbox = document.getElementById('ai-agent-chatbox');
        const messagesContainer = document.getElementById('chatbox-messages');
        const sendButton = document.getElementById('chatbox-send');
        const inputField = document.getElementById('chatbox-input');

        if (!toggleButton || !chatbox) return;

        toggleButton.addEventListener('click', () => {
            const isHidden = chatbox.classList.contains('hidden');
            if (isHidden) {
                chatbox.classList.remove('hidden');
                toggleButton.setAttribute('aria-expanded', 'true');
                if (messagesContainer.children.length === 0) {
                    addMessage('agent-message', '¡Hola! Soy el asistente virtual de SGA-CD. ¿Deseas conocer más sobre nuestras escuelas deportivas, talleres o planes institucionales?');
                }
            } else {
                chatbox.classList.add('hidden');
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        });

        sendButton?.addEventListener('click', sendMessage);
        inputField?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        function sendMessage() {
            const rawText = inputField.value.trim();
            if (!rawText) return;

            const sanitizedMsg = sanitizeHTML(rawText);
            addMessage('user-message', sanitizedMsg);
            inputField.value = '';

            sendMessageToAgent(rawText);
        }

        function addMessage(typeClass, text) {
            const msgEl = document.createElement('div');
            msgEl.className = `chat-message ${typeClass}`;
            msgEl.textContent = text;
            messagesContainer.appendChild(msgEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return msgEl;
        }

        async function sendMessageToAgent(message) {
            const API_ENDPOINT = `${config.apiBaseUrl}/api/v1/sales_agent`;
            const thinkingMsg = addMessage('agent-message', 'Procesando consulta...');

            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: message })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                thinkingMsg.textContent = data.reply || 'SGA-CD ofrece soporte integral para gestión de deportes y cultura.';

            } catch (error) {
                console.warn('Fallback response for agent:', error);
                thinkingMsg.textContent = 'Ofrecemos planes desde $0 USD con soporte multi-inquilino, diagnósticos biométricos y control de escenarios.';
            }
        }
    }

    function initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registrado correctamente.', reg))
            .catch(err => console.log('Registro de Service Worker fallido:', err));
        }
    }

    // --- 4. Live Monitor & Telemetry Engine (Agent-Reach Integration) ---
    let liveMonitorEvents = [];

    async function loadLiveMonitor() {
        const monitorGrid = document.getElementById('monitor-grid');
        if (!monitorGrid) return;

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/v1/public/events`);
            if (response.ok) {
                liveMonitorEvents = await response.json();
            } else {
                throw new Error('API offline');
            }
        } catch (e) {
            // Default high-performance fallback feed
            liveMonitorEvents = [
                { id: 1, categoria: 'deporte', titulo: 'Copa Intercolegial de Taekwondo 2025', detalle: 'Fase eliminatoria regional - 48 atletas acreditados.', estado: 'En Vivo', icono: 'fa-solid fa-trophy' },
                { id: 2, categoria: 'cultura', titulo: 'Encuentro Nacional de Músicas Colombianas', detalle: 'Taller de vallenato y música andina en auditorio central.', estado: 'Programado', icono: 'fa-solid fa-music' },
                { id: 3, categoria: 'deporte', titulo: 'Torneo de Natación Infantil & Juvenil', detalle: 'Pruebas de 100m libres y relevos mixtos.', estado: 'En Vivo', icono: 'fa-solid fa-person-swimming' },
                { id: 4, categoria: 'cultura', titulo: 'Exposición de Artes Plásticas & Escultura', detalle: 'Muestra estudiantil anual en galería institucional.', estado: 'Inscripciones', icono: 'fa-solid fa-palette' },
                { id: 5, categoria: 'deporte', titulo: 'Liga de Baloncesto Institucional', detalle: 'Jornada 5: Selección A vs. Campus Norte.', estado: 'Programado', icono: 'fa-solid fa-basketball' },
                { id: 6, categoria: 'cultura', titulo: 'Muestra de Danza Folclórica & Contemporánea', detalle: 'Gala nocturna de clausura académica.', estado: 'Próximo', icono: 'fa-solid fa-masks-theater' }
            ];
        }

        renderLiveMonitor('all');
        setupFilterTabs();
    }

    function renderLiveMonitor(filterCategory) {
        const monitorGrid = document.getElementById('monitor-grid');
        if (!monitorGrid) return;

        const filtered = filterCategory === 'all'
            ? liveMonitorEvents
            : liveMonitorEvents.filter(ev => ev.categoria === filterCategory);

        monitorGrid.innerHTML = '';

        if (filtered.length === 0) {
            monitorGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No hay eventos disponibles en esta categoría.</p>';
            return;
        }

        filtered.forEach(ev => {
            const card = document.createElement('div');
            card.className = 'feature-card monitor-card';
            card.setAttribute('data-category', ev.categoria);

            const cleanTitle = sanitizeHTML(ev.titulo);
            const cleanDetalle = sanitizeHTML(ev.detalle);
            const cleanEstado = sanitizeHTML(ev.estado);
            const cleanIcon = sanitizeHTML(ev.icono || 'fa-solid fa-star');
            const socialPayload = encodeURIComponent(`¡Orgullo Institucional SGA-CD! Sigue los detalles de: ${ev.titulo} — ${ev.detalle} #SGACD #Deporte #Cultura`);

            card.innerHTML = `
                <div style="display:flex; justify-shadow:space-between; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                    <i class="${cleanIcon}" style="font-size:1.8rem; margin-bottom:0;"></i>
                    <span style="font-size:0.75rem; font-weight:700; padding:0.25rem 0.65rem; border-radius:12px; background:rgba(56,189,248,0.15); color:var(--color-accent-cyan); border:1px solid var(--color-border-specular);">
                        ${cleanEstado}
                    </span>
                </div>
                <h3>${cleanTitle}</h3>
                <p style="font-size:0.9rem; margin-bottom:1rem;">${cleanDetalle}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; pt:0.5rem;">
                    <a href="https://twitter.com/intent/tweet?text=${socialPayload}" target="_blank" rel="noopener noreferrer" class="social-share-btn" style="font-size:0.8rem; color:var(--color-accent-cyan); text-decoration:none; display:inline-flex; align-items:center; gap:0.35rem;">
                        <i class="fa-brands fa-x-twitter"></i> Compartir
                    </a>
                    <button onclick="window.trackEvent('event_interest_click', { event_id: ${ev.id}, event_title: '${cleanTitle}' })" class="cta-button" style="padding:0.3rem 0.8rem; font-size:0.8rem; min-height:unset;">
                        Detalles
                    </button>
                </div>
            `;
            monitorGrid.appendChild(card);
        });

        // GSAP smooth transition for filtered items
        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.monitor-card',
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
            );
        }
    }

    function setupFilterTabs() {
        const tabs = document.querySelectorAll('.filter-tabs .filter-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                const category = tab.getAttribute('data-filter');
                window.trackEvent('filter_monitor_category', { category });
                renderLiveMonitor(category);
            });
        });
    }

    // Agent-Reach Telemetry Analytics Tracker
    window.trackEvent = function(eventName, payload = {}) {
        const telemetryData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            payload: payload
        };
        console.log('[Agent-Reach Telemetry]:', telemetryData);

        // Dispatch async telemetry beacon if endpoint is configured
        if (navigator.sendBeacon) {
            navigator.sendBeacon(`${config.apiBaseUrl}/api/v1/telemetry`, JSON.stringify(telemetryData));
        }
    };

    // Attach telemetry tracking to public CTA buttons
    document.querySelectorAll('.cta-button, .plan-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnText = e.currentTarget.textContent.trim();
            window.trackEvent('cta_click', { button_text: btnText, target_href: e.currentTarget.getAttribute('href') });
        });
    });

    // --- App Init ---
    loadAndRenderContent();
    loadLiveMonitor();
    initializeAIAgent();
    initializeServiceWorker();
});
