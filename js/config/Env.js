/**
 * 🌍 Gestionnaire d'Environnement INTOON STUDIOS
 * Centralise les clés API et permet l'injection via Vercel ou window.ENV
 */

const Env = {
    // URL de votre instance Supabase
    SUPABASE_URL: window.INTOON_ENV?.SUPABASE_URL || 'https://zrocotsbsgiddvcpavcb.supabase.co',

    // Clé Anon (Publique par design)
    // 💡 Pour la sécurité réelle, utilisez la Row Level Security (RLS) dans Supabase.
    SUPABASE_ANON_KEY: window.INTOON_ENV?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyb2NvdHNic2dpZGR2Y3BhdmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzE2NjksImV4cCI6MjA4OTQ0NzY2OX0.6vlmszQDXbfXkNMTi4IjRC_2RgglWVCt4btsecVgemo',

    /**
     * Tente de récupérer une valeur de configuration
     */
    get(key) {
        return this[key] || null;
    }
};

export default Env;
