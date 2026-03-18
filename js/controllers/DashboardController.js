import VueDashboard from '../views/VueDashboard.js';
import Favoris from '../models/Favoris.js';
import Projet from '../models/Projet.js';
import Auth from '../models/Auth.js';

export default class DashboardController {
    static async afficher() {
        const app = document.getElementById('app');

        // PROTECTION DE ROUTE : Vérifier que quelqu'un est connecté
        if (!Auth.estConnecte()) {
            window.appRouter.navigate('/connexion');
            return;
        }

        const utilisateur = Auth.getUtilisateur();

        app.innerHTML = '<div class="loader" style="color:white;">Chargement de votre espace sécurisé INTOON...</div>';
        
        try {
            const idsFavoris = Favoris.getTous();
            let projetsFavoris = [];
            
            if (idsFavoris.length > 0) {
                const tousProjets = await Projet.chargerTous();
                projetsFavoris = tousProjets.filter(p => idsFavoris.includes(p.id));
            }
            
            // On envoie le pseudo lu depuis le localstorage
            app.innerHTML = VueDashboard.rendre(projetsFavoris, utilisateur);
            
        } catch(err) {
            app.innerHTML = '<div class="error">Erreur de chargement du profil utilisateur.</div>';
        }
    }
}
