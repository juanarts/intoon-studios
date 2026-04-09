/**
 * BadgesService — Système de Gamification INTOON STUDIOS
 * Collection complète de badges style Fortnite 3D.
 * L'admin Juan possède TOUS les badges de la collection.
 */
export default class Badges {

    static CATALOGUE = {
        // ─── LÉGENDAIRES ───────────────────────────────────────
        the_king: {
            id: 'the_king',
            label: 'THE KING 👑',
            description: 'Le Boss des Boss. Fondateur de la plateforme.',
            image: '/assets/badges/badge_the_king.png',
            rarity: 'legendary',
            color: '#FFD700',
            glow: '0 0 20px rgba(255,215,0,0.8)',
        },
        fondateur: {
            id: 'fondateur',
            label: 'FONDATEUR 🛡️',
            description: 'A bâti cette plateforme de zéro.',
            image: '/assets/badges/badge_fondateur.png',
            rarity: 'legendary',
            color: '#e5e7eb',
            glow: '0 0 18px rgba(229,231,235,0.7)',
        },
        pionnier: {
            id: 'pionnier',
            label: 'PIONNIER 🚀',
            description: 'Premier membre de la plateforme.',
            image: '/assets/badges/badge_pionnier.png',
            rarity: 'legendary',
            color: '#f97316',
            glow: '0 0 18px rgba(249,115,22,0.7)',
        },
        early_access: {
            id: 'early_access',
            label: 'EARLY ACCESS ⚡',
            description: 'Beta-testeur de la première heure.',
            image: '/assets/badges/badge_early_access.png',
            rarity: 'legendary',
            color: '#60a5fa',
            glow: '0 0 18px rgba(96,165,250,0.8)',
        },

        // ─── ÉPIQUES ───────────────────────────────────────────
        createur: {
            id: 'createur',
            label: 'CRÉATEUR ✨',
            description: 'Artiste publié sur la plateforme.',
            image: '/assets/badges/badge_createur.png',
            rarity: 'epic',
            color: '#a855f7',
            glow: '0 0 15px rgba(168,85,247,0.7)',
        },
        artiste: {
            id: 'artiste',
            label: 'ARTISTE 🎨',
            description: 'Maîtrise visuelle exceptionnelle.',
            image: '/assets/badges/badge_artiste.png',
            rarity: 'epic',
            color: '#ec4899',
            glow: '0 0 15px rgba(236,72,153,0.7)',
        },
        realisateur: {
            id: 'realisateur',
            label: 'RÉALISATEUR 🎬',
            description: 'A mis en ligne un trailer cinématique.',
            image: '/assets/badges/badge_realisateur.png',
            rarity: 'epic',
            color: '#e50914',
            glow: '0 0 15px rgba(229,9,20,0.7)',
        },
        scenariste: {
            id: 'scenariste',
            label: 'SCÉNARISTE 📜',
            description: 'Maître de la narration.',
            image: '/assets/badges/badge_scenariste.png',
            rarity: 'epic',
            color: '#d97706',
            glow: '0 0 15px rgba(217,119,6,0.7)',
        },
        saga: {
            id: 'saga',
            label: 'SAGA 📚',
            description: 'Créateur multi-séries.',
            image: '/assets/badges/badge_saga.png',
            rarity: 'epic',
            color: '#3b82f6',
            glow: '0 0 15px rgba(59,130,246,0.7)',
        },
        producteur: {
            id: 'producteur',
            label: 'PRODUCTEUR 🎥',
            description: 'A configuré une Fiche de Production complète.',
            image: '/assets/badges/badge_producteur.png',
            rarity: 'epic',
            color: '#eab308',
            glow: '0 0 15px rgba(234,179,8,0.7)',
        },

        // ─── RARES ─────────────────────────────────────────────
        vip: {
            id: 'vip',
            label: 'VIP 💎',
            description: 'Membre premium de la communauté.',
            image: '/assets/badges/badge_vip.png',
            rarity: 'rare',
            color: '#f59e0b',
            glow: '0 0 12px rgba(245,158,11,0.6)',
        },
        moderateur: {
            id: 'moderateur',
            label: 'MODÉRATEUR 🔰',
            description: 'Gardien de la communauté.',
            image: '/assets/badges/badge_moderateur.png',
            rarity: 'rare',
            color: '#6366f1',
            glow: '0 0 12px rgba(99,102,241,0.6)',
        },

        // ─── COMMUNS ───────────────────────────────────────────
        lecteur: {
            id: 'lecteur',
            label: 'LECTEUR 📖',
            description: 'Membre actif de la communauté.',
            image: '/assets/badges/badge_lecteur.png',
            rarity: 'common',
            color: '#22c55e',
            glow: '0 0 10px rgba(34,197,94,0.5)',
        },
        nouveau: {
            id: 'nouveau',
            label: 'NOUVEAU ⭐',
            description: 'Vient de rejoindre la communauté !',
            image: '/assets/badges/badge_nouveau.png',
            rarity: 'common',
            color: '#06b6d4',
            glow: '0 0 10px rgba(6,182,212,0.5)',
        },
        addict: {
            id: 'addict',
            label: 'ADDICT 📱',
            description: 'A atteint le Niveau 5 (Lecteur Assidu).',
            image: '/assets/badges/badge_lecteur.png',
            rarity: 'rare',
            color: '#10b981',
            glow: '0 0 12px rgba(16,185,129,0.5)',
        },

        // ─── SPÉCIAUX ──────────────────────────────────────────
        intoon_team: {
            id: 'intoon_team',
            label: 'INTOON 🛡️',
            description: 'Membre officiel de l\'équipe INTOON STUDIOS.',
            image: '/assets/badges/badge_intoon_team.png',
            rarity: 'legendary',
            color: '#e50914',
            glow: '0 0 20px rgba(229,9,20,0.8)',
        },
        bot: {
            id: 'bot',
            label: 'BOT 🤖',
            description: 'Profil automatisé de test INTOON.',
            image: '/assets/badges/badge_bot.png',
            rarity: 'rare',
            color: '#22d3ee',
            glow: '0 0 12px rgba(34,211,238,0.6)',
        },
        beta_testeur: {
            id: 'beta_testeur',
            label: 'BETA TESTEUR 🧪',
            description: 'Membre privilégié aidant à l\'amélioration du Studio.',
            image: '/assets/badges/badge_early_access.png', // Réutilisation temporaire ou logo dédié
            rarity: 'rare',
            color: '#60a5fa',
            glow: '0 0 12px rgba(96,165,250,0.6)',
        },
    };

    /** Tous les badges de l'admin (sauf vues/likes) */
    static BADGES_ADMIN = [
        'the_king','fondateur','pionnier','early_access',
        'createur','artiste','realisateur','scenariste','saga','producteur',
        'vip','moderateur','beta_testeur','addict'
    ];

    static getNiveau(xp) {
        if (!xp || xp < 0) return 1;
        // La formule : Niveau = sqrt(XP / 5) -> Lvl 2 = 5xp, Lvl 5 = 125xp
        return Math.floor(Math.sqrt(xp / 5)) + 1;
    }

    static getBadgesUtilisateur(user) {
        if (!user) return [this.CATALOGUE.nouveau];

        // Profils bots : badges définis manuellement via badges_ids
        if (user.isBot && user.badges_ids) {
            return user.badges_ids
                .map(id => this.CATALOGUE[id])
                .filter(Boolean);
        }

        const badges = [];
        if (user.role === 'admin') {
            return this.BADGES_ADMIN.map(id => this.CATALOGUE[id]);
        }
        if (user.role === 'createur') {
            badges.push(this.CATALOGUE.createur);
            badges.push(this.CATALOGUE.artiste);
            if (user.is_vip) badges.push(this.CATALOGUE.vip);
        }
        if (user.role === 'moderateur') {
            badges.push(this.CATALOGUE.moderateur);
            badges.push(this.CATALOGUE.lecteur);
        }
        if (user.is_vip && user.role !== 'createur') {
            badges.push(this.CATALOGUE.vip);
        }
        if (user.is_beta_tester) {
            badges.push(this.CATALOGUE.beta_testeur);
        }
        if (user.role === 'lecteur' && !user.is_beta_tester && !user.is_vip) {
            badges.push(this.CATALOGUE.lecteur);
        }
        
        // Badges par niveau/XP
        if (user.xp) {
            const niveau = this.getNiveau(user.xp);
            if (niveau >= 5) {
                badges.push(this.CATALOGUE.addict);
            }
        }

        if (badges.length === 0) {
            badges.push(this.CATALOGUE.nouveau);
        }
        return badges;
    }

    /** Badge HTML individuel avec animation hover */
    static renderBadge(badge, size = 60) {
        const rarityBorder = {
            legendary: `border: 2px solid ${badge.color}; box-shadow: ${badge.glow};`,
            epic:      `border: 2px solid ${badge.color}; box-shadow: ${badge.glow};`,
            rare:      `border: 1px solid ${badge.color}; box-shadow: ${badge.glow};`,
            common:    `border: 1px solid #444;`,
        }[badge.rarity] || '';

        return `
            <div class="badge-item" title="${badge.label} — ${badge.description}" style="
                display:inline-flex; flex-direction:column; align-items:center;
                gap:4px; cursor:pointer; position:relative;
            ">
                <div style="
                    width:${size}px; height:${size}px; border-radius:12px; overflow:hidden;
                    ${rarityBorder}
                    background:rgba(0,0,0,0.4);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                "
                onmouseover="this.style.transform='scale(1.18) rotate(-4deg)'"
                onmouseout="this.style.transform='scale(1)'"
                >
                    <img src="${badge.image}" alt="${badge.label}"
                        style="width:100%;height:100%;object-fit:cover;"
                        onerror="this.style.display='none'; this.closest('div').innerHTML='<div style=\'display:flex;align-items:center;justify-content:center;height:100%;font-size:1.8rem;\'>${badge.label.split(' ').pop()}</div>'">
                </div>
                <span style="
                    font-size:0.55rem; color:${badge.color};
                    font-family:'Outfit',sans-serif; font-weight:800;
                    letter-spacing:1px; text-transform:uppercase;
                    text-shadow:0 0 8px ${badge.color}88;
                    white-space:nowrap;
                ">${badge.label.replace(/\s*[^\w\s].*/,'')}</span>
            </div>
        `;
    }

    /** Section badges complète pour le profil */
    static renderBadgesSection(user) {
        const badges = this.getBadgesUtilisateur(user);
        const grouped = { legendary: [], epic: [], rare: [], common: [] };
        badges.forEach(b => (grouped[b.rarity] || grouped.common).push(b));

        const group = (rarity, label, color) => grouped[rarity].length === 0 ? '' : `
            <div style="margin-bottom:16px;">
                <div style="font-size:0.65rem; color:${color}; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; font-family:'Outfit',sans-serif;">
                    ${label} (${grouped[rarity].length})
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    ${grouped[rarity].map(b => this.renderBadge(b, 56)).join('')}
                </div>
            </div>
        `;

        return `
            <div style="margin-top:24px; padding:20px; background:rgba(255,255,255,0.03); border:1px solid #222; border-radius:12px;">
                <h4 style="color:#aaa; font-size:0.7rem; letter-spacing:3px; text-transform:uppercase; margin-bottom:16px; font-family:'Outfit',sans-serif;">
                    🎮 Mes Badges (${badges.length})
                </h4>
                ${group('legendary','⭐ Légendaires','#FFD700')}
                ${group('epic','💜 Épiques','#a855f7')}
                ${group('rare','💙 Rares','#6366f1')}
                ${group('common','🩶 Communs','#666')}
            </div>
        `;
    }
}
