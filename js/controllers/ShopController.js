import Projet from '../models/Projet.js';
import VueShop from '../views/VueShop.js';
import SupabaseService from '../services/SupabaseService.js';

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

    /**
     * Affiche l'index de la marketplace (toutes les boutiques actives)
     */
    static async afficherTout() {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader" style="color:white;">Exploration du Marketplace INTOON...</div>';

        try {
            const client = SupabaseService.getClient();
            const { data: dbProjets, error } = await client
                .from('projets')
                .select('*')
                .eq('shop_enabled', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const projetsShop = dbProjets ? dbProjets.map(p => new Projet(p)) : [];
            
            // [SEO]
            document.title = "Marketplace INTOON | Boutique BD & Webtoons";

            app.innerHTML = VueShop.rendreIndex(projetsShop);

        } catch (err) {
            console.error("[Shop Index Error]", err);
            app.innerHTML = '<div class="error" style="color:white; padding:50px; text-align:center;">Erreur lors du chargement de la marketplace.</div>';
        }
    }
}
