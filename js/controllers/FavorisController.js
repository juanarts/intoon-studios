import Projet from '../models/Projet.js';
import Favoris from '../models/Favoris.js';
import VueFavoris from '../views/VueFavoris.js';

export default class FavorisController {
    /**
     * Gère l'affichage de la page "Ma Liste"
     */
    static async afficherFavoris() {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader">Chargement de votre liste...</div>';
        
        try {
            const idsFavoris = Favoris.getTous();
            
            // Si la liste est vide, on affiche une belle vue encourageant la découverte
            if (idsFavoris.length === 0) {
                app.innerHTML = VueFavoris.rendreVide();
                return;
            }
            
            // On charge tous les projets et on filtre ceux de la liste
            const tousProjets = await Projet.chargerTous();
            const projetsFavoris = tousProjets.filter(p => idsFavoris.includes(p.id));
            
            // On utilise la vue de grille Netflix classique pour ces favoris
            app.innerHTML = VueFavoris.rendreListe(projetsFavoris);
        } catch (err) {
            app.innerHTML = '<div class="error">Impossible de récupérer vos favoris (Problème de données).</div>';
        }
    }
}
