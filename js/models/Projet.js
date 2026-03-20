import SupabaseService from '../services/SupabaseService.js';
import Chapitre from './Chapitre.js';

export default class Projet {
    /**
     * Crée une instance de Projet depuis les données Supabase.
     */
    constructor(data) {
        this.id = data.id;
        this.authorId = data.author_id;
        this.titre = data.titre;
        this.description = data.description;
        this.couverture = data.couverture_url || data.couverture;
        this.videoPromoUrl = data.video_promo_url || data.videoPromoUrl || null;
        this.likes = data.likes_total || data.likes || 0;
        this.pegi = data.pegi_rating || data.pegi || "TP";
        this.statut = data.statut || "publie";
        this.langues = ["fr"]; 
        this.authorPseudo = data.profils?.pseudo || "Studio InToon";
        
        // Génération du Slug SEO (ex: "Mon Titre" -> "mon-titre")
        this.slug = this.titre ? this.titre.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '') // Retire spéciaux
            .replace(/[\s_-]+/g, '-') // Remplace espaces/soulignés par tiret
            .replace(/^-+|-+$/g, '') : this.id;
        
        const chaps = data.chapitres || [];
        chaps.sort((a,b) => a.ordre - b.ordre);
        
        this.chapitres = chaps.map(chData => new Chapitre(chData, this.id));
    }

    /**
     * Fetch tous les projets et leurs chapitres depuis Supabase
     */
    static async chargerTous() {
        try {
            const client = SupabaseService.getClient();
            const { data, error } = await client
                .from('projets')
                .select(`
                    *,
                    chapitres (
                        id, titre, pages_urls, is_premium, ordre
                    ),
                    profils (
                        pseudo
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Erreur Supabase (Projets):", error);
                return [];
            }
            
            return data.map(p => new Projet(p));
        } catch (erreur) {
            console.error("Erreur système chargement des projets:", erreur);
            return [];
        }
    }

    /**
     * Fetch uniquement une liste d'IDs spécifiques (Optimisation Favoris)
     */
    static async chargerPlusieurs(ids) {
        if (!ids || ids.length === 0) return [];
        try {
            const client = SupabaseService.getClient();
            const { data, error } = await client
                .from('projets')
                .select(`
                    *,
                    chapitres (
                        id, titre, pages_urls, is_premium, ordre
                    ),
                    profils (
                        pseudo
                    )
                `)
                .in('id', ids);

            if (error) {
                console.error("Erreur Supabase (Projets multiples):", error);
                return [];
            }
            return data.map(p => new Projet(p));
        } catch (erreur) {
            console.error("Erreur système chargement multiple projets:", erreur);
            return [];
        }
    }

    /**
     * Recherche un projet spécifique par son identifiant
     */
    static async chargerParId(id) {
        try {
            const client = SupabaseService.getClient();
            const { data, error } = await client
                .from('projets')
                .select(`
                    *,
                    chapitres (
                        id, titre, pages_urls, is_premium, ordre
                    ),
                    profils (
                        pseudo
                    )
                `)
                .eq('id', id)
                .single();

            if (error || !data) return null;
            return new Projet(data);
        } catch (e) {
            return null;
        }
    }

    /**
     * Recherche un projet par son Slug SEO (nom lisible)
     */
    static async chargerParSlug(slug) {
        try {
            const projets = await this.chargerTous();
            return projets.find(p => p.slug === slug) || null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Insère un nouveau projet en BDD (Soumission Créateur)
     */
    static async ajouter(projetData) {
        const client = SupabaseService.getClient();
        const { data, error } = await client
            .from('projets')
            .insert([{
                author_id: projetData.author_id,
                titre: projetData.titre,
                description: projetData.description,
                couverture_url: projetData.couverture,
                video_promo_url: projetData.videoPromoUrl,
                statut: projetData.statut || 'brouillon',
                pegi_rating: projetData.pegi || 'TP'
            }])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    }
}
