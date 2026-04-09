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

    /**
     * Insère un nouveau chapitre en BDD
     */
    static async ajouter(chapitreData) {
        // Nécessite l'import de SupabaseService (réglé par injection ou chargement direct)
        const { default: SupabaseService } = await import('../services/SupabaseService.js');
        const client = SupabaseService.getClient();
        
        const { data, error } = await client
            .from('chapitres')
            .insert([{
                projet_id: chapitreData.projet_id,
                titre: chapitreData.titre,
                ordre: chapitreData.ordre,
                pages_urls: chapitreData.pages_urls,
                is_premium: chapitreData.is_premium || false
            }])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    }
}
