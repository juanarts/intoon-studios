export default class Historique {
    /**
     * Sauvegarde le dernier chapitre lu par l'utilisateur (mémoire locale du nav)
     */
    static enregistrer(idProjet, idChapitre) {
        localStorage.setItem('intoon_historique', JSON.stringify({ idProjet, idChapitre }));
    }

    /**
     * Récupère les identifiants de la dernière lecture
     * @returns {Object|null} {idProjet, idChapitre}
     */
    static getDernier() {
        const h = localStorage.getItem('intoon_historique');
        return h ? JSON.parse(h) : null;
    }
}
