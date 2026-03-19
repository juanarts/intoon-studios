/**
 * BadgesService — Système de Gamification INTOON STUDIOS
 * Badges style Fortnite, attribués selon le rôle et l'activité.
 */
export default class Badges {

    // Catalogue complet des badges disponibles
    static CATALOGUE = {
        the_king: {
            id: 'the_king',
            label: 'THE KING 👑',
            description: 'Le créateur de la plateforme. Le Boss des Boss.',
            image: '/assets/badges/badge_the_king.png',
            rarity: 'legendary',
            color: '#FFD700',
            glow: '0 0 20px rgba(255, 215, 0, 0.8)',
        },
        createur: {
            id: 'createur',
            label: 'CRÉATEUR ✨',
            description: 'Artiste publié sur la plateforme.',
            image: '/assets/badges/badge_createur.png',
            rarity: 'epic',
            color: '#a855f7',
            glow: '0 0 15px rgba(168, 85, 247, 0.7)',
        },
        vip: {
            id: 'vip',
            label: 'VIP 💎',
            description: 'Membre premium de la communauté.',
            image: '/assets/badges/badge_vip.png',
            rarity: 'rare',
            color: '#f59e0b',
            glow: '0 0 15px rgba(245, 158, 11, 0.6)',
        },
        lecteur: {
            id: 'lecteur',
            label: 'LECTEUR 📖',
            description: 'Membre actif de la communauté.',
            image: '/assets/badges/badge_lecteur.png',
            rarity: 'common',
            color: '#22c55e',
            glow: '0 0 10px rgba(34, 197, 94, 0.5)',
        },
        nouveau: {
            id: 'nouveau',
            label: 'NOUVEAU ⭐',
            description: 'Vient de rejoindre la communauté !',
            image: '/assets/badges/badge_nouveau.png',
            rarity: 'common',
            color: '#06b6d4',
            glow: '0 0 10px rgba(6, 182, 212, 0.5)',
        },
    };

    /**
     * Retourne la liste de badges pour un utilisateur selon son rôle.
     * @param {Object} user - { id, email, role, is_vip, pseudo }
     */
    static getBadgesUtilisateur(user) {
        if (!user) return [this.CATALOGUE.nouveau];
        const badges = [];

        // Badge exclusif THE KING pour l'admin fondateur
        if (user.role === 'admin') {
            badges.push(this.CATALOGUE.the_king);
        }

        // Badge CRÉATEUR
        if (user.role === 'createur' || user.role === 'admin') {
            badges.push(this.CATALOGUE.createur);
        }

        // Badge VIP
        if (user.is_vip || user.role === 'admin') {
            badges.push(this.CATALOGUE.vip);
        }

        // Badge LECTEUR (tout membre connecté hors nouveau)
        if (user.role === 'lecteur' || user.role === 'moderateur') {
            badges.push(this.CATALOGUE.lecteur);
        }

        // Badge NOUVEAU si pas d'autres badges spéciaux
        if (badges.length === 0) {
            badges.push(this.CATALOGUE.nouveau);
        }

        return badges;
    }

    /**
     * Génère le HTML d'un badge (image + tooltip + animation)
     */
    static renderBadge(badge, size = 60) {
        const rarityBorder = {
            legendary: 'border: 2px solid #FFD700;',
            epic: 'border: 2px solid #a855f7;',
            rare: 'border: 2px solid #f59e0b;',
            common: 'border: 2px solid #444;',
        }[badge.rarity] || '';

        return `
            <div class="badge-item" title="${badge.label}: ${badge.description}" style="
                position: relative;
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            ">
                <div style="
                    width: ${size}px; height: ${size}px;
                    border-radius: 12px;
                    overflow: hidden;
                    ${rarityBorder}
                    box-shadow: ${badge.glow};
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    background: rgba(0,0,0,0.4);
                "
                onmouseover="this.style.transform='scale(1.15) rotate(-3deg)'; this.style.boxShadow='${badge.glow.replace(')', ', 1)').replace('0.8', '1').replace('0.7', '1').replace('0.6', '1').replace('0.5', '1')}, 0 0 30px ${badge.color}aa'"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='${badge.glow}'"
                >
                    <img src="${badge.image}" alt="${badge.label}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <span style="
                    font-size: 0.6rem;
                    color: ${badge.color};
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    text-shadow: 0 0 8px ${badge.color}88;
                    white-space: nowrap;
                ">${badge.label.split(' ')[0]}</span>
            </div>
        `;
    }

    /**
     * Génère la section badges complète pour le profil
     */
    static renderBadgesSection(user) {
        const badges = this.getBadgesUtilisateur(user);
        return `
            <div style="margin-top: 20px;">
                <h4 style="color:#aaa; font-size:0.75rem; letter-spacing:3px; text-transform:uppercase; margin-bottom:12px; font-family:'Outfit',sans-serif;">
                    🎮 Mes Badges
                </h4>
                <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;">
                    ${badges.map(b => this.renderBadge(b, 64)).join('')}
                </div>
            </div>
        `;
    }
}
