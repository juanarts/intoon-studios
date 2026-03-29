import SupabaseService from '../services/SupabaseService.js';
import Auth from './Auth.js';
import Security from '../utils/Security.js';

export default class Reviews {
    /**
     * Récupère tous les avis pour un projet avec les données du profil incluses
     */
    static async obtenirTous(idProjet) {
        const client = SupabaseService.getClient();
        const { data, error } = await client
            .from('reviews')
            .select(`
                *,
                profils (
                    pseudo,
                    avatar_url,
                    role
                )
            `)
            .eq('projet_id', idProjet)
            .order('created_at', { ascending: false });

        if (error || !data) {
            console.error("Erreur chargement avis (la table 'reviews' manque sans doute):", error);
            return [];
        }

        // Mapping pour compatibilité avec la vue existante
        return data.map(r => ({
            id: r.id,
            idProjet: r.projet_id,
            note: r.note,
            commentaire: r.commentaire,
            pseudo: r.profils?.pseudo || "Anonyme",
            avatar: r.profils?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${r.profils?.pseudo || 'User'}`,
            role: r.profils?.role || 'lecteur',
            authorId: r.user_id,
            date: new Date(r.created_at).toLocaleDateString('fr-FR'),
            likes: [], // À implémenter si besoin de persistance des likes sur avis
            reponses: [], // À implémenter (simulé ou via table dédiée)
            modifie: false
        }));
    }

    /**
     * Ajoute un avis dans Supabase
     */
    static async ajouter(idProjet, note, commentaire) {
        const user = Auth.getUtilisateur();
        if (!user) return null;

        const cleanComment = Security.sanitizeInput(commentaire, 500);
        const client = SupabaseService.getClient();

        const { data, error } = await client
            .from('reviews')
            .insert([{
                projet_id: idProjet,
                user_id: user.id,
                note: parseInt(note, 10),
                commentaire: cleanComment
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Calcule la moyenne des notes pour un projet
     */
    static async getMoyenne(idProjet) {
        const client = SupabaseService.getClient();
        const { data, error } = await client
            .from('reviews')
            .select('note')
            .eq('projet_id', idProjet);
        
        if (error || !data || data.length === 0) return { moyenne: 0, total: 0 };
        
        const sum = data.reduce((acc, r) => acc + r.note, 0);
        const moyenne = (sum / data.length).toFixed(1);
        return { moyenne, total: data.length };
    }

    static genererEtoilesHTML(noteMoyenne) {
        const note = Math.round(parseFloat(noteMoyenne));
        let html = '';
        for(let i = 1; i <= 5; i++) {
            const colore = i <= note;
            html += `<span style="color:${colore ? '#eab308' : '#333'}; font-size:1.2rem; margin-right:2px;">${colore ? '★' : '☆'}</span>`;
        }
        return html;
    }

    // -- Méthodes simulées pour l'instant (à migrer si nécessaire) --
    static async liker(reviewId, userId) { return []; }
    static async repondre(reviewId, texte, user) { return []; }
    static async modifier(reviewId, nouveauTexte, userId) { return []; }
}
