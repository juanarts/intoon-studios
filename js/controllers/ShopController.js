import Projet from '../models/Projet.js';
import VueShop from '../views/VueShop.js';

export default class ShopController {
    /**
     * Affiche la boutique d'un projet spécifique
     * @param {string} slug Slug du projet
     */
    static async afficher(slug) {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader" style="color:white;">Ouverture de la boutique exclusive...</div>';

        try {
            const projet = await Projet.chargerParSlug(slug);

            if (!projet || !projet.shopEnabled) {
                console.warn("[Shop] Projet introuvable ou boutique désactivée.");
                window.appRouter.navigate('/');
                return;
            }

            // [SEO] Mise à jour du titre de la page
            document.title = `Boutique : ${projet.titre} | InToon Marketplace`;

            app.innerHTML = VueShop.rendre(projet);

            // Gestion des clics éventuels (bouton achat)
            app.onclick = (e) => {
                if (e.target.closest('.btn-buy-item')) {
                    const itemName = e.target.closest('.btn-buy-item').dataset.item;
                    alert(`🛍️ Réservation de l'article [${itemName}] enregistrée !\nNotre équipe va vous contacter pour finaliser l'envoi.`);
                }
            };

        } catch (err) {
            console.error("[Shop Controller] Erreur:", err);
            window.appRouter.navigate('/');
        }
    }
}
