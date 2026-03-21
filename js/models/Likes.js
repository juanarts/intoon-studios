import SupabaseService from '../services/SupabaseService.js';
import Auth from './Auth.js';

export default class Likes {
    /**
     * @returns {Promise<Boolean>} Vrai si l'utilisateur connecté a liké ce webtoon
     */
    static async aLike(idProjet) {
        const user = Auth.getUtilisateur();
        if (!user) return false;

        const client = SupabaseService.getClient();
        const { data, error } = await client
            .from('likes')
            .select('id')
            .eq('projet_id', idProjet)
            .eq('user_id', user.id)
            .single();

        return !!data;
    }

    /**
     * @returns {Promise<Boolean>} Le nouvel état (true si liké, false si enlevé)
     */
    static async basculerLike(idProjet) {
        const user = Auth.getUtilisateur();
        if (!user) {
            alert("Connectez-vous pour liker !");
            return false;
        }

        const client = SupabaseService.getClient();
        const estDejaLike = await this.aLike(idProjet);

        if (estDejaLike) {
            await client.from('likes').delete().eq('projet_id', idProjet).eq('user_id', user.id);
            return false;
        } else {
            await client.from('likes').insert([{ projet_id: idProjet, user_id: user.id }]);
            return true;
        }
    }

    /**
     * Récupère le NOMBRE TOTAL de likes pour un projet précis (Global)
     */
    static async getTotalLikes(idProjet) {
        const client = SupabaseService.getClient();
        const { count, error } = await client
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('projet_id', idProjet);
        if (error) {
            console.error("Erreur likes:", error);
            return 0;
        }
        
        return count || 0;
    }
}
