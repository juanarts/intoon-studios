import Badges from '../models/Badges.js';
import VueProfil from './VueProfil.js';
import Security from '../utils/Security.js';
import I18n from '../utils/I18n.js';

export default class VueDashboard {
    /**
     * Rendu principal du Dashboard (Espace VIP) de l'utilisateur.
     * @param {Array} projetsFavoris Les favoris
     * @param {Object} utilisateur Les infos de session (pseudo, statut)
     */
    static rendre(projetsFavoris, utilisateur, mesProjets = [], projetEnCours = null, chapitreEnCours = null) {
        
        let historiqueHtml = `<div style="margin-bottom:50px; background:rgba(255,255,255,0.05); padding:20px; border-radius:8px;"><p style="color:#aaa;">${I18n.t('dash_no_history')}</p></div>`;

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


        return `
            <div class="dashboard-page" style="padding: 40px 4%; animation: fadeIn 0.5s ease-out; min-height: 80vh;">
                
                <!-- En-tête personnalisé -->
                <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 1px solid #222; padding-bottom: 30px; margin-bottom: 40px; gap:30px; flex-wrap:wrap;">
                    <!-- Avatar + Pseudo + Badges -->
                    <div style="display:flex; gap:25px; align-items:center;">
                        <div style="position:relative;">
                            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${utilisateur.pseudo}&backgroundColor=0a0a0d" 
                                style="width:90px; height:90px; border-radius:50%; border:3px solid ${utilisateur.role === 'admin' ? '#FFD700' : 'var(--primary)'}; box-shadow:0 0 20px ${utilisateur.role === 'admin' ? 'rgba(255,215,0,0.4)' : 'rgba(229,9,20,0.3)'}; background:#111;">
                            ${utilisateur.role === 'admin' ? '<div style="position:absolute; bottom:-5px; right:-5px; background:#FFD700; color:#000; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold;">👑</div>' : ''}
                        </div>
                        <div>
                            <h1 style="font-size: 2rem; margin-bottom: 4px;">${Security.escapeHTML(utilisateur.pseudo)} ${utilisateur.role === 'admin' ? '<span style="font-size:1.2rem;">👑</span>' : ''}</h1>
                            <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:12px;">@${Security.escapeHTML(utilisateur.pseudo).toLowerCase()} &bull; ${utilisateur.role.toUpperCase()}</p>
                            <!-- BADGES GAMIFICATION -->
                            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
                                ${Badges.getBadgesUtilisateur(utilisateur).map(b => Badges.renderBadge(b, 52)).join('')}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px; flex-wrap:wrap;">
                        <a href="/inbox" data-link class="btn-secondary" style="display:flex; align-items:center; gap:6px; font-size:0.9rem;"><span class="material-symbols-outlined" style="font-size:1.1rem;">mail</span> ${I18n.t('dash_btn_messages')}</a>
                        ${utilisateur.role === 'admin' ? `<a href="/admin" data-link class="btn-primary" style="display:flex; align-items:center; gap:6px; font-size:0.9rem;"><span class="material-symbols-outlined" style="font-size:1.1rem;">admin_panel_settings</span> ${I18n.t('dash_btn_admin')}</a>` : ''}
                    </div>
                </div>
                
                <!-- Corps... -->
                <div class="dashboard-content split-layout" style="display:flex; gap: 50px; flex-wrap:wrap;">
                    <div class="dashboard-main split-content" style="flex: 2; min-width:300px;">
                        ${mesProjets.length > 0 ? `
                        <div class="dashboard-section" style="margin-bottom: 50px; background:rgba(255,255,255,0.02); padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                            <h2 style="font-size: 1.5rem; margin-bottom: 25px; color: var(--primary); display:flex; align-items:center; gap:10px;"><span class="material-symbols-outlined">movie_creation</span> ${I18n.t('dash_txt_production')}</h2>
                            <div class="catalogue-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); padding:0;">
                                ${mesProjets.map(p => `
                                    <div class="projet-card" style="box-shadow:0 4px 15px rgba(0,0,0,0.5);">
                                        <img class="projet-cover" src="${p.couverture}" alt="${p.titre}">
                                        <div class="projet-info" style="transform:none; opacity:1; background:linear-gradient(to top, rgba(0,0,0,0.95), transparent); padding:10px;">
                                            <h3 style="font-size:1rem; margin-bottom:5px;">${Security.escapeHTML(p.titre)}</h3>
                                            <p style="color:${p.statut === 'publie' ? '#22c55e' : p.statut === 'banni' ? '#ef4444' : '#f59e0b'}; font-weight:bold; font-size:0.75rem; text-transform:uppercase; margin-bottom:10px;">${p.statut}</p>
                                            <button class="btn-primary btn-edit-crew" data-id="${p.id}" style="padding:6px 0; font-size:0.8rem; width:100%; border-radius:4px; margin-bottom:5px;">${I18n.t('dash_btn_manage_crew')}</button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${historiqueHtml}
                    </div>

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
                                ${utilisateur.role === 'admin' ? `<li><a href="/admin" data-link style="color:var(--primary);text-decoration:none;display:flex;justify-content:space-between;align-items:center;"><span>⚡ ${I18n.t('dash_link_admin')}</span><span style="color:#666;">›</span></a></li>` : ''}
                                <li><hr style="border-color:#333;"></li>
                                <li><a href="#" class="btn-logout" style="color:#666;text-decoration:none;font-size:0.9rem;">${I18n.t('dash_btn_logout')}</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
