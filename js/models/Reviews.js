import Auth from './Auth.js';

export default class Reviews {
    static dbKey = 'intoon_reviews';

    static obtenirTous(projetId) {
        const data = localStorage.getItem(this.dbKey);
        const reviews = data ? JSON.parse(data) : [];
        return reviews.filter(r => r.projetId === projetId);
    }

    static ajouter(projetId, note, commentaire, roleUtilisateur) {
        const data = localStorage.getItem(this.dbKey);
        const reviews = data ? JSON.parse(data) : [];
        
        // Récupérer les infos de l'utilisateur actuel via le modèle Auth importé
        const user = Auth.getUtilisateur();

        reviews.unshift({
            id: 'rev-' + Date.now(),
            projetId,
            note: parseInt(note, 10),
            commentaire: commentaire, // Liberté totale sur la casse
            role: roleUtilisateur,
            pseudo: user ? user.pseudo : "Anonyme",
            avatar: user ? (user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.pseudo}`) : "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
            date: new Date().toLocaleDateString('fr-FR')
        });

        localStorage.setItem(this.dbKey, JSON.stringify(reviews));
        return reviews.filter(r => r.projetId === projetId);
    }

    static getMoyenne(projetId) {
        const reviews = this.obtenirTous(projetId);
        if (reviews.length === 0) return { moyenne: 0, total: 0 };
        const sum = reviews.reduce((acc, r) => acc + r.note, 0);
        return { moyenne: (sum / reviews.length).toFixed(1), total: reviews.length };
    }

    static genererEtoilesHTML(noteMoyenne) {
        const note = Math.round(noteMoyenne); // Arrondi pour l'affichage visuel
        let html = '';
        for(let i = 1; i <= 5; i++) {
            if (i <= note) {
                html += '<span style="color:#e50914;">★</span>'; // Etoile pleine rouge Netflix
            } else {
                html += '<span style="color:#444;">★</span>'; // Etoile vide grise
            }
        }
        return html;
    }
}
