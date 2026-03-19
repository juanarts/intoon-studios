// Supabase Configuration
const SUPABASE_URL = 'https://zrocotsbsgiddvcpavcb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyb2NvdHNic2dpZGR2Y3BhdmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzE2NjksImV4cCI6MjA4OTQ0NzY2OX0.6vlmszQDXbfXkNMTi4IjRC_2RgglWVCt4btsecVgemo';

// Si l'objet global supabase-js a été chargé via le CDN dans index.html
let supabaseClient = null;

export default class SupabaseService {
    static getClient() {
        if (!supabaseClient && window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        return supabaseClient;
    }

    /**
     * Simulation d'un ping de vérification serveur
     */
    static async verifierConnexion() {
        try {
            const client = this.getClient();
            if (!client) return false;
            
            // Requête système basique (auth ou table générique)
            const { data, error } = await client.from('projets').select('id').limit(1);
            if (error && error.code !== '42P01') { 
                // 42P01 c'est "Relation (table) does not exist", ce qui prouve qu'on a bien touché le serveur !
                console.warn('Erreur de connexion Supabase:', error.message);
                return false;
            }
            return true;
        } catch(err) {
            console.error('Crash Service Supabase:', err);
            return false;
        }
    }
}
