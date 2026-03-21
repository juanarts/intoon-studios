import VueCheckout from '../views/VueCheckout.js';

export default class CheckoutController {
    static afficher() {
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get('plan') || '5'; // 5 par défaut
        
        const app = document.getElementById('app');
        app.innerHTML = VueCheckout.rendre(plan);
        window.scrollTo(0, 0);

        const form = document.getElementById('form-checkout');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Animation de chargement
                const btn = form.querySelector('button[type="submit"]');
                const btnContent = btn.innerHTML;
                btn.innerHTML = `<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">autorenew</span> Traitement...`;
                btn.style.opacity = '0.7';
                btn.disabled = true;

                // Simulation appel API bancaire
                setTimeout(() => {
                    app.innerHTML = `
                        <div style="height:80vh; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; animation: fadeIn 0.5s;">
                            <div style="width:100px; height:100px; background:rgba(74,222,128,0.2); border-radius:50%; display:flex; justify-content:center; align-items:center; margin-bottom:30px; box-shadow:0 0 50px rgba(74,222,128,0.4);">
                                <span class="material-symbols-outlined" style="font-size:4rem; color:#4ade80;">check_circle</span>
                            </div>
                            <h1 style="color:white; font-size:3rem; font-family:'Outfit', sans-serif; margin-bottom:15px;">Paiement Réussi !</h1>
                            <p style="color:#aaa; font-size:1.2rem; max-width:500px; margin-bottom:40px; line-height:1.6;">
                                Merci pour votre soutien ! Vous êtes désormais officiellement <b>Mécène VIP</b>. Vos avantages ont été activés sur votre compte.
                            </p>
                            <a href="/" data-link class="btn-primary" style="padding:15px 40px; font-size:1.1rem;">Retourner à l'Accueil</a>
                        </div>
                    `;
                }, 2000);
            });
        }
    }
}
