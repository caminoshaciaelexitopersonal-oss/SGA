/**
 * SEO & Marketing Engine - SGA-CD Multi-Entity & Role-Segmented Analytics
 * SGA-CD Architecture - Dark Metallic Blue System
 */
window.SGASEOOptimizer = (function() {
    const SCHEMAS = {
        organization: {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "SGA-CD — Sistema de Gestión Cultural y Deportiva",
            "alternateName": "Plataforma de Formación e Impacto Social SGA-CD",
            "url": "https://sga-cd.gov.co",
            "logo": "https://sga-cd.gov.co/assets/logo-sga.png",
            "description": "Plataforma oficial para la administración, fiscalización y seguimiento de convenios institucionales en Disciplinas Deportivas, Modalidades Culturales y Talleres de formación.",
            "areaServed": [
                {
                    "@type": "AdministrativeArea",
                    "name": "Nivel Nacional (Ministerios de Cultura y Deporte)"
                },
                {
                    "@type": "AdministrativeArea",
                    "name": "Nivel Departamental (Gobernaciones e Institutos)"
                },
                {
                    "@type": "AdministrativeArea",
                    "name": "Nivel Municipal (Alcaldías y Entes Descentralizados)"
                }
            ],
            "offers": [
                {
                    "@type": "Offer",
                    "category": "Disciplinas Deportivas",
                    "description": "Gestión de torneos, entrenamientos y fichas atléticas de rendimiento."
                },
                {
                    "@type": "Offer",
                    "category": "Modalidades Culturales y Talleres",
                    "description": "Formación en Danza (Joropo/Llanera, Salsa, Vallenato) e Instrumentos (Guitarra, Arpa)."
                }
            ]
        },
        governmentService: {
            "@context": "https://schema.org",
            "@type": "GovernmentService",
            "name": "Gestión e Impacto Social Cultural y Deportivo SGA-CD",
            "serviceType": "Administración de Convenios e Inscripciones Institucionales",
            "provider": {
                "@type": "Organization",
                "name": "SGA-CD Colombia"
            },
            "areaServed": "Colombia",
            "audience": {
                "@type": "Audience",
                "audienceType": "Entidades Públicas, Gobernaciones, Alcaldías, Instructores y Estudiantes"
            }
        }
    };

    function injectJSONLD() {
        let scriptTag = document.getElementById('sga-jsonld-schema');
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'sga-jsonld-schema';
            scriptTag.type = 'application/ld+json';
            document.head.appendChild(scriptTag);
        }
        scriptTag.textContent = JSON.stringify([SCHEMAS.organization, SCHEMAS.governmentService], null, 2);
    }

    function updateRoleMetadata(role) {
        const metaTitle = document.querySelector('meta[property="og:title"]');
        const metaDesc = document.querySelector('meta[property="og:description"]');
        const metaTwTitle = document.querySelector('meta[name="twitter:title"]');
        const metaTwDesc = document.querySelector('meta[name="twitter:description"]');

        let title = "SGA-CD — Plataforma de Gestión Cultural y Deportiva";
        let desc = "Sistema unificado para el seguimiento de presupuestos institucionales, asistencia y formación en disciplinas deportivas y modalidades culturales.";

        if (role === 'entidad') {
            title = "SGA-CD B2B — Control Presupuestal e Impacto Social para Entidades";
            desc = "Auditoría en tiempo real, gestión de metas gubernamentales e indicadores de convenios para Ministerios, Gobernaciones y Alcaldías.";
        } else if (role === 'profesor_estudiante') {
            title = "SGA-CD — Portal de Formación en Deportes y Talleres Culturales";
            desc = "Inscripción en línea, control de asistencia offline PWA y seguimiento académico en danza (joropo, salsa, vallenato) e instrumentos.";
        }

        if (metaTitle) metaTitle.setAttribute('content', title);
        if (metaDesc) metaDesc.setAttribute('content', desc);
        if (metaTwTitle) metaTwTitle.setAttribute('content', title);
        if (metaTwDesc) metaTwDesc.setAttribute('content', desc);
    }

    function setupTelemetry() {
        window.trackConversionEvent = function(eventName, category, metadata = {}) {
            // Anonymize metadata for ECC-main compliance
            const safeData = {
                event: String(eventName),
                category: String(category),
                timestamp: new Date().toISOString(),
                referrer: document.referrer ? 'external_partner' : 'direct',
                entityLevel: metadata.entityLevel || 'municipal_departamental'
            };

            const payload = JSON.stringify(safeData);
            if (navigator.sendBeacon && window.location.protocol.startsWith('http')) {
                try {
                    navigator.sendBeacon('/api/v1/telemetry/event', payload);
                } catch (e) {
                    // Fallback for file:// protocol or blocked beacon
                }
            } else {
                fetch('/api/v1/telemetry/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true
                }).catch(() => {});
            }
            console.log('[SGA Telemetry Event Captured]:', safeData);
        };
    }

    return {
        init: function() {
            injectJSONLD();
            setupTelemetry();

            // Detect segment parameter from URL if present (?role=entidad)
            const params = new URLSearchParams(window.location.search);
            const role = params.get('role') || 'general';
            updateRoleMetadata(role);
        },
        updateRoleMetadata: updateRoleMetadata
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    window.SGASEOOptimizer.init();
});
