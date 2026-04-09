export default class Historique {
    /**
     * Sauvegarde le dernier chapitre lu par l'utilisateur
     */
    static async enregistrer(idProjet, idChapitre, scrollOffset = 0) {
        const payload = { idProjet, idChapitre, scrollOffset };
        
        // LocalStorage fallback
        localStorage.setItem('intoon_historique', JSON.stringify(payload));

        // Supabase sync
        const { default: Auth } = await import('./Auth.js');
        if (Auth.estConnecte()) {
            const { default: SupabaseService } = await import('../services/SupabaseService.js');
            const client = SupabaseService.getClient();
            const user = Auth.getUtilisateur();
            if (client && user) {
                try {
                    await client.from('historique').upsert({
                        user_id: user.id,
                        projet_id: idProjet,
                        chapitre_id: idChapitre,
                        scroll_offset: scrollOffset,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' }); // Supposant qu'on garde 1 seul historique actif ou onConflict sur user_id+projet_id
                } catch(e) { console.warn("Supabase Historique fail", e); }
            }
        }
    }

    /**
     * Récupère les identifiants de la dernière lecture
     * @returns {Object|null} {idProjet, idChapitre, scrollOffset}
     */
    static async getDernier() {
        const { default: Auth } = await import('./Auth.js');
        if (Auth.estConnecte()) {
            const { default: SupabaseService } = await import('../services/SupabaseService.js');
            const client = SupabaseService.getClient();
            const user = Auth.getUtilisateur();
            if (client && user) {
                try {
                    const { data, error } = await client.from('historique')
                        .select('projet_id, chapitre_id, scroll_offset')
                        .eq('user_id', user.id)
                        .order('updated_at', { ascending: false })
                        .limit(1)
                        .single();
                        
                    if (data) {
                        return {
                            idProjet: data.projet_id,
                            idChapitre: data.chapitre_id,
                            scrollOffset: data.scroll_offset || 0
                        };
                    }
                } catch(e) { /* ignore and fallback */ }
            }
        }
        
        // Fallback local
        const h = localStorage.getItem('intoon_historique');
        return h ? JSON.parse(h) : null;
    }
}
