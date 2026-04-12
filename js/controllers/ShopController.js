import Projet from '../models/Projet.js';
import VueShop from '../views/VueShop.js';
import Auth from '../models/Auth.js';
import SupabaseService from '../services/SupabaseService.js';

export default class ShopController {
    /**
     * Affiche la boutique d'un projet spécifique
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

            document.title = `Boutique : ${projet.titre} | InToon Marketplace`;
            app.innerHTML = VueShop.rendre(projet);

            // ── Gestion des achats ──────────────────────────────────────────
            app.onclick = async (e) => {
                const btnAchat = e.target.closest('.btn-buy-item');
                if (!btnAchat) return;

                // Vérifier connexion
                if (!Auth.estConnecte()) {
                    if (confirm('Vous devez être connecté pour acheter. Se connecter ?')) {
                        window.appRouter.navigate('/connexion');
                    }
                    return;
                }

                const type = btnAchat.dataset.type || 'physical';
                const montant = parseFloat(btnAchat.dataset.montant) || 0;
                const titre = btnAchat.dataset.item || projet.titre;

                await ShopController._lancerPaiement({
                    titre,
                    montant,
                    type,
                    projetId: projet.id,
                    vendeurId: projet.authorId,
                    btnElement: btnAchat
                });
            };

        } catch (err) {
            console.error("[Shop Controller] Erreur:", err);
            window.appRouter.navigate('/');
        }
    }

    /**
     * Lance une session de paiement Stripe Checkout
     */
    static async _lancerPaiement({ titre, montant, type, projetId, vendeurId, btnElement }) {
        const user = Auth.getUtilisateur();

        // Feedback visuel
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">autorenew</span> Connexion Stripe...';
        btnElement.disabled = true;

        try {
            const res = await fetch('/functions/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titre,
                    montant,
                    type,
                    projetId,
                    vendeurId,
                    acheteurId: user?.id || null
                })
            });

            const data = await res.json();

            if (!res.ok || !data.url) {
                throw new Error(data.error || 'Impossible de créer la session de paiement');
            }

            // Redirection vers Stripe Checkout (page hébergée par Stripe)
            window.location.href = data.url;

        } catch (err) {
            console.error('[Shop] Erreur paiement:', err);
            alert('❌ Erreur lors du paiement : ' + err.message);
            btnElement.innerHTML = originalHtml;
            btnElement.disabled = false;
        }
    }

    /**
     * Affiche l'index de la marketplace
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

            document.title = "Marketplace INTOON | Boutique BD & Webtoons";
            app.innerHTML = VueShop.rendreIndex(projetsShop);

        } catch (err) {
            console.error("[Shop Index Error]", err);
            app.innerHTML = `
                <div class="error" style="color:white; padding:50px; text-align:center;">
                    <h2>Oups ! Connexion impossible à la Marketplace.</h2>
                    <p style="color:#aaa; margin-top:10px;">${err.message}</p>
                    <button onclick="location.reload()" class="btn-primary" style="margin-top:20px;">Réessayer</button>
                </div>`;
        }
    }
}
