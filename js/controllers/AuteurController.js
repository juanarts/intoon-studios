import VueAuteur from '../views/VueAuteur.js';

export default class AuteurController {
    /**
     * Affiche la landing page du Studio/Créateur
     */
    static afficher() {
        const app = document.getElementById('app');
        // Affichage statique direct, pas besoin de modèle asynchrone pour l'instant
        app.innerHTML = VueAuteur.rendre();
    }
}
