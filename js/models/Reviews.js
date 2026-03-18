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
        
        reviews.unshift({
            id: 'rev-' + Date.now(),
            projetId,
            note: parseInt(note, 10),
            commentaire: commentaire.toLowerCase(), // Contrainte: tout en minuscule
            role: roleUtilisateur, // Permet l'affichage VIP
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
