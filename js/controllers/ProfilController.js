import VueProfil from '../views/VueProfil.js';
import Auth from '../models/Auth.js';
import Projet from '../models/Projet.js';
import SupabaseService from '../services/SupabaseService.js';
import BOT_PROFILS from '../data/BotProfils.js';

export default class ProfilController {

    // ── Afficher un profil public ─────────────────────────────
    static async afficher(userId) {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader">Chargement du profil...</div>';

        try {
            // ── Profils bots statiques (pas de Supabase) ──────────
            if (BOT_PROFILS[userId]) {
                app.innerHTML = VueProfil.rendreProfil(BOT_PROFILS[userId], [], false);
                return;
            }

            const client = SupabaseService.getClient();

            // Charger les données du profil depuis Supabase
            const { data: profil, error } = await client
                .from('profils')
                .select('id, pseudo, role, avatar_url, bio, genres_preferes, style_musique')
                .eq('id', userId)
                .single();

            if (error || !profil) {
                app.innerHTML = `<div style="text-align:center;padding:100px;color:#666;">Profil introuvable.</div>`;
                return;
            }

            // Charger les projets de cet utilisateur
            const tousLesProjets = await Projet.chargerTous();
            const mesProjets = tousLesProjets.filter(p => p.author_id === userId && p.statut !== 'banni');

            // Simuler des stats (à brancher sur de vraies données plus tard)
            profil.stats = {
                commentaires: profil.role === 'admin' ? 72 : Math.floor(Math.random() * 20),
                heuresLues: profil.role === 'admin' ? 140 : Math.floor(Math.random() * 50),
                projetsCreer: mesProjets.length,
                chapitresPublies: mesProjets.reduce((sum, p) => sum + (p.chapitres?.length || 0), 0)
            };

            const userConnecte = Auth.getUtilisateur();
            const estMoi = userConnecte && userConnecte.id === userId;

            app.innerHTML = VueProfil.rendreProfil(profil, mesProjets, estMoi);

        } catch (err) {
            console.error('Erreur ProfilController:', err);
            app.innerHTML = `<div style="text-align:center;padding:100px;color:#666;">Erreur de chargement.</div>`;
        }
    }

    // ── Sauvegarder les modifications du profil ───────────────
    static async sauvegarderProfil(e) {
        e.preventDefault();
        const user = Auth.getUtilisateur();
        if (!user) return;

        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">sync</span> Sauvegarde...';
        btn.disabled = true;

        try {
            const client = SupabaseService.getClient();
            const bioVal = document.getElementById('profil-bio')?.value?.trim() || '';
            const genres = [...document.querySelectorAll('input[name="genres"]:checked')].map(i => i.value);
            const musique = [...document.querySelectorAll('input[name="musique"]:checked')].map(i => i.value);

            let avatarUrl = null;
            const avatarFile = document.getElementById('profil-avatar')?.files?.[0];
            if (avatarFile) {
                const ext = avatarFile.name.split('.').pop();
                const filename = `avatar_${user.id}.${ext}`;
                await client.storage.from('covers').upload(filename, avatarFile, { upsert: true });
                const { data: { publicUrl } } = client.storage.from('covers').getPublicUrl(filename);
                avatarUrl = publicUrl;
            }

            const updateData = {
                bio: bioVal,
                genres_preferes: genres,
                style_musique: musique,
            };
            if (avatarUrl) updateData.avatar_url = avatarUrl;

            await client.from('profils').update(updateData).eq('id', user.id);

            btn.innerHTML = '<span class="material-symbols-outlined">check</span> Sauvegardé !';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.innerHTML = '<span class="material-symbols-outlined">save</span> Enregistrer le profil';
                btn.disabled = false;
                btn.style.background = '';
            }, 2500);
        } catch (err) {
            console.error(err);
            btn.innerHTML = '❌ Erreur — Réessayer';
            btn.disabled = false;
        }
    }
}
