import SupabaseService from '../services/SupabaseService.js';
import Auth from './Auth.js';

export default class Commentaires {
    static async ajouter(idProjet, idChapitre, texte) {
        if (!Auth.estConnecte()) return null;
        
        const client = SupabaseService.getClient();
        const user = Auth.getUtilisateur();
        
        const comment = {
            projet_id: idProjet,
            chapitre_id: idChapitre,
            user_id: user.id,
            pseudo: user.pseudo,
            avatar_url: user.avatar_url,
            texte: texte,
            created_at: new Date().toISOString(),
            id: 'mock_' + Date.now() // Si Supabase génère l'ID, ceci sera replacé.
        };

        if (client) {
            try {
                const { data, error } = await client.from('commentaires_chapitres').insert([{
                    projet_id: idProjet,
                    chapitre_id: idChapitre,
                    user_id: user.id,
                    pseudo: user.pseudo,
                    avatar_url: user.avatar_url,
                    texte: texte
                }]).select().single();
                
                if (data) return data;
            } catch(e) { console.warn("Supabase Comments insert failed", e); }
        }
        
        // Optimistic return pour démo UI si erreur BDD
        return comment;
    }

    static async obtenirParChapitre(idChapitre) {
        const client = SupabaseService.getClient();
        if (client) {
            try {
                const { data, error } = await client.from('commentaires_chapitres')
                    .select('*')
                    .eq('chapitre_id', idChapitre)
                    .order('created_at', { ascending: false });
                
                if (data && !error) return data;
            } catch(e) { console.warn("Supabase Comments fetch failed", e); }
        }
        
        return [];
    }
}
