/**
 * Routeur frontal - Gère la navigation sans recharger la page
 */
export default class Router {
    constructor(routes) {
        this.routes = routes;
        this.appDiv = document.getElementById('app');
        this.init();
    }

    init() {
        // Écouter les retours/avances du navigateur
        window.addEventListener('popstate', () => this.handleRoute());

        // Intercepter tous les clics sur des liens avec l'attribut data-link
        document.body.addEventListener('click', e => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });

        // Chargement de la route initiale
        this.handleRoute();
    }

    navigate(url) {
        history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        if (!document.startViewTransition) {
            return this.executeRoute();
        }
        
        // Native View Transition API (Netflix / Native App feel)
        document.startViewTransition(() => {
            return this.executeRoute();
        });
    }

    async executeRoute() {
        // Scroll to top automatically on route change
        window.scrollTo(0, 0);

        // Obtenir le chemin actuel
        const path = window.location.pathname;

        // Trouver la bonne route correspondant à l'URL (gestion des paramètres complexes)
        const match = this.routes.find(route => {
            const regexStr = '^' + route.path.replace(/\/:[^\/]+/g, '/([^/]+)') + '$';
            const regex = new RegExp(regexStr);
            return path.match(regex);
        });

        if (match) {
            // Extraire les arguments passés dans l'URL (ex: /projet/:id -> id)
            const regexStr = '^' + match.path.replace(/\/:[^\/]+/g, '/([^/]+)') + '$';
            const regex = new RegExp(regexStr);
            const params = path.match(regex).slice(1);
            
            try {
                // Appeler la méthode du contrôleur correspondant
                console.debug(`[Router] Navigation vers : ${path}`);
                await match.controller(...params);
            } catch (err) {
                console.error(`[Router Error] Échec du contrôleur pour ${path}:`, err);
                this.appDiv.innerHTML = `<div class="error" style="padding:100px; text-align:center;">
                    <h2>Une erreur de navigation est survenue.</h2>
                    <p style="color:#888;">${err.message || 'Erreur inconnue'}</p>
                    <button onclick="location.reload()" class="btn-primary" style="margin-top:20px;">Recharger l'application</button>
                </div>`;
            }
        } else {
            // Redirection vers l'accueil si route inconnue (404 par défaut vers l'accueil)
            if (path !== '/') {
                this.navigate('/');
            } else {
                this.appDiv.innerHTML = '<h1>Erreur : Contrôleur Accueil non défini</h1>';
            }
        }
    }
}
