export default class Favoris {
    /**
     * Récupère la liste des id depuis le LocalStorage
     * @returns {Array<String>} Liste des ID des projets favoris
     */
    static getTous() {
        const data = localStorage.getItem('webtoon_favoris');
        return data ? JSON.parse(data) : [];
    }

    /**
     * Ajoute ou retire un projet des favoris
     * @param {String} idProjet 
     * @returns {Boolean} true si le projet est devenu favori, false s'il a été retiré
     */
    static basculer(idProjet) {
        let favoris = this.getTous();
        if (favoris.includes(idProjet)) {
            favoris = favoris.filter(id => id !== idProjet); // Retirer
        } else {
            favoris.push(idProjet); // Ajouter
        }
        localStorage.setItem('webtoon_favoris', JSON.stringify(favoris));
        return favoris.includes(idProjet);
    }

    /**
     * Vérifie l'état favori d'un projet
     * @param {String} idProjet 
     * @returns {Boolean}
     */
    static estFavori(idProjet) {
        return this.getTous().includes(idProjet);
    }
}
