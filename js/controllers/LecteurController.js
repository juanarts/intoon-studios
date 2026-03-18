import Projet from '../models/Projet.js';
import VueLecteur from '../views/VueLecteur.js';
import Auth from '../models/Auth.js';
import Historique from '../models/Historique.js';

export default class LecteurController {
    static async lireChapitre(idProjet, idChapitre) {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader">Connexion à la base de données graphique...</div>';
        try {
            const projet = await Projet.chargerParId(idProjet);
            if (projet) {
                const chapitre = projet.chapitres.find(c => c.id === idChapitre);
                
                // Mémorisation invisible de la lecture en cours pour la page d'accueil !
                Historique.enregistrer(idProjet, idChapitre);

                // INJECTION DE L'ETAT DE CONNEXION DANS LA VUE LECTEUR (Pour déverrouiller le paywall)
                const userConnecte = Auth.estConnecte();
                app.innerHTML = VueLecteur.rendreLecteur(projet, chapitre, userConnecte);
                
                // MOTEUR DE COMMENTAIRES IMMERSIFS (NicoNico / Webtoon style)
                LecteurController.initialiserCommentairesImmersifs();
            } else {
                app.innerHTML = '<div class="error">Projet ou chapitre temporairement indisponible.</div>';
            }
        } catch (err) {
            app.innerHTML = '<div class="error">Erreur critique lors du chargement des planches.</div>';
        }
    }

    static initialiserCommentairesImmersifs() {
        const overlay = document.getElementById('comments-overlay');
        const toggleBtn = document.getElementById('toggle-comments');
        const form = document.getElementById('form-live-comment');
        if (!overlay) return;

        let commentsActive = true;
        overlay.style.transition = 'opacity 0.4s ease';

        const toggleVisibility = (active) => {
            commentsActive = active;
            if (commentsActive) {
                overlay.style.display = 'block';
                setTimeout(() => overlay.style.opacity = '1', 10);
                if(toggleBtn) toggleBtn.style.opacity = '1';
            } else {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 400);
                if(toggleBtn) toggleBtn.style.opacity = '0.3';
            }
        };

        if (toggleBtn) {
            toggleBtn.onclick = () => toggleVisibility(!commentsActive);
        }

        // Un tap n'importe où sur les pages désactive les commentaires (immersion cinéma)
        const pagesContainer = document.querySelector('.webtoon-pages');
        if (pagesContainer) {
            pagesContainer.addEventListener('click', () => {
                if(commentsActive) toggleVisibility(false);
            });
        }

        const fakeComments = [
            "masterclass ce chapitre", 
            "omg les dessins", 
            "le goat est de retour !!", 
            "l'ambiance est incroyable vrmt", 
            "la colorisation m'a achevé..", 
            "need la suite vite", 
            "incroyable 😭", 
            "les détails sur les yeux...", 
            "c'est du pur cinéma"
        ];

        const dropComment = (text, isUser = false) => {
            if (!commentsActive) return;
            const span = document.createElement('span');
            // Obligation de minuscules demandée par l'Admin
            span.textContent = text.toLowerCase();
            span.style.position = 'absolute';
            
            // Apparition large pour éviter l'entassement
            span.style.left = (Math.random() * 60 + 20) + '%';
            span.style.top = '100%';
            
            // Typographie Light (100 ou 200) + Fade IN & OUT
            span.style.color = isUser ? 'rgba(229,9,20,0.85)' : 'rgba(255,255,255,0.45)'; 
            span.style.fontWeight = isUser ? '300' : '100'; // Typo ultra fine / Thin extrême!
            span.style.fontFamily = "'Be Vietnam Pro', sans-serif";
            span.style.letterSpacing = '1px';
            span.style.fontSize = (Math.random() * 0.4 + 1.2) + 'rem';
            span.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
            span.style.whiteSpace = 'nowrap';
            span.style.transition = 'top 8s linear, opacity 1.5s ease-in-out';
            span.style.opacity = '0';
            span.style.zIndex = '45';
            span.style.pointerEvents = 'none'; // Le clic traverse
            
            overlay.appendChild(span);
            
            // Fade-IN + Mouvement
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.top = '-10%'; 
            }, 50);

            // Fade-OUT
            setTimeout(() => {
                span.style.opacity = '0';
            }, 6500); // S'estompe doucement avant même d'arriver tout en haut

            // Garbage Collection
            setTimeout(() => {
                if (span.parentNode) span.parentNode.removeChild(span);
            }, 8050);
        };

        // Jet aléatoire d'un faux commentaire toutes les 3s pour donner vie à la plateforme
        const streamInterval = setInterval(() => {
            if (!document.getElementById('comments-overlay')) {
                clearInterval(streamInterval); // Stop si fermeture du Liseur
                return;
            }
            if (Math.random() > 0.4) {
                const randomTxt = fakeComments[Math.floor(Math.random() * fakeComments.length)];
                dropComment(randomTxt);
            }
        }, 2000);

        // Binding du formulaire Abonné VIP
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const input = document.getElementById('live-comment-input');
                if (input && input.value.trim() !== '') {
                    dropComment(input.value.trim(), true); 
                    input.value = '';
                }
            };
        }
    }
}
