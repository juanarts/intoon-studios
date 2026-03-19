import SupabaseService from '../services/SupabaseService.js';

export default class Auth {
    static currentUser = null;
    static currentRole = 'lecteur';

    /**
     * Initialise la session globale Supabase au chargement de l'app
     */
    static async initialiser() {
        const client = SupabaseService.getClient();
        if (!client) return;

        const { data: { session } } = await client.auth.getSession();
        
        if (session) {
            this.currentUser = session.user;
            const { data: profil } = await client.from('profils').select('role, pseudo, avatar_url, bio, genres_preferes, style_musique').eq('id', session.user.id).single();
            if (profil) {
                this.currentRole = profil.role;
                this.currentUser.pseudo = profil.pseudo;
                this.currentUser.avatar_url = profil.avatar_url;
                this.currentUser.bio = profil.bio;
                this.currentUser.genres_preferes = profil.genres_preferes;
                this.currentUser.style_musique = profil.style_musique;
            }
        }

        // Écoute des changements de session (Multi-onglets, Refresh, etc)
        client.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                const { data: profil } = await client.from('profils').select('role, pseudo, avatar_url, bio, genres_preferes, style_musique').eq('id', session.user.id).single();
                if (profil) {
                    this.currentRole = profil.role;
                    this.currentUser.pseudo = profil.pseudo;
                    this.currentUser.avatar_url = profil.avatar_url;
                    this.currentUser.bio = profil.bio;
                    this.currentUser.genres_preferes = profil.genres_preferes;
                    this.currentUser.style_musique = profil.style_musique;
                }
                window.dispatchEvent(new Event('authStateChanged'));
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentRole = 'lecteur';
                window.dispatchEvent(new Event('authStateChanged'));
            }
        });
    }

    static estConnecte() {
        return this.currentUser !== null;
    }

    static async inscrire(email, motDePasse, pseudo) {
        const client = SupabaseService.getClient();
        // 1. Inscription Auth
        const { data, error } = await client.auth.signUp({
            email: email,
            password: motDePasse,
        });
        
        if (error) throw error;
        
        // 2. Création du profil public
        if (data.user) {
            await client.from('profils').insert([{
                id: data.user.id,
                pseudo: pseudo,
                role: 'lecteur'
            }]);
        }
        return data;
    }

    static async connecter(email, motDePasse) {
        const client = SupabaseService.getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email: email,
            password: motDePasse
        });
        if (error) throw error;
        return data;
    }

    static async deconnecter() {
        const client = SupabaseService.getClient();
        await client.auth.signOut();
    }

    static getUtilisateur() {
        return this.currentUser ? { 
            id: this.currentUser.id, 
            email: this.currentUser.email,
            pseudo: this.currentUser.pseudo || 'Utilisateur',
            avatar_url: this.currentUser.avatar_url,
            bio: this.currentUser.bio,
            genres_preferes: this.currentUser.genres_preferes,
            style_musique: this.currentUser.style_musique,
            statut: 'Membre', 
            role: this.currentRole 
        } : null;
    }
}
