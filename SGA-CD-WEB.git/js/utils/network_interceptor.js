/**
 * Network Interceptor - SGA-CD Global HTTP Error Interception
 * Intercepts window.fetch calls for response.status >= 400 or network drops
 */
(function() {
    if (window.__sga_network_interceptor_loaded) return;
    window.__sga_network_interceptor_loaded = true;

    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch(...args);
            if (!response.ok && response.status >= 400) {
                // Intercepción inmediata ante fallas HTTP
                if (window.SGAErrorHandler && typeof window.SGAErrorHandler.handleHTTPError === 'function') {
                    window.SGAErrorHandler.handleHTTPError(response.status);
                }
            }
            return response;
        } catch (error) {
            // Intercepción inmediata ante caídas críticas de red / Servidor no disponible
            if (window.SGAErrorHandler && typeof window.SGAErrorHandler.handleHTTPError === 'function') {
                window.SGAErrorHandler.handleHTTPError(503);
            }
            throw error;
        }
    };
})();
