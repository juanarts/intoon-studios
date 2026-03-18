export default class Chapitre {
    /**
     * Crée une instance de Chapitre depuis les données Supabase
     */
    constructor(data, projetId) {
        this.id = data.id;
        this.projetId = projetId || data.projet_id;
        this.titre = data.titre;
        this.ordre = data.ordre;
        // Jointure Supabase Cloud
        this.pages = data.pages_urls || data.pages || [];
        this.isPremium = data.is_premium || false;
    }
}
