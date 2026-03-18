export default class Auth {
    /**
     * @returns {Boolean} L'utilisateur est-il connecté (dans la simulation) ?
     */
    static estConnecte() {
        return localStorage.getItem('intoon_session') !== null;
    }

    /**
     * Démarre une session virtuelle (Avec gestion des rôles Admin/Lecteur)
     */
    static connecter(pseudo, role = 'lecteur') {
        localStorage.setItem('intoon_session', JSON.stringify({ pseudo: pseudo, statut: 'VIP', role: role }));
        // Émission d'un événement global pour recharger les menus automatiquement
        window.dispatchEvent(new Event('authStateChanged'));
    }

    /**
     * Ferme la session virtuelle
     */
    static deconnecter() {
        localStorage.removeItem('intoon_session');
        window.dispatchEvent(new Event('authStateChanged'));
    }

    /**
     * Récupère le profil de l'utilisateur stocké
     */
    static getUtilisateur() {
        const data = localStorage.getItem('intoon_session');
        return data ? JSON.parse(data) : null;
    }
}
