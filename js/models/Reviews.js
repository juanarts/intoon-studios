import Auth from './Auth.js';
import Security from '../utils/Security.js';

export default class Reviews {
    static dbKey = 'intoon_reviews';

    static obtenirTous(idProjet) {
        const data = localStorage.getItem(this.dbKey);
        const reviews = data ? JSON.parse(data) : [];
        // Supporte idProjet (standard) et projetId (mon erreur passée)
        return reviews.filter(r => r.idProjet === idProjet || r.projetId === idProjet);
    }

    static ajouter(idProjet, note, commentaire, roleUtilisateur) {
        const data = localStorage.getItem(this.dbKey);
        const reviews = data ? JSON.parse(data) : [];
        
        const user = Auth.getUtilisateur();
        const cleanComment = Security.sanitizeInput(commentaire, 500);

        reviews.unshift({
            id: 'rev-' + Date.now(),
            idProjet,
            note: parseInt(note, 10),
            commentaire: cleanComment,
            role: roleUtilisateur,
            pseudo: user ? user.pseudo : "Anonyme",
            avatar: user ? (user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.pseudo}`) : "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
            authorId: user ? user.id : null,
            date: new Date().toLocaleDateString('fr-FR'),
            likes: [],
            reponses: [],
            modifie: false
        });

        localStorage.setItem(this.dbKey, JSON.stringify(reviews));
        return this.obtenirTous(idProjet);
    }

    static liker(reviewId, userId) {
        const data = JSON.parse(localStorage.getItem(this.dbKey) || '[]');
        const rev = data.find(r => r.id === reviewId);
        if (rev && userId) {
            if (!rev.likes) rev.likes = [];
            const idx = rev.likes.indexOf(userId);
            if (idx === -1) rev.likes.push(userId);
            else rev.likes.splice(idx, 1);
            localStorage.setItem(this.dbKey, JSON.stringify(data));
        }
        return data;
    }

    static repondre(reviewId, texte, user) {
        const data = JSON.parse(localStorage.getItem(this.dbKey) || '[]');
        const rev = data.find(r => r.id === reviewId);
        if (rev && user) {
            if (!rev.reponses) rev.reponses = [];
            rev.reponses.push({
                id: 'rep-' + Date.now(),
                pseudo: user.pseudo,
                avatar: user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.pseudo}`,
                texte: texte,
                date: 'À l\'instant'
            });
            localStorage.setItem(this.dbKey, JSON.stringify(data));
        }
        return data;
    }

    static modifier(reviewId, nouveauTexte, userId) {
        const data = JSON.parse(localStorage.getItem(this.dbKey) || '[]');
        const rev = data.find(r => r.id === reviewId);
        if (rev && rev.authorId === userId) {
            rev.commentaire = nouveauTexte;
            rev.modifie = true;
            localStorage.setItem(this.dbKey, JSON.stringify(data));
        }
        return data;
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
