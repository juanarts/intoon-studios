import VueCheckout from '../views/VueCheckout.js';
import Auth from '../models/Auth.js';

export default class CheckoutController {

    static afficher() {
        const app = document.getElementById('app');
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        const sessionId = urlParams.get('session_id');
        const plan = urlParams.get('plan');

        // ── Retour de Stripe après paiement réussi ──────────────────────────
        if (status === 'success' && sessionId) {
            CheckoutController._afficherSucces(app, sessionId);
            return;
        }

        // ── Page de checkout VIP (plan d'abonnement) ─────────────────────────
        if (plan) {
            app.innerHTML = VueCheckout.rendre(plan);
            window.scrollTo(0, 0);

            const form = document.getElementById('form-checkout');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    if (!Auth.estConnecte()) {
                        if (confirm('Vous devez être connecté. Se connecter ?')) {
                            window.appRouter.navigate('/connexion');
                        }
                        return;
                    }

                    const btn = form.querySelector('button[type="submit"]');
                    const btnOriginal = btn.innerHTML;
                    btn.innerHTML = `<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">autorenew</span> Connexion Stripe...`;
                    btn.disabled = true;

                    const montant = parseFloat(plan) || 5;
                    const user = Auth.getUtilisateur();

                    try {
                        const res = await fetch('/functions/create-checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                titre: `Abonnement VIP InToon — ${montant}€/mois`,
                                montant,
                                type: 'vip',
                                projetId: '00000000-0000-0000-0000-000000000000', // VIP global
                                vendeurId: user?.id || null,
                                acheteurId: user?.id || null
                            })
                        });

                        const data = await res.json();

                        if (!res.ok || !data.url) {
                            throw new Error(data.error || 'Impossible de créer la session Stripe');
                        }

                        window.location.href = data.url;

                    } catch (err) {
                        console.error('[Checkout VIP] Erreur:', err);
                        alert('❌ Erreur paiement : ' + err.message);
                        btn.innerHTML = btnOriginal;
                        btn.disabled = false;
                    }
                });
            }
            return;
        }

        // ── Page inconnue → accueil ──────────────────────────────────────────
        window.appRouter.navigate('/');
    }

    /**
     * Affiche la page de succès après paiement Stripe
     */
    static _afficherSucces(app, sessionId) {
        document.title = 'Paiement Réussi | InToon';
        app.innerHTML = `
            <div style="height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; animation: fadeIn 0.5s; padding: 40px;">
                
                <div style="width:110px; height:110px; background:rgba(74,222,128,0.15); border-radius:50%; display:flex; justify-content:center; align-items:center; margin-bottom:30px; box-shadow:0 0 60px rgba(74,222,128,0.3); animation: fadeIn 0.8s ease-out;">
                    <span class="material-symbols-outlined" style="font-size:4.5rem; color:#4ade80;">check_circle</span>
                </div>

                <h1 style="color:white; font-size:3rem; font-family:'Outfit', sans-serif; margin-bottom:15px;">
                    Paiement Réussi ! 🎉
                </h1>
                <p style="color:#aaa; font-size:1.1rem; max-width:550px; margin-bottom:10px; line-height:1.6;">
                    Merci pour votre achat sur <b style="color:white;">InToon Studios</b> ! 
                    Votre commande est confirmée et le créateur a été notifié.
                </p>
                <p style="color:#555; font-size:0.8rem; margin-bottom:40px;">
                    Référence : <code style="background:#111; padding:3px 8px; border-radius:4px; color:#60a5fa;">${sessionId.slice(0, 30)}...</code>
                </p>

                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    <a href="/dashboard" data-link class="btn-primary" style="padding:14px 35px; font-size:1rem;">
                        <span class="material-symbols-outlined">dashboard</span> Mon Espace
                    </a>
                    <a href="/shop" data-link class="btn-secondary" style="padding:14px 35px; font-size:1rem;">
                        <span class="material-symbols-outlined">storefront</span> Continuer les achats
                    </a>
                </div>
            </div>
        `;
    }
}
