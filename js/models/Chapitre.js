export default class Chapitre {
    /**
     * Crée une instance de Chapitre.
     * @param {Object} data Données brutes du chapitre issues du JSON
     * @param {String} projetId Identifiant du projet parent
     */
    constructor(data, projetId) {
        this.id = data.id;
        this.projetId = projetId;
        this.titre = data.titre;
        this.ordre = data.ordre;
        // Liste des URLs d'images composant la BD
        this.pages = data.pages || [];
    }
}
