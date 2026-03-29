import { translations } from '../config/translations.js';

/**
 * 🌍 Service de Traduction (I18n)
 */
export default class I18n {
    static _currentLocale = localStorage.getItem('intoon_locale') || 'fr';

    /**
     * Initialise le système
     */
    static init() {
        console.log(`🌍 I18n initialisé. Langue : ${this._currentLocale}`);
        document.documentElement.lang = this._currentLocale;
    }

    /**
     * Traduit une clé
     */
    static t(key) {
        if (!translations[this._currentLocale]) return key;
        return translations[this._currentLocale][key] || key;
    }

    /**
     * Change la langue
     */
    static setLocale(locale) {
        if (translations[locale]) {
            this._currentLocale = locale;
            localStorage.setItem('intoon_locale', locale);
            document.documentElement.lang = locale;
            
            // Recharger la page ou notifier l'application pour mettre à jour l'UI
            window.location.reload();
        }
    }

    /**
     * Récupère la langue actuelle
     */
    static getLocale() {
        return this._currentLocale;
    }
}
