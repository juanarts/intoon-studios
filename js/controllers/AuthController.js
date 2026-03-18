import VueAuth from '../views/VueAuth.js';
import Auth from '../models/Auth.js';

export default class AuthController {
    static afficherInscription() {
        const app = document.getElementById('app');
        app.innerHTML = VueAuth.rendreInscription();
        AuthController.attacherEvenementsInscription();
    }

    static attacherEvenementsInscription() {
        const form = document.getElementById('form-inscription');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                btn.innerHTML = 'Création en cours...';
                btn.disabled = true;

                try {
                    const pseudo = document.getElementById('ins-pseudo').value || "Nouveau Membre";
                    const email = document.getElementById('ins-email').value;
                    const pass = document.getElementById('ins-pass').value;
                    await Auth.inscrire(email, pass, pseudo);
                    window.appRouter.navigate('/dashboard');
                } catch(err) {
                    alert("Erreur d'inscription Supabase: " + err.message);
                    btn.innerHTML = 'Créer mon compte VIP';
                    btn.disabled = false;
                }
            });
        }
    }

    static afficherConnexion() {
        const app = document.getElementById('app');
        app.innerHTML = VueAuth.rendreConnexion();
        AuthController.attacherEvenementsConnexion();
    }

    static attacherEvenementsConnexion() {
        const form = document.getElementById('form-connexion');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                btn.innerHTML = 'Connexion...';
                btn.disabled = true;

                try {
                    const email = document.getElementById('log-email').value;
                    const pass = document.getElementById('log-pass').value;
                    await Auth.connecter(email, pass);
                    window.appRouter.navigate('/dashboard');
                } catch(err) {
                    alert("Échec de connexion: " + err.message);
                    btn.innerHTML = 'Se connecter à Intoon';
                    btn.disabled = false;
                }
            });
        }
    }
}
