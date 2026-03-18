import VueAuth from '../views/VueAuth.js';
import Auth from '../models/Auth.js';

export default class AuthController {
    static afficherInscription() {
        const app = document.getElementById('app');
        app.innerHTML = VueAuth.rendreInscription();

        // On branche le simulateur de connexion au clic du bouton de création de compte !
        document.getElementById('form-inscription').addEventListener('submit', (e) => {
            e.preventDefault();
            Auth.connecter("Nouveau Membre", "lecteur"); // Sauvegarde du profil
            window.appRouter.navigate('/dashboard'); // Redirection Dashboard (Funnel Complété)
        });
    }

    static afficherConnexion() {
        const app = document.getElementById('app');
        app.innerHTML = VueAuth.rendreConnexion();

        // On branche le simulateur de connexion avec la "Porte Dérobée" (Backdoor)
        document.getElementById('form-connexion').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;

            // Magic Login Logique
            if (email.trim().toLowerCase() === "superadmin@intoon.com" && pass === "admin123") {
                // ⚡ Connexion Secrète Admin
                Auth.connecter("Fondateur INTOON", "admin");
            } else {
                // 👤 Connexion Lecteur Classique
                Auth.connecter(email.split('@')[0], "lecteur");
            }
            
            window.appRouter.navigate('/dashboard'); // Redirection
        });
    }
}
