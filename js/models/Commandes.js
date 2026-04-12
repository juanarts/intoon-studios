import SupabaseService from '../services/SupabaseService.js';
import Auth from './Auth.js';

/**
 * 💳 Modèle Commandes — Gestion des transactions créateurs
 * Prêt pour l'intégration Stripe (stripe_session_id à brancher)
 */
export default class Commandes {

    /**
     * Récupère toutes les ventes d'un créateur (en tant que vendeur)
     * @param {string} vendeurId UUID du créateur
     * @returns {Promise<Array>}
     */
    static async getVentesParVendeur(vendeurId) {
        const client = SupabaseService.getClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('commandes')
                .select(`
                    *,
                    projets (titre, couverture_url)
                `)
                .eq('vendeur_id', vendeurId)
                .eq('statut', 'paid')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('[Commandes] Erreur getVentesParVendeur:', error.message);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('[Commandes] Exception getVentesParVendeur:', e);
            return [];
        }
    }

    /**
     * Calcule le revenu total d'un créateur
     * @param {string} vendeurId
     * @returns {Promise<number>} Montant total en €
     */
    static async getRevenuTotal(vendeurId) {
        const ventes = await this.getVentesParVendeur(vendeurId);
        return ventes.reduce((sum, v) => sum + (parseFloat(v.montant) || 0), 0);
    }

    /**
     * Récupère les ventes des 7 dernières semaines (pour graphique)
     * @param {string} vendeurId
     * @returns {Promise<Array<{label: string, montant: number}>>} 7 entrées
     */
    static async getVentesParSemaine(vendeurId) {
        const ventes = await this.getVentesParVendeur(vendeurId);

        // Construire un tableau des 7 derniers jours
        const jours = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            jours.push({
                label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: d.toISOString().split('T')[0],
                montant: 0
            });
        }

        // Agréger les ventes par jour
        ventes.forEach(v => {
            const day = v.created_at?.split('T')[0];
            const entry = jours.find(j => j.date === day);
            if (entry) entry.montant += parseFloat(v.montant) || 0;
        });

        return jours;
    }

    /**
     * Récupère toutes les commandes pour l'admin (vue globale)
     * @returns {Promise<Array>}
     */
    static async getToutesLesCommandes() {
        const client = SupabaseService.getClient();
        if (!client) return [];

        try {
            const { data, error } = await client
                .from('commandes')
                .select(`
                    *,
                    projets (titre),
                    profils:vendeur_id (pseudo)
                `)
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) {
                console.warn('[Commandes] Erreur getToutesLesCommandes:', error.message);
                return [];
            }
            return data || [];
        } catch (e) {
            console.warn('[Commandes] Exception getToutesLesCommandes:', e);
            return [];
        }
    }

    /**
     * Calcule les revenus par créateur (pour dashboard admin)
     * @returns {Promise<Array<{pseudo, totalVentes, totalMontant}>>}
     */
    static async getRevenusParCreateur() {
        const commandes = await this.getToutesLesCommandes();
        const map = new Map();

        commandes.forEach(c => {
            const pseudo = c.profils?.pseudo || c.vendeur_id || 'Inconnu';
            const vendeurId = c.vendeur_id;
            if (!map.has(vendeurId)) {
                map.set(vendeurId, { pseudo, totalVentes: 0, totalMontant: 0, vendeurId });
            }
            const entry = map.get(vendeurId);
            entry.totalVentes++;
            entry.totalMontant += parseFloat(c.montant) || 0;
        });

        return [...map.values()].sort((a, b) => b.totalMontant - a.totalMontant);
    }

    /**
     * Crée une commande (appelé après paiement Stripe réussi)
     * À brancher sur le webhook Stripe / la page de succès
     */
    static async creerCommande({ acheteurId, vendeurId, projetId, type, montant, stripeSessionId = null }) {
        const client = SupabaseService.getClient();
        if (!client) return null;

        const { data, error } = await client
            .from('commandes')
            .insert([{
                acheteur_id: acheteurId,
                vendeur_id: vendeurId,
                projet_id: projetId,
                type: type,
                montant: montant,
                stripe_session_id: stripeSessionId,
                statut: stripeSessionId ? 'pending' : 'paid' // pending si Stripe, paid si manuel
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
