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

        // Génération du Slug SEO (ex: "Chapitre 1" -> "chapitre-1")
        this.slug = this.titre ? this.titre.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '') : `chapitre-${this.ordre}`;
    }
}
