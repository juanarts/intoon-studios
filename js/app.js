import Router from './Router.js';
import AccueilController from './controllers/AccueilController.js';
import LecteurController from './controllers/LecteurController.js';
import FavorisController from './controllers/FavorisController.js';
import AuteurController from './controllers/AuteurController.js';
import AuthController from './controllers/AuthController.js';
import DashboardController from './controllers/DashboardController.js';
import SoumissionController from './controllers/SoumissionController.js';
import AdminController from './controllers/AdminController.js';
import VipController from './controllers/VipController.js';
import CheckoutController from './controllers/CheckoutController.js';
import MessagerieController from './controllers/MessagerieController.js';
import ProfilController from './controllers/ProfilController.js';
import Messagerie from './models/Messagerie.js';
import Favoris from './models/Favoris.js';
import Auth from './models/Auth.js';
import Likes from './models/Likes.js';

/**
 * Point d'entrée de l'application (Bootstrapper)
 */
document.addEventListener("DOMContentLoaded", async () => {
    
    // Attendre le chargement de la session Supabase avant de dessiner la page
    await Auth.initialiser();
    
    // Définition déclarative de nos routes MVC étendues
    const routes = [
        { path: '/', controller: AccueilController.afficherCatalogue },
        { path: '/projet/:id', controller: AccueilController.afficherDetailProjet },
        { path: '/lire/:idProjet/:idChapitre', controller: LecteurController.lireChapitre },
        { path: '/favoris', controller: FavorisController.afficherFavoris },
        { path: '/studio', controller: AuteurController.afficher },
        { path: '/inscription', controller: AuthController.afficherInscription },
        { path: '/connexion', controller: AuthController.afficherConnexion },
        { path: '/dashboard', controller: DashboardController.afficher },
        { path: '/soumission', controller: SoumissionController.afficher },
        { path: '/admin', controller: AdminController.afficher },
        { path: '/vip', controller: VipController.afficher },
        { path: '/checkout', controller: CheckoutController.afficher },
        { path: '/inbox', controller: () => MessagerieController.afficher() },
        { path: '/profil/:id', controller: (id) => ProfilController.afficher(id) }
    ];

    // Gestion Dynamique de la Navbar (Simulation Authentification)
    const rafraichirNavbar = () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            if (Auth.estConnecte()) {
                const unreadCount = Messagerie.getTotalNonLus ? Messagerie.getTotalNonLus() : 0;
                const badgeHtml = unreadCount > 0 
                    ? `<span id="nav-inbox-badge" style="position:absolute; top:-5px; right:-8px; background:var(--primary); color:white; border-radius:10px; width:18px; height:18px; font-size:0.7rem; display:flex; justify-content:center; align-items:center; font-weight:bold;">${unreadCount}</span>`
                    : `<span id="nav-inbox-badge" style="display:none; position:absolute; top:-5px; right:-8px; background:var(--primary); color:white; border-radius:10px; width:18px; height:18px; font-size:0.7rem; justify-content:center; align-items:center; font-weight:bold;">0</span>`;

                const user = Auth.getUtilisateur();
                const avatar = user?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.pseudo || 'User'}&backgroundColor=0a0a0d`;
                const pseudo = user?.pseudo || 'Mon Compte';
                const couronne = user?.role === 'admin' ? '👑 ' : '';

                navLinks.innerHTML = `
                    <a href="/" data-link style="display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">home</span> <span class="nav-text">Accueil</span></a>
                    <a href="/studio" data-link style="display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">brush</span> <span class="nav-text">Le Studio</span></a>
                    <a href="/favoris" data-link style="display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">bookmark</span> <span class="nav-text">Ma Liste</span></a>
                    <a href="/inbox" data-link style="position:relative; display:flex; align-items:center; margin:0 10px;" title="Messagerie Privée">
                        <span class="material-symbols-outlined" style="font-size:1.3rem;">mail</span>
                        ${badgeHtml}
                    </a>
                    <a href="/dashboard" data-link class="btn-secondary" style="display:flex; align-items:center; gap:8px; padding:6px 16px; border-radius:20px;">
                        <img src="${avatar}" alt="Profil" style="width:24px; height:24px; border-radius:50%; object-fit:cover; border:1px solid #333;">
                        <span style="font-weight:bold; font-size:0.9rem;" class="nav-text">${couronne}${pseudo}</span>
                    </a>
                `;
            } else {
                navLinks.innerHTML = `
                    <a href="/" data-link style="display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">home</span> <span class="nav-text">Accueil</span></a>
                    <a href="/studio" data-link style="display:flex; align-items:center; gap:5px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">brush</span> <span class="nav-text">Le Studio</span></a>
                    <a href="/connexion" data-link style="display:flex; align-items:center; gap:6px; color:var(--text-muted);"><span class="nav-text">S'identifier</span></a>
                    <a href="/inscription" data-link class="btn-primary" style="display:flex; align-items:center; gap:6px; padding:8px 20px;"><span class="nav-text">S'inscrire</span></a>
                `;
            }
        }
    };
    
    // Écoute l'événement local de changement d'état
    window.addEventListener('authStateChanged', rafraichirNavbar);
    rafraichirNavbar(); // État initial au chargement
    
    // Déconnexion globale à l'écoute des boutons .btn-logout de n'importe quelle page
    document.body.addEventListener('click', e => {
        if (e.target.closest('.btn-logout')) {
            e.preventDefault();
            Auth.deconnecter();
            if (window.appRouter) window.appRouter.navigate('/');
        }
    });

    // Écouteur global pour le bouton "Ajouter à ma liste" sans base backend (Délégation d'événement)
    document.body.addEventListener('click', e => {
        const btn = e.target.closest('.btn-favori');
        if (btn) {
            e.preventDefault();
            const idProjet = btn.dataset.projetId;
            const isFav = Favoris.basculer(idProjet);
            
            // Met à jour le texte du bouton et le design dynamiquement
            btn.innerHTML = isFav ? '❤️ Retirer de ma liste' : '🤍 Ajouter à ma liste';
            btn.style.transform = "scale(0.95)";
            setTimeout(() => btn.style.transform = "scale(1)", 150);
        }
    });

    // Écouteur global pour le système de Cœurs (Likes)
    document.body.addEventListener('click', async e => {
        const btnLike = e.target.closest('.btn-like');
        if (btnLike) {
            e.preventDefault();
            const id = btnLike.getAttribute('data-id');
            const estMaintenantLike = await Likes.basculerLike(id);
            const nouveauTotal = await Likes.getTotalLikes(id);
            
            const iconSpan = btnLike.querySelector('.like-icon');
            const countSpan = btnLike.querySelector('.like-count');
            
            if (estMaintenantLike) {
                iconSpan.textContent = '❤️';
                countSpan.textContent = nouveauTotal;
                btnLike.style.borderColor = 'var(--primary)';
                btnLike.style.color = 'var(--primary)';
            } else {
                iconSpan.textContent = '🤍';
                countSpan.textContent = nouveauTotal;
                btnLike.style.borderColor = '#555';
                btnLike.style.color = 'white';
            }
        }
    });

    // ── GESTION DE LA RECHERCHE (STyle NETFLIX) ──
    const initialiserRecherche = () => {
        const searchWrapper = document.getElementById('search-bar-container');
        const searchInput = document.getElementById('global-search-input');
        const searchTrigger = document.getElementById('search-trigger');

        if (!searchWrapper || !searchInput) return;

        // Ouvrir au clic
        searchWrapper.onclick = (e) => {
            if (!searchWrapper.classList.contains('active')) {
                searchWrapper.classList.add('active');
                searchInput.focus();
                e.stopPropagation();
            }
        };

        // Fermer si clic à l'extérieur
        document.addEventListener('click', (e) => {
            if (!searchWrapper.contains(e.target) && searchInput.value.trim() === "") {
                searchWrapper.classList.remove('active');
            }
        });

        // Logique de recherche "LIVE"
        let searchTimeout = null;
        searchInput.oninput = () => {
            const query = searchInput.value.trim();
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                // Si on n'est pas sur l'accueil, on y va d'abord
                if (window.location.pathname !== '/' && window.location.hash !== '#/') {
                    // Si on utilise un router avec pushState
                    if (window.appRouter) {
                        await window.appRouter.navigate('/');
                    }
                }
                
                // On appelle le filtre de l'accueil
                if (query.length >= 2) {
                    AccueilController.afficherCatalogue(query);
                } else if (query.length === 0) {
                    AccueilController.afficherCatalogue(); // Reset
                }
            }, 300); // Debounce de 300ms
        };

        // Touche Echap pour fermer
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchWrapper.classList.contains('active')) {
                searchInput.value = "";
                searchWrapper.classList.remove('active');
                if (window.location.pathname === '/') AccueilController.afficherCatalogue();
            }
        });
    };

    initialiserRecherche();

    // Initialisation du Routeur
    window.appRouter = new Router(routes);
    
    console.log("Webtoon Studio Initialisé - Architecture prête.");
});
