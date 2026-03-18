import Chapitre from './Chapitre.js';

export default class Projet {
    /**
     * Crée une instance de Projet.
     * @param {Object} data Données brutes issues de l'API / JSON
     */
    constructor(data) {
        this.id = data.id;
        this.titre = data.titre;
        this.couverture = data.couverture;
        this.videoPromoUrl = data.videoPromoUrl || null;
        this.likes = data.likes || 0; // Donnée métrique persistée
        this.pegi = data.pegi || "TP"; // TP (Tout Public), 12+, 16+, 18+
        this.statut = data.statut || "publié"; // statut : "publié", "brouillon", "banni"
        this.langues = data.langues || ["fr"]; // Localisation (ex: 'fr', 'en', 'jp')
        
        // Instanciation directe d'objets Chapitre (POO)
        this.chapitres = Array.isArray(data.chapitres) 
            ? data.chapitres.map(chData => new Chapitre(chData, this.id)) 
            : [];
    }

    /**
     * Requête AJAX asynchrone pour charger tous les projets (Simulation de BDD)
     * @returns {Promise<Projet[]>} Liste d'instances de Projet
     */
    static async chargerTous() {
        try {
            // 1. Lecture du Cache Persistant (Séries Modifiées par l'Admin)
            const localDb = localStorage.getItem('intoon_db');
            if (localDb) {
                const dataJSON = JSON.parse(localDb);
                return dataJSON.map(projetData => new Projet(projetData));
            }

            // 2. Fallback: Lecture Initiale depuis le JSON Statique
            const reponse = await fetch('/data/projets.json');
            if (!reponse.ok) throw new Error("Erreur réseau");
            
            const dataJSON = await reponse.json();
            
            // 3. Sauvegarde immédiate en base locale pour autoriser les futures écritures Administrateur
            localStorage.setItem('intoon_db', JSON.stringify(dataJSON));

            return dataJSON.map(projetData => new Projet(projetData));
        } catch (erreur) {
            console.error("Erreur système lors du chargement des projets :", erreur);
            return [];
        }
    }

    /**
     * Écrit la base de données entière dans le navigateur.
     * Déclenché par le Super Admin (AdminController)
     * @param {Array} listeProjets
     */
    static sauvegarderTous(listeProjets) {
        localStorage.setItem('intoon_db', JSON.stringify(listeProjets));
    }

    /**
     * Recherche un projet spécifique par son identifiant
     * @param {String} id
     * @returns {Promise<Projet|null>} Instance de Projet ou null si non trouvé
     */
    static async chargerParId(id) {
        const tous = await Projet.chargerTous();
        return tous.find(p => p.id === id) || null;
    }
}
