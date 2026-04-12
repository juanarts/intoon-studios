import Badges from '../models/Badges.js';
import VueProfil from './VueProfil.js';
import Security from '../utils/Security.js';
import I18n from '../utils/I18n.js';

export default class VueDashboard {

    /**
     * Rendu principal du Dashboard créateur individualisé.
     */
    static rendre(
        projetsFavoris,
        utilisateur,
        mesProjets = [],
        projetEnCours = null,
        chapitreEnCours = null,
        stats = {},
        dernieresVentes = [],
        ventesParSemaine = []
    ) {
        const {
            totalLikes = 0,
            totalCommentaires = 0,
            totalChapitres = 0,
            totalProjets = 0,
            totalVentes = 0,
            totalRevenus = 0
        } = stats;

        // ── Section "Continuer la lecture" ─────────────────────────────────
        let historiqueHtml = '';
        if (projetEnCours && chapitreEnCours) {
            historiqueHtml = `
                <div class="dashboard-section" style="margin-bottom: 50px;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 20px; color: #e5e5e5;">${I18n.t('continue_reading')}</h2>
                    <div class="projet-card" style="max-width:300px; box-shadow: 0 5px 25px rgba(229,9,20,0.25); border: 1px solid rgba(229,9,20,0.4);">
                        <a href="/lire/${projetEnCours.slug}/${chapitreEnCours.slug}" data-link class="projet-link">
                            <img class="projet-cover" src="${projetEnCours.couverture}" alt="${projetEnCours.titre}">
                            <div class="projet-info" style="opacity:1; background:linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0.6) 100%);">
                                <h3 style="color:var(--primary); font-size: 1.1rem; font-weight:800;">▶ ${I18n.t('dash_btn_continue')}</h3>
                                <p style="font-size:0.85rem; color:#d0d0d0; margin-top:5px;">${Security.escapeHTML(projetEnCours.titre)} - Ch.${chapitreEnCours.ordre}</p>
                            </div>
                        </a>
                    </div>
                </div>
            `;
        }

        // ── Graphique barres CSS ────────────────────────────────────────────
        const maxMontant = Math.max(...ventesParSemaine.map(j => j.montant), 1);
        const graphHtml = ventesParSemaine.length > 0 ? `
            <div style="display:flex; align-items:flex-end; gap:8px; height:80px; margin-top:15px;">
                ${ventesParSemaine.map(j => {
                    const pct = Math.max((j.montant / maxMontant) * 100, 2);
                    const isToday = j.date === new Date().toISOString().split('T')[0];
                    return `
                        <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;" title="${j.montant.toFixed(2)}€">
                            <div style="width:100%; height:${pct}%; background: ${isToday ? 'var(--primary)' : 'rgba(229,9,20,0.35)'}; border-radius:4px 4px 0 0; min-height:4px; transition:height 0.5s ease; position:relative;">
                                ${j.montant > 0 ? `<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:0.65rem; color:#aaa; white-space:nowrap;">${j.montant.toFixed(0)}€</span>` : ''}
                            </div>
                            <span style="font-size:0.65rem; color:#666;">${j.label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '<p style="color:#555; font-size:0.85rem; text-align:center; padding:20px 0;">Aucune donnée cette semaine</p>';

        // ── Dernières ventes ────────────────────────────────────────────────
        const ventesHtml = dernieresVentes.length > 0 ? `
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                ${dernieresVentes.map(v => {
                    const date = new Date(v.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                    const typeLabel = { physical: '📦 Comic', original: '🎨 Planche', vip: '⭐ VIP', chapter: '📖 Chapitre' }[v.type] || v.type;
                    const titreProjet = v.projets?.titre || 'Projet';
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                            <div>
                                <p style="font-size:0.85rem; font-weight:600; color:white; margin-bottom:2px;">${typeLabel} — ${Security.escapeHTML(titreProjet)}</p>
                                <p style="font-size:0.75rem; color:#555;">${date}</p>
                            </div>
                            <span style="font-size:1rem; font-weight:700; color:#4ade80;">+${parseFloat(v.montant).toFixed(2)}€</span>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : '<p style="color:#555; font-size:0.85rem; text-align:center; padding:20px 0;">Aucune vente pour l\'instant</p>';

        // ── Section Projets en Production ──────────────────────────────────
        const projetsHtml = mesProjets.length > 0 ? `
            <div class="dashboard-section" style="margin-bottom: 50px; background:rgba(255,255,255,0.02); padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                <h2 style="font-size: 1.5rem; margin-bottom: 25px; color: var(--primary); display:flex; align-items:center; gap:10px;">
                    <span class="material-symbols-outlined">movie_creation</span> ${I18n.t('dash_txt_production')}
                </h2>
                <div class="catalogue-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); padding:0;">
                    ${mesProjets.map(p => `
                        <div class="projet-card" style="box-shadow:0 4px 15px rgba(0,0,0,0.5);">
                            <img class="projet-cover" src="${p.couverture}" alt="${p.titre}">
                            <div class="projet-info" style="transform:none; opacity:1; background:linear-gradient(to top, rgba(0,0,0,0.95), transparent); padding:10px;">
                                <h3 style="font-size:1rem; margin-bottom:5px;">${Security.escapeHTML(p.titre)}</h3>
                                <p style="color:${p.statut === 'publie' ? '#22c55e' : p.statut === 'banni' ? '#ef4444' : '#f59e0b'}; font-weight:bold; font-size:0.75rem; text-transform:uppercase; margin-bottom:10px;">${p.statut}</p>
                                <button class="btn-primary btn-edit-crew" data-id="${p.id}" style="padding:6px 0; font-size:0.8rem; width:100%; border-radius:4px; margin-bottom:5px;">
                                    ${I18n.t('dash_btn_manage_crew')}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="dashboard-page" style="padding: 40px 4%; animation: fadeIn 0.5s ease-out; min-height: 80vh;">
                
                <!-- ─── EN-TÊTE ─────────────────────────────────────────────────────── -->
                <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px solid #222; padding-bottom: 30px; margin-bottom: 40px; gap:30px; flex-wrap:wrap;">
                    <div style="display:flex; gap:25px; align-items:center;">
                        <div style="position:relative;">
                            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${utilisateur.pseudo}&backgroundColor=0a0a0d" 
                                style="width:90px; height:90px; border-radius:50%; border:3px solid ${utilisateur.role === 'admin' ? '#FFD700' : 'var(--primary)'}; box-shadow:0 0 20px ${utilisateur.role === 'admin' ? 'rgba(255,215,0,0.4)' : 'rgba(229,9,20,0.3)'}; background:#111;">
                            ${utilisateur.role === 'admin' ? '<div style="position:absolute; bottom:-5px; right:-5px; background:#FFD700; color:#000; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">👑</div>' : ''}
                        </div>
                        <div>
                            <h1 style="font-size: 2rem; margin-bottom: 4px;">${Security.escapeHTML(utilisateur.pseudo)} ${utilisateur.role === 'admin' ? '<span style="font-size:1.2rem;">👑</span>' : ''}</h1>
                            <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:12px;">@${Security.escapeHTML(utilisateur.pseudo).toLowerCase()} &bull; ${utilisateur.role.toUpperCase()}</p>
                            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
                                ${Badges.getBadgesUtilisateur(utilisateur).map(b => Badges.renderBadge(b, 52)).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <a href="/inbox" data-link class="btn-secondary" style="display:flex; align-items:center; gap:6px; font-size:0.9rem;">
                            <span class="material-symbols-outlined" style="font-size:1.1rem;">mail</span> ${I18n.t('dash_btn_messages')}
                        </a>
                        ${utilisateur.role === 'admin' ? `<a href="/admin" data-link class="btn-primary" style="display:flex; align-items:center; gap:6px; font-size:0.9rem;"><span class="material-symbols-outlined" style="font-size:1.1rem;">admin_panel_settings</span> ${I18n.t('dash_btn_admin')}</a>` : ''}
                    </div>
                </div>

                <!-- ─── KPI CARDS ────────────────────────────────────────────────────── -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:16px; margin-bottom:40px;">
                    ${VueDashboard._kpiCard('trending_up', 'Revenus', `${totalRevenus.toFixed(2)}€`, '#4ade80', totalRevenus > 0)}
                    ${VueDashboard._kpiCard('shopping_bag', 'Ventes', totalVentes, '#60a5fa', totalVentes > 0)}
                    ${VueDashboard._kpiCard('favorite', 'Likes reçus', totalLikes, '#f43f5e', totalLikes > 0)}
                    ${VueDashboard._kpiCard('chat', 'Commentaires', totalCommentaires, '#a78bfa', totalCommentaires > 0)}
                    ${VueDashboard._kpiCard('menu_book', 'Chapitres', totalChapitres, '#fb923c', totalChapitres > 0)}
                    ${VueDashboard._kpiCard('movie_creation', 'Projets', totalProjets, 'var(--primary)', totalProjets > 0)}
                </div>

                <!-- ─── CORPS ────────────────────────────────────────────────────────── -->
                <div class="dashboard-content split-layout" style="display:flex; gap: 50px; flex-wrap:wrap;">
                    <div class="dashboard-main split-content" style="flex: 2; min-width:300px;">

                        <!-- Projets en production -->
                        ${projetsHtml}
                        
                        <!-- Historique lecture -->
                        ${historiqueHtml}

                        <!-- ── SECTION REVENUS ──────────────────────────────────────── -->
                        <div style="background:rgba(255,255,255,0.02); padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.06); margin-bottom:40px;">
                            <h2 style="font-size:1.5rem; margin-bottom:5px; color:#4ade80; display:flex; align-items:center; gap:10px;">
                                <span class="material-symbols-outlined">payments</span> Mes Revenus
                            </h2>
                            <p style="color:#555; font-size:0.85rem; margin-bottom:20px;">Ventes des 7 derniers jours</p>
                            ${graphHtml}

                            <div style="margin-top:30px; border-top:1px solid #1a1a1a; padding-top:20px;">
                                <h3 style="font-size:1rem; margin-bottom:5px; color:#e5e5e5;">Dernières ventes</h3>
                                ${ventesHtml}
                            </div>
                        </div>

                        <!-- ── STRIPE PLACEHOLDER ───────────────────────────────────── -->
                        <div style="background: linear-gradient(135deg, rgba(99,91,255,0.08) 0%, rgba(0,0,0,0) 60%); border:1px dashed rgba(99,91,255,0.3); padding:25px; border-radius:12px; margin-bottom:40px;">
                            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
                                <div style="background:rgba(99,91,255,0.15); border-radius:50%; width:50px; height:50px; display:flex; justify-content:center; align-items:center; flex-shrink:0;">
                                    <span class="material-symbols-outlined" style="color:#a78bfa; font-size:1.5rem;">credit_card</span>
                                </div>
                                <div style="flex:1;">
                                    <h3 style="font-size:1rem; font-weight:700; color:#a78bfa; margin-bottom:4px;">💳 Paiements Stripe — À connecter</h3>
                                    <p style="font-size:0.85rem; color:#555; line-height:1.5;">
                                        Vos revenus seront automatiquement versés sur votre compte bancaire une fois Stripe connecté. 
                                        Les données de ventes ci-dessus seront alors réelles et en temps réel.
                                    </p>
                                </div>
                                <button disabled style="padding:10px 20px; background:rgba(99,91,255,0.2); color:#a78bfa; border:1px solid rgba(99,91,255,0.3); border-radius:8px; font-size:0.85rem; font-weight:600; cursor:not-allowed; white-space:nowrap; opacity:0.7;">
                                    Bientôt disponible
                                </button>
                            </div>
                        </div>

                    </div>

                    <!-- ─── SIDEBAR ──────────────────────────────────────────────────── -->
                    <div class="dashboard-sidebar split-sidebar" style="flex:1; min-width:250px; display:flex; flex-direction:column; gap:20px;">

                        <!-- Édition du profil -->
                        ${VueProfil.rendreEditProfil({ ...utilisateur, id: utilisateur.id })}

                        <!-- Liens rapides -->
                        <div style="background:rgba(15,16,20,0.8);border:1px solid #333;padding:25px;border-radius:8px;">
                            <h3 style="margin-bottom:20px;border-bottom:1px solid #333;padding-bottom:12px;font-size:1rem;">${I18n.t('dash_quick_links')}</h3>
                            <ul style="list-style:none;display:flex;flex-direction:column;gap:14px;">
                                <li><a href="/profil/${utilisateur.pseudo}" data-link style="color:white;text-decoration:none;display:flex;justify-content:space-between;align-items:center;"><span>👤 ${I18n.t('dash_link_profile')}</span><span style="color:#666;">›</span></a></li>
                                <li><a href="/inbox" data-link style="color:white;text-decoration:none;display:flex;justify-content:space-between;align-items:center;"><span>✉️ ${I18n.t('dash_link_inbox')}</span><span style="color:#666;">›</span></a></li>
                                <li><a href="/favoris" data-link style="color:white;text-decoration:none;display:flex;justify-content:space-between;align-items:center;"><span>⭐ ${I18n.t('dash_link_list')}</span><span style="color:#666;">›</span></a></li>
                                <li><a href="/soumission" data-link style="color:white;text-decoration:none;display:flex;justify-content:space-between;align-items:center;"><span>📤 Soumettre un projet</span><span style="color:#666;">›</span></a></li>
                                ${utilisateur.role === 'admin' ? `<li><a href="/admin" data-link style="color:var(--primary);text-decoration:none;display:flex;justify-content:space-between;align-items:center;"><span>⚡ ${I18n.t('dash_link_admin')}</span><span style="color:#666;">›</span></a></li>` : ''}
                                <li><hr style="border-color:#333;"></li>
                                <li><a href="#" class="btn-logout" style="color:#666;text-decoration:none;font-size:0.9rem;">${I18n.t('dash_btn_logout')}</a></li>
                            </ul>
                        </div>

                        <!-- Récap financier sidebar -->
                        <div style="background:rgba(74,222,128,0.05); border:1px solid rgba(74,222,128,0.15); padding:25px; border-radius:8px;">
                            <h3 style="margin-bottom:15px; font-size:0.95rem; color:#4ade80; display:flex; align-items:center; gap:8px;">
                                <span class="material-symbols-outlined" style="font-size:1.1rem;">account_balance_wallet</span> Mon Portefeuille
                            </h3>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#888; font-size:0.85rem;">Revenus totaux</span>
                                    <span style="font-size:1.3rem; font-weight:800; color:#4ade80;">${totalRevenus.toFixed(2)}€</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#888; font-size:0.85rem;">Total ventes</span>
                                    <span style="font-weight:700; color:white;">${totalVentes}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#888; font-size:0.85rem;">Commission InToon (20%)</span>
                                    <span style="color:#f59e0b; font-size:0.85rem;">-${(totalRevenus * 0.2).toFixed(2)}€</span>
                                </div>
                                <hr style="border-color:rgba(74,222,128,0.1); margin:5px 0;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="color:#888; font-size:0.85rem; font-weight:600;">Net à recevoir</span>
                                    <span style="font-size:1.1rem; font-weight:800; color:#4ade80;">${(totalRevenus * 0.8).toFixed(2)}€</span>
                                </div>
                            </div>
                            <p style="margin-top:15px; font-size:0.72rem; color:#444; line-height:1.4;">
                                * Le virement Stripe sera configuré prochainement. La commission de 20% couvre l'hébergement et la plateforme.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Génère une carte KPI animée
     */
    static _kpiCard(icon, label, value, color, hasData = false) {
        return `
            <div style="
                background: rgba(255,255,255,0.02);
                border: 1px solid ${hasData ? color + '33' : 'rgba(255,255,255,0.05)'};
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                transition: transform 0.2s, border-color 0.2s;
                cursor: default;
                animation: fadeIn 0.6s ease-out;
            "
            onmouseenter="this.style.transform='translateY(-3px)'; this.style.borderColor='${color}55';"
            onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='${hasData ? color + '33' : 'rgba(255,255,255,0.05)'}';"
            >
                <span class="material-symbols-outlined" style="font-size:1.6rem; color:${color}; margin-bottom:8px; display:block;">${icon}</span>
                <div style="font-size:1.6rem; font-weight:800; color:${hasData ? color : '#444'}; font-family:'Outfit', sans-serif; line-height:1;">${value}</div>
                <div style="font-size:0.72rem; color:#555; margin-top:5px; text-transform:uppercase; letter-spacing:0.5px;">${label}</div>
            </div>
        `;
    }
}
