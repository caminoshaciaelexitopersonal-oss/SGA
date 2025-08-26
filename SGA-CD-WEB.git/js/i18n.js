const i18n = {
    // Objeto para almacenar las frases traducidas
    phrases: {},

    /**
     * Establece el idioma de la aplicación.
     * @param {string} lang - El código del idioma (ej. 'en', 'es').
     */
    async setLanguage(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Could not load language file: ${lang}.json`);
            }
            this.phrases = await response.json();

            // Guardar la preferencia de idioma
            localStorage.setItem('preferredLanguage', lang);

            // Actualizar todos los elementos del DOM
            this.updateUI();
        } catch (error) {
            console.error(error);
        }
    },

    /**
     * Traduce una clave a la frase correspondiente en el idioma actual.
     * @param {string} key - La clave de la traducción.
     * @param {Object} [interpolations] - Valores para reemplazar en la cadena (ej. {name: 'Jules'}).
     * @returns {string} La cadena traducida.
     */
    t(key, interpolations = {}) {
        let phrase = this.phrases[key] || key;
        for (const placeholder in interpolations) {
            phrase = phrase.replace(`{${placeholder}}`, interpolations[placeholder]);
        }
        return phrase;
    },

    /**
     * Recorre el DOM y traduce todos los elementos con el atributo 'data-i18n'.
     */
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const attr = element.getAttribute('data-i18n-attr');

            if (attr) {
                // Traducir un atributo (ej. placeholder)
                element.setAttribute(attr, this.t(key));
            } else {
                // Traducir el contenido de texto
                element.innerHTML = this.t(key);
            }
        });
    },

    /**
     * Inicializa el sistema de i18n.
     */
    initialize() {
        const preferredLanguage = localStorage.getItem('preferredLanguage') || 'es';
        this.setLanguage(preferredLanguage);
    }
};

// Inicializar al cargar el script
i18n.initialize();
