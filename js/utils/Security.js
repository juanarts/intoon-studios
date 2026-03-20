/**
 * Utilitaire de Sécurité pour INTOON STUDIOS
 * Gère la protection contre les injections XSS et l'assainissement des données.
 */
export default class Security {
    
    /**
     * Neutralise les balises HTML et les scripts potentiels (Anti-XSS).
     * @param {String} str La chaîne à assainir
     * @returns {String} La chaîne sécurisée
     */
    static escapeHTML(str) {
        if (!str || typeof str !== 'string') return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return str.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    /**
     * Tronque et nettoie les messages pour éviter les abus de stockage ou les caractères invisibles.
     * @param {String} str 
     * @param {Number} maxLength 
     * @returns {String}
     */
    static sanitizeInput(str, maxLength = 1000) {
        if (!str) return '';
        let clean = str.trim().substring(0, maxLength);
        // Supprime les caractères de contrôle non-imprimables
        clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
        return clean;
    }
}
