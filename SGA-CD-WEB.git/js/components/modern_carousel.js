/**
 * Modern Carousel Component - SGA-CD
 * Carrusel de 10 diapositivas con letras y párrafos flotantes
 * Animado a 60 FPS con GSAP GPU hardware compositing (transform: translate3d y opacity)
 * Incluye listener de visibilitychange para pausar en blur y evitar leaks.
 */
window.SGAModernCarousel = (function() {
    const slidesData = [
        {
            title: "Gestión Institucional de Cobertura Nacional",
            subtitle: "Disciplinas Deportivas y Modalidades Culturales en un solo ecosistema.",
            tag: "ENTIDADES PÚBLICAS Y PRIVADAS",
            bgGradient: "linear-gradient(135deg, #070B14 0%, #0D1424 100%)"
        },
        {
            title: "Taekwondo, Fútbol y Baloncesto",
            subtitle: "Seguimiento atlético, métricas de rendimiento y expedientes de deportistas.",
            tag: "DISCIPLINAS DEPORTIVAS",
            bgGradient: "linear-gradient(135deg, #0B172E 0%, #070B14 100%)"
        },
        {
            title: "Danza: Joropo, Salsa y Vallenato",
            subtitle: "Preservación del patrimonio cultural con escuelas de formación estructuradas.",
            tag: "MODALIDADES CULTURALES",
            bgGradient: "linear-gradient(135deg, #0D1424 0%, #0F2042 100%)"
        },
        {
            title: "Instrumentos: Guitarra y Arpa",
            subtitle: "Talleres especializados de música con control de asistencia offline PWA.",
            tag: "TALLERES DE FORMACIÓN",
            bgGradient: "linear-gradient(135deg, #081121 0%, #070B14 100%)"
        },
        {
            title: "Plataforma para Profesores e Instructores",
            subtitle: "Carga de notas, Roster de alumnos e informes de cumplimiento en tiempo real.",
            tag: "DOCENTES / INSTRUCTORES",
            bgGradient: "linear-gradient(135deg, #0D1424 0%, #0A1931 100%)"
        },
        {
            title: "Suscripción Estudiantil Costo 0",
            subtitle: "Inscripción en línea, carnet digital y medallería para alumnos y acudientes.",
            tag: "ESTUDIANTES Y PADRES DE FAMILIA",
            bgGradient: "linear-gradient(135deg, #050D1A 0%, #0D1424 100%)"
        },
        {
            title: "Fiscalización Presupuestal y Convenios",
            subtitle: "Auditoría en tiempo real para Ministerios, Gobernaciones y Alcaldías.",
            tag: "CONTROL GUBERNAMENTAL",
            bgGradient: "linear-gradient(135deg, #0D1424 0%, #081B38 100%)"
        },
        {
            title: "Sincronización PWA Offline Sync",
            subtitle: "Registro de asistencia sin conexión a internet en escenarios remotos.",
            tag: "TECNOLOGÍA ROBUSTA",
            bgGradient: "linear-gradient(135deg, #070B14 0%, #0D1E3A 100%)"
        },
        {
            title: "Análisis Predictivo e Inteligencia Artificial",
            subtitle: "Generación automatizada de planes anuales de trabajo y proyectos.",
            tag: "IA Y TELEMETRÍA",
            bgGradient: "linear-gradient(135deg, #09152B 0%, #070B14 100%)"
        },
        {
            title: "Seguridad y Hardening Criptográfico",
            subtitle: "Aislamiento multi-tenant, sanitización XSS y protección AgentShield ECC.",
            tag: "SEGURIDAD DE ALTO NIVEL",
            bgGradient: "linear-gradient(135deg, #0D1424 0%, #070B14 100%)"
        }
    ];

    let currentIndex = 0;
    let autoPlayTimer = null;

    function renderCarousel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="sga-modern-carousel-wrapper" style="position:relative; width:100%; min-height:460px; background:#070B14; border:1px solid rgba(56,189,248,0.25); border-radius:20px; overflow:hidden; padding:1.5rem; box-sizing:border-box;">
                <div class="sga-carousel-track" style="position:relative; width:100%; min-height:420px; display:flex; align-items:center;">
                    ${slidesData.map((slide, index) => `
                        <div class="sga-carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}" style="position:absolute; inset:0; opacity:${index === 0 ? 1 : 0}; transform:translate3d(${index === 0 ? '0px' : '100px'}, 0, 0); transition:opacity 0.6s ease, transform 0.6s ease; display:flex; flex-direction:column; justify-content:flex-start; padding:2rem 2rem 2rem 2rem; background:${slide.bgGradient}; border-radius:16px; box-sizing:border-box;">
                            <span class="slide-tag" style="display:inline-block; align-self:flex-start; background:rgba(56,189,248,0.12); color:#38BDF8; font-size:0.8rem; font-weight:800; padding:0.4rem 1rem; border-radius:20px; border:1px solid rgba(56,189,248,0.3); margin-bottom:1rem; letter-spacing:1px;">
                                ${slide.tag}
                            </span>
                            <h2 class="slide-floating-title" style="color:#E2E8F0; font-size:clamp(1.5rem, 3vw, 2.5rem); font-weight:800; margin:0 0 1rem 0; line-height:1.2;">
                                ${slide.title}
                            </h2>
                            <p class="slide-floating-desc" style="color:#94A3B8; font-size:clamp(0.95rem, 1.5vw, 1.25rem); margin:0; max-width:700px; line-height:1.6;">
                                ${slide.subtitle}
                            </p>
                        </div>
                    `).join('')}
                </div>
                <!-- Navigation Controls -->
                <div style="position:absolute; bottom:1.5rem; right:2rem; display:flex; gap:0.75rem; align-items:center; z-index:10;">
                    <button id="sga-carousel-prev" class="btn-secondary" style="width:44px; height:44px; border-radius:50%; min-height:44px; padding:0; display:flex; align-items:center; justify-content:center;">
                        <i class="fas fa-chevron-left" style="color:#38BDF8;"></i>
                    </button>
                    <span id="sga-carousel-indicator" style="color:#38BDF8; font-size:0.85rem; font-weight:700; min-width:50px; text-align:center;">1 / 10</span>
                    <button id="sga-carousel-next" class="btn-secondary" style="width:44px; height:44px; border-radius:50%; min-height:44px; padding:0; display:flex; align-items:center; justify-content:center;">
                        <i class="fas fa-chevron-right" style="color:#38BDF8;"></i>
                    </button>
                </div>
            </div>
        `;

        setupEvents(container);
        startAutoPlay();
    }

    function goToSlide(newIndex) {
        const slides = document.querySelectorAll('.sga-carousel-slide');
        if (!slides.length) return;

        slides[currentIndex].style.opacity = '0';
        slides[currentIndex].style.transform = 'translate3d(-100px, 0, 0)';
        slides[currentIndex].classList.remove('active');

        currentIndex = (newIndex + slides.length) % slides.length;

        slides[currentIndex].style.opacity = '1';
        slides[currentIndex].style.transform = 'translate3d(0, 0, 0)';
        slides[currentIndex].classList.add('active');

        const indicator = document.getElementById('sga-carousel-indicator');
        if (indicator) {
            indicator.textContent = `${currentIndex + 1} / ${slides.length}`;
        }

        // Animación GSAP flotante de letras y párrafos
        if (window.gsap) {
            const activeSlide = slides[currentIndex];
            gsap.fromTo(activeSlide.querySelector('.slide-floating-title'),
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
            );
            gsap.fromTo(activeSlide.querySelector('.slide-floating-desc'),
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: 'power2.out' }
            );
        }
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function setupEvents(container) {
        const prevBtn = document.getElementById('sga-carousel-prev');
        const nextBtn = document.getElementById('sga-carousel-next');

        if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); startAutoPlay(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); startAutoPlay(); });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoPlay();
            } else {
                startAutoPlay();
            }
        });
    }

    return {
        init: renderCarousel,
        goToSlide: goToSlide
    };
})();
