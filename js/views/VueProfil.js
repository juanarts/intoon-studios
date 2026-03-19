import Badges from '../models/Badges.js';

export default class VueProfil {

    // ── Mini-badges statistiques (CSS-only, petits, discrets) ──
    static renderStatBadge(icon, label, value, color = '#666', special = null) {
        const isGold = special === 'gold';
        return `
            <div title="${label}: ${value}" style="
                display:inline-flex; flex-direction:column; align-items:center; gap:3px;
                position:relative;
            ">
                <div style="
                    width:44px; height:44px; border-radius:10px;
                    background:rgba(255,255,255,0.05);
                    border:1px solid ${isGold ? '#FFD700' : color + '66'};
                    display:flex; align-items:center; justify-content:center;
                    font-size:1.3rem;
                    box-shadow:${isGold ? '0 0 12px rgba(255,215,0,0.5)' : 'none'};
                    transition:transform 0.15s ease;
                "
                onmouseover="this.style.transform='scale(1.12)'"
                onmouseout="this.style.transform='scale(1)'"
                >${icon}</div>
                <span style="font-size:0.6rem; color:${isGold ? '#FFD700' : color}; font-family:'Outfit',sans-serif; font-weight:700; white-space:nowrap;">${value}</span>
                <span style="font-size:0.5rem; color:#555; font-family:'Outfit',sans-serif; white-space:nowrap;">${label}</span>
            </div>
        `;
    }

    static getStatBadges(stats = {}) {
        const { commentaires = 0, heuresLues = 0, projetsCreer = 0, chapitresPublies = 0 } = stats;
        const badges = [];

        // Bouche en or (commentaires)
        if (commentaires >= 50) badges.push(this.renderStatBadge('👄', 'Commentaires', `${commentaires}`, '#FFD700', 'gold'));
        else if (commentaires >= 10) badges.push(this.renderStatBadge('💬', 'Commentaires', `${commentaires}`, '#a855f7'));
        else if (commentaires > 0) badges.push(this.renderStatBadge('💬', 'Commentaires', `${commentaires}`, '#666'));

        // Heures lues
        if (heuresLues >= 100) badges.push(this.renderStatBadge('⏱️', 'Heures lues', `${heuresLues}h`, '#f97316', 'gold'));
        else if (heuresLues > 0) badges.push(this.renderStatBadge('⏱️', 'Heures lues', `${heuresLues}h`, '#888'));

        // Projets créés
        if (projetsCreer >= 5) badges.push(this.renderStatBadge('🗂️', 'Projets', `×${projetsCreer}`, '#22c55e', 'gold'));
        else if (projetsCreer > 0) badges.push(this.renderStatBadge('🗂️', 'Projets', `×${projetsCreer}`, '#22c55e'));

        // Chapitres publiés
        if (chapitresPublies > 0) badges.push(this.renderStatBadge('📄', 'Chapitres', `×${chapitresPublies}`, '#06b6d4'));

        return badges.join('');
    }

    // ── Page Profil Public ──────────────────────────────────────
    static rendreProfil(profil, projets = [], estMoi = false) {
        const { id, pseudo, role, avatar_url, bio, genres_preferes, stats = {} } = profil;

        const avatarSrc = avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${pseudo}&backgroundColor=0a0a0d`;

        const genresArr = genres_preferes ? (Array.isArray(genres_preferes) ? genres_preferes : [genres_preferes]) : [];

        const roleColor = { admin: '#FFD700', createur: '#a855f7', moderateur: '#6366f1', vip: '#f59e0b', lecteur: '#22c55e', nouveau: '#06b6d4' }[role] || '#666';
        const roleLabel = { admin: '👑 Admin', createur: '✨ Créateur', moderateur: '🔰 Modérateur', vip: '💎 VIP', lecteur: '📖 Lecteur' }[role] || '⭐ Nouveau';

        const mainBadges = Badges.getBadgesUtilisateur(profil);
        const statBadgesHtml = this.getStatBadges(stats);

        const projetsHtml = projets.length > 0 ? projets.map(p => `
            <a href="/projet/${p.id}" data-link style="
                display:flex; gap:12px; align-items:center; padding:12px;
                background:rgba(255,255,255,0.03); border:1px solid #222;
                border-radius:8px; text-decoration:none; transition:background 0.2s;
            "
            onmouseover="this.style.background='rgba(255,255,255,0.07)'"
            onmouseout="this.style.background='rgba(255,255,255,0.03)'"
            >
                <img src="${p.couverture_url || p.couverture}" alt="${p.titre}" style="width:50px;height:70px;object-fit:cover;border-radius:4px;flex-shrink:0;">
                <div>
                    <div style="color:white;font-weight:bold;font-family:'Outfit',sans-serif;font-size:0.95rem;">${p.titre}</div>
                    <div style="color:#666;font-size:0.8rem;margin-top:3px;">${p.statut || 'en cours'}</div>
                </div>
            </a>
        `).join('') : `<p style="color:#555;font-style:italic;">Aucune série publiée.</p>`;

        return `
        <div style="max-width:900px; margin:60px auto; padding:0 4%; animation:fadeIn 0.4s ease;">

            <!-- Carte Profil -->
            <div style="background:linear-gradient(135deg,#0d0d10,#111116); border:1px solid #222; border-radius:20px; overflow:hidden; margin-bottom:30px; box-shadow:0 20px 60px rgba(0,0,0,0.5);">

                <!-- Bannière -->
                <div style="height:120px; background:linear-gradient(135deg, ${roleColor}22 0%, #000 70%, ${roleColor}11 100%); position:relative;">
                    <div style="position:absolute; inset:0; background:url('') center/cover; opacity:0.1;"></div>
                </div>

                <!-- Contenu Profil -->
                <div style="padding:0 30px 30px; margin-top:-50px; position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:15px; margin-bottom:20px;">
                        <div style="display:flex; align-items:flex-end; gap:20px;">
                            <!-- Avatar -->
                            <div style="position:relative; flex-shrink:0;">
                                <img src="${avatarSrc}" alt="${pseudo}"
                                    style="width:100px;height:100px;border-radius:50%;border:4px solid ${roleColor};box-shadow:0 0 25px ${roleColor}55;background:#111;object-fit:cover;">
                                ${role === 'admin' ? '<div style="position:absolute;bottom:0;right:0;background:#FFD700;color:#000;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:bold;">👑</div>' : ''}
                            </div>
                            <div style="padding-bottom:8px;">
                                <h1 style="font-size:1.8rem;color:white;font-family:'Outfit',sans-serif;margin:0 0 4px;">${pseudo}</h1>
                                <span style="background:${roleColor}22;color:${roleColor};border:1px solid ${roleColor}55;padding:3px 12px;border-radius:20px;font-size:0.75rem;font-weight:700;font-family:'Outfit',sans-serif;">${roleLabel}</span>
                            </div>
                        </div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;padding-bottom:8px;">
                            <a href="/inbox" data-link style="background:rgba(255,255,255,0.08);border:1px solid #333;color:white;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.85rem;display:flex;align-items:center;gap:6px;">
                                <span class="material-symbols-outlined" style="font-size:1rem;">mail</span> Message
                            </a>
                            ${estMoi ? `<a href="/dashboard" data-link style="background:${roleColor};color:#000;padding:8px 16px;border-radius:8px;text-decoration:none;font-size:0.85rem;font-weight:bold;display:flex;align-items:center;gap:6px;"><span class="material-symbols-outlined" style="font-size:1rem;">edit</span> Éditer mon profil</a>` : ''}
                        </div>
                    </div>

                    <!-- Bio -->
                    ${bio ? `<p style="color:#aaa;font-size:0.95rem;line-height:1.6;margin-bottom:20px;max-width:600px;">${bio}</p>` : ''}

                    <!-- Genres / Style musique -->
                    ${genresArr.length > 0 ? `
                    <div style="margin-bottom:20px;display:flex;gap:8px;flex-wrap:wrap;">
                        ${genresArr.map(g => `<span style="background:rgba(255,255,255,0.06);border:1px solid #333;color:#bbb;padding:4px 12px;border-radius:20px;font-size:0.8rem;">🎵 ${g}</span>`).join('')}
                    </div>` : ''}

                    <!-- Badges principaux -->
                    <div style="margin-bottom:24px;">
                        <div style="font-size:0.65rem;color:#555;letter-spacing:3px;text-transform:uppercase;font-family:'Outfit',sans-serif;margin-bottom:10px;">🎮 Badges</div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;">
                            ${mainBadges.map(b => Badges.renderBadge(b, 52)).join('')}
                        </div>
                    </div>

                    <!-- Mini-badges stats -->
                    ${statBadgesHtml ? `
                    <div>
                        <div style="font-size:0.65rem;color:#555;letter-spacing:3px;text-transform:uppercase;font-family:'Outfit',sans-serif;margin-bottom:10px;">📊 Statistiques</div>
                        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start;">
                            ${statBadgesHtml}
                        </div>
                    </div>` : ''}
                </div>
            </div>

            <!-- Séries publiées -->
            ${role === 'createur' || role === 'admin' ? `
            <div style="background:#0d0d10;border:1px solid #222;border-radius:16px;padding:25px;">
                <h2 style="font-size:1.2rem;color:white;font-family:'Outfit',sans-serif;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
                    <span class="material-symbols-outlined" style="color:var(--primary);">movie_creation</span>
                    Séries (${projets.length})
                </h2>
                <div style="display:flex;flex-direction:column;gap:10px;">${projetsHtml}</div>
            </div>` : ''}

        </div>`;
    }

    // ── Formulaire de gestion du profil (intégré au Dashboard) ──
    static rendreEditProfil(profil) {
        const genres = ['Action', 'Romance', 'Fantaisie', 'Horreur', 'Sci-Fi', 'Comédie', 'Drame', 'Aventure', 'Mystère', 'Slice of Life'];
        const musiques = ['Hip-Hop', 'Lo-fi', 'Jazz', 'Électro', 'Rock', 'Classique', 'R&B', 'Afrobeat', 'Indie', 'Trap'];
        const prefGenres = profil?.genres_preferes || [];
        const prefMusique = profil?.style_musique || [];

        return `
        <div style="background:rgba(255,255,255,0.03);border:1px solid #222;border-radius:12px;padding:25px;margin-bottom:30px;">
            <h3 style="font-size:1.1rem;color:white;font-family:'Outfit',sans-serif;margin-bottom:20px;display:flex;align-items:center;gap:8px;">
                <span class="material-symbols-outlined" style="color:var(--primary);">manage_accounts</span>
                Gérer mon Profil Public
                <a href="/profil/${profil?.id || ''}" data-link style="margin-left:auto;color:var(--primary);font-size:0.8rem;text-decoration:none;display:flex;align-items:center;gap:4px;">
                    <span class="material-symbols-outlined" style="font-size:1rem;">open_in_new</span> Voir mon profil public
                </a>
            </h3>
            <form id="form-edit-profil" style="display:flex;flex-direction:column;gap:16px;">
                <!-- Avatar Upload -->
                <div style="display:flex;align-items:center;gap:15px;">
                    <img id="avatar-preview" src="${profil?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profil?.pseudo}`}"
                        style="width:70px;height:70px;border-radius:50%;border:2px solid #333;object-fit:cover;background:#111;">
                    <div>
                        <label style="color:#aaa;font-size:0.85rem;display:block;margin-bottom:6px;">Photo de profil</label>
                        <input type="file" id="profil-avatar" accept="image/png,image/jpeg,image/webp"
                            style="color:#aaa;font-size:0.8rem;" onchange="
                                const file = this.files[0];
                                if(file){ const r=new FileReader(); r.onload=e=>document.getElementById('avatar-preview').src=e.target.result; r.readAsDataURL(file); }
                            ">
                    </div>
                </div>

                <!-- Bio -->
                <div>
                    <label style="color:#aaa;font-size:0.85rem;display:block;margin-bottom:6px;">Bio</label>
                    <textarea id="profil-bio" maxlength="160" placeholder="Décris-toi en quelques mots..." style="width:100%;padding:12px;background:#1a1a20;border:1px solid #333;border-radius:8px;color:white;font-size:0.9rem;resize:vertical;min-height:80px;font-family:'Outfit',sans-serif;" rows="3">${profil?.bio || ''}</textarea>
                    <div style="font-size:0.7rem;color:#555;text-align:right;margin-top:3px;">Max 160 caractères</div>
                </div>

                <!-- Genres préférés -->
                <div>
                    <label style="color:#aaa;font-size:0.85rem;display:block;margin-bottom:8px;">📚 Genres préférés</label>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${genres.map(g => `
                            <label style="cursor:pointer;">
                                <input type="checkbox" name="genres" value="${g}" ${prefGenres.includes(g) ? 'checked' : ''} style="display:none;">
                                <span class="tag-check" style="padding:5px 12px;border:1px solid ${prefGenres.includes(g) ? 'var(--primary)' : '#333'};border-radius:20px;font-size:0.8rem;color:${prefGenres.includes(g) ? 'var(--primary)' : '#888'};background:${prefGenres.includes(g) ? 'rgba(229,9,20,0.1)' : 'transparent'};transition:all 0.2s;"
                                onclick="this.closest('label').querySelector('input').checked=!this.closest('label').querySelector('input').checked; this.style.borderColor=this.closest('label').querySelector('input').checked?'var(--primary)':'#333'; this.style.color=this.closest('label').querySelector('input').checked?'var(--primary)':'#888'; this.style.background=this.closest('label').querySelector('input').checked?'rgba(229,9,20,0.1)':'transparent';"
                                >${g}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Style musique -->
                <div>
                    <label style="color:#aaa;font-size:0.85rem;display:block;margin-bottom:8px;">🎵 Style de musique</label>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${musiques.map(m => `
                            <label style="cursor:pointer;">
                                <input type="checkbox" name="musique" value="${m}" ${prefMusique.includes(m) ? 'checked' : ''} style="display:none;">
                                <span class="tag-check" style="padding:5px 12px;border:1px solid ${prefMusique.includes(m) ? '#a855f7' : '#333'};border-radius:20px;font-size:0.8rem;color:${prefMusique.includes(m) ? '#a855f7' : '#888'};background:${prefMusique.includes(m) ? 'rgba(168,85,247,0.1)' : 'transparent'};transition:all 0.2s;"
                                onclick="this.closest('label').querySelector('input').checked=!this.closest('label').querySelector('input').checked; this.style.borderColor=this.closest('label').querySelector('input').checked?'#a855f7':'#333'; this.style.color=this.closest('label').querySelector('input').checked?'#a855f7':'#888'; this.style.background=this.closest('label').querySelector('input').checked?'rgba(168,85,247,0.1)':'transparent';"
                                >${m}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <button type="submit" class="btn-primary" style="align-self:flex-start;display:flex;align-items:center;gap:8px;">
                    <span class="material-symbols-outlined">save</span> Enregistrer le profil
                </button>
            </form>
        </div>`;
    }
}
