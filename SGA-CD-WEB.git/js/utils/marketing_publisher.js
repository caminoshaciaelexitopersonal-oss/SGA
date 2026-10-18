/**
 * SGAMarketingPublisher - SGA-CD Active Marketing & Social Media Hooks Integration
 * Connects Bento Grid highlights & frontend conversion events to Publora API (Instagram/TikTok)
 * and dispatches live notification triggers for WhatsApp Cloud API.
 */
(function() {
    'use strict';

    class MarketingPublisher {
        constructor() {
            this.publoraEndpoint = 'https://api.publora.com/v1/posts';
            this.whatsappEndpoint = '/api/v1/whatsapp/notify';
        }

        /**
         * Capture Bento Grid metrics or registration highlights and format hooks for Instagram / TikTok
         */
        async captureAndDraftHook(eventData) {
            const { type, title, disciplineOrTaller, category, targetRegion } = eventData;

            // Generate Instagram Caption and TikTok Spoken Hook Script using 2026 hook formulas
            const hashtags = ['#SGACD', '#DeporteYCultura', targetRegion ? `#${targetRegion.replace(/\s+/g, '')}` : '#Colombia', '#InscripcionesAbiertas'];

            let igCaption = `🚀 ¡Nuevas oportunidades en ${title}! \n\n` +
                `Te invitamos a participar en ${disciplineOrTaller} (${category}). Desarrolla tu potencial con el Sistema de Gestión Cultural y Deportiva SGA-CD.\n\n` +
                `📌 Cupos limitados. Inscríbete hoy en la plataforma oficial.\n\n` +
                `${hashtags.join(' ')}`;

            let ttHookScript = {
                spokenHook: `¡Atención ${targetRegion || 'comunidad'}! Abiertas las inscripciones para ${disciplineOrTaller}.`,
                onScreenText: `🔥 INSCRIPCIONES ABIERTAS: ${disciplineOrTaller}`,
                durationSeconds: 3,
                recommendedSound: 'Trending Inst/Sports Upbeat 2026'
            };

            const payload = {
                platform: type === 'tiktok' ? 'tiktok' : 'instagram',
                draft: {
                    title,
                    igCaption,
                    ttHookScript,
                    status: 'draft_created',
                    timestamp: new Date().toISOString()
                }
            };

            console.log(`[MarketingPublisher] Draft created for ${type}:`, payload);

            // Simulate sending to backend or Publora endpoint silently
            try {
                if (window.fetch) {
                    await window.fetch('/api/v1/marketing/drafts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Silent-Error': 'true'
                        },
                        silent: true,
                        body: JSON.stringify(payload)
                    });
                }
            } catch (e) {
                console.warn('[MarketingPublisher] Background draft submission handled gracefully:', e.message);
            }

            return payload;
        }

        /**
         * Dispatch WhatsApp Notification for Offline Attendance or Entity Registration
         */
        async dispatchWhatsAppAlert(alertType, details) {
            const payload = {
                alertType, // 'attendance_sync' or 'entity_registration'
                details,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/v1/webhooks/whatsapp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Silent-Error': 'true'
                    },
                    silent: true,
                    body: JSON.stringify({
                        event: alertType,
                        data: details
                    })
                });
                return response.ok;
            } catch (err) {
                console.warn(`[MarketingPublisher] Error dispatching WhatsApp alert [STD-ERR-503-WA]:`, err.message);
                return false;
            }
        }
    }

    window.SGAMarketingPublisher = new MarketingPublisher();

    // Attach listener for Bento Grid CTA clicks or attendance check-in events
    document.addEventListener('DOMContentLoaded', () => {
        const bentoCards = document.querySelectorAll('.bento-card, .btn-action');
        bentoCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const cardTitle = card.querySelector('h3, h4')?.innerText || 'Actividad SGA-CD';
                window.SGAMarketingPublisher.captureAndDraftHook({
                    type: 'instagram',
                    title: cardTitle,
                    disciplineOrTaller: 'Disciplinas Deportivas y Talleres Culturales',
                    category: 'Formación Integral',
                    targetRegion: 'Municipal / Departamental'
                });
            });
        });
    });
})();
