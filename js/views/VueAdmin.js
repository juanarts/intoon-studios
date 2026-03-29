import Security from '../utils/Security.js';
import I18n from '../utils/I18n.js';

export default class VueAdmin {
    
    static templateLigneProjet(p) {
        const estActif = p.statut === 'publie';
        const isBanni = p.statut === 'banni';
        const isBrouillon = p.statut === 'brouillon';
        
        let headerColor = estActif ? "var(--primary)" : isBanni ? "#555" : "orange";
        let statusBadge = '';
        if (isBanni) statusBadge = `<span style="background:red; padding:3px 6px; border-radius:var(--radius-badge); font-size:0.7rem; font-weight:bold;">${I18n.t('admin_status_banned')}</span>`;
        if (isBrouillon) statusBadge = `<span style="background:orange; padding:3px 6px; border-radius:var(--radius-badge); font-size:0.7rem; font-weight:bold; color:black;">${I18n.t('admin_status_draft')}</span>`;
        if (estActif) statusBadge = `<span style="background:rgba(229,9,20,0.2); border:1px solid var(--primary); padding:3px 6px; border-radius:var(--radius-badge); font-size:0.7rem; font-weight:bold;">${I18n.t('admin_status_published')}</span>`;

        return `
            <div class="admin-projet-item" style="display:flex; gap:20px; align-items:center; background:rgba(255,255,255,0.02); padding:20px; border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-card); margin-bottom:15px; border-left:4px solid ${headerColor}; opacity:${isBanni ? '0.6' : '1'};">
                <img src="${p.couverture}" style="width:70px; height:100px; object-fit:cover; border-radius:6px;">
                <div style="flex:1;">
                    <h3 style="font-size:1.3rem; margin-bottom:5px; font-family:'Outfit', sans-serif;">
                        ${Security.escapeHTML(p.titre)} 
                        ${statusBadge}
                        <span style="font-size:0.8rem; border:1px solid #666; padding:2px 5px; border-radius:var(--radius-badge);">${p.pegi || 'TP'}</span>
                    </h3>
                    <p style="color:#aaa; font-size:0.9rem; line-height:1.4;">${Security.escapeHTML(p.description || I18n.t('admin_no_description')).substring(0, 100)}...</p>
                    <div style="margin-top:10px; font-size:0.85rem; color:var(--text-muted);">
                        <strong>${p.chapitres ? p.chapitres.length : 0}</strong> ${I18n.t('admin_chapters_count')} | <strong>${p.likes || 0}</strong> likes
                    </div>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="/projet/${p.slug}" data-link class="btn-secondary" style="background:rgba(255,255,255,0.05); color:white; border:none;" title="Voir le rendu final public"><span class="material-symbols-outlined">visibility</span></a>
                    
                    <!-- [NEW] Toggle Boutique Admin -->
                    <button class="btn-secondary btn-toggle-shop" data-id="${p.id}" data-enabled="${p.shopEnabled}" style="background:${p.shopEnabled ? 'rgba(234,179,8,0.15)' : 'transparent'}; color:${p.shopEnabled ? '#eab308' : '#777'}; border:1px solid ${p.shopEnabled ? '#eab308' : '#333'};" title="${p.shopEnabled ? I18n.t('admin_shop_disable') : I18n.t('admin_shop_enable')}">
                        <span class="material-symbols-outlined">${p.shopEnabled ? 'storefront' : 'store'}</span>
                        ${p.shopEnabled ? I18n.t('admin_shop_on') : I18n.t('admin_shop_off')}
                    </button>

                    <button class="btn-secondary btn-edit-serie" data-id="${p.id}" style="background:transparent; border:1px solid rgba(255,255,255,0.1);"><span class="material-symbols-outlined">edit</span> ${I18n.t('admin_btn_edit')}</button>
                    ${(!isBanni && !isBrouillon) ? `<button class="btn-primary btn-add-chap" data-id="${p.id}" title="${I18n.t('admin_btn_add_ch')}"><span class="material-symbols-outlined">post_add</span></button>` : ''}
                    <button class="btn-secondary btn-manage-chaps" data-id="${p.id}" style="background:rgba(255,255,255,0.05); color:#aaa; border:1px solid #333;" title="${I18n.t('admin_btn_manage_ch')}"><span class="material-symbols-outlined">library_books</span> ${I18n.t('admin_btn_chaps')}</button>
                    
                    ${(isBanni || isBrouillon) 
                        ? `<button class="btn-secondary btn-restore-serie" data-id="${p.id}" style="background:rgba(0,255,0,0.1); color:#4ade80; border:1px solid #4ade80;"><span class="material-symbols-outlined">restore</span></button>`
                        : `<button class="btn-secondary btn-ban-serie" data-id="${p.id}" style="background:rgba(255,0,0,0.1); color:red; border:1px solid red;"><span class="material-symbols-outlined">block</span></button>`
                    }
                </div>
            </div>
        `;
    }

    static rendreDashboard(projets, profils = []) {
        const projetsActifs = projets.filter(p => p.statut === 'publie');
        const projetsModeration = projets.filter(p => p.statut === 'banni' || p.statut === 'brouillon');

        return `
            <div style="max-width:1100px; margin:0 auto; padding:40px 4%;">
                <h1 style="margin-bottom:30px; border-bottom:1px solid #333; padding-bottom:10px; font-size:2.5rem; display:flex; align-items:center; gap:15px;">
                    <span class="material-symbols-outlined" style="font-size:2.5rem; color:var(--primary);">admin_panel_settings</span> 
                    Master Control Panel
                </h1>

                <!-- Onglets Admin -->
                <div style="display:flex; gap:10px; margin-bottom:30px; border-bottom:1 solid #222;">
                    <button class="admin-tab-btn active" data-tab="series" style="padding:12px 25px; background:none; border:none; color:white; font-family:'Outfit',sans-serif; font-weight:bold; cursor:pointer; border-bottom:3px solid var(--primary); font-size:1.1rem;">${I18n.t('admin_tab_series')}</button>
                    <button class="admin-tab-btn" data-tab="commu" style="padding:12px 25px; background:none; border:none; color:#777; font-family:'Outfit',sans-serif; font-weight:bold; cursor:pointer; font-size:1.1rem;">${I18n.t('admin_tab_commu')} (${profils.length})</button>
                </div>

                <!-- SECTION SÉRIES -->
                <div id="tab-series" class="admin-tab-content">
                    <button id="btn-create-serie" class="btn-primary" style="margin-bottom:20px;"><span class="material-symbols-outlined">add_circle</span> ${I18n.t('admin_btn_add_serie')}</button>
                    
                    <h2 style="margin-top:20px; margin-bottom:20px; font-family:'Outfit', sans-serif;"><span class="material-symbols-outlined" style="color:var(--primary);">check_circle</span> ${I18n.t('admin_txt_active_series')}</h2>
                    <div id="admin-liste-projets">
                        ${projetsActifs.map(p => this.templateLigneProjet(p)).join('')}
                        ${projetsActifs.length === 0 ? `<p style="color:#777;">${I18n.t('admin_no_published')}</p>` : ''}
                    </div>

                    <h2 style="margin-top:50px; margin-bottom:20px; font-family:'Outfit', sans-serif; color:orange;"><span class="material-symbols-outlined">warning</span> ${I18n.t('admin_txt_moderation')}</h2>
                    <div id="admin-liste-moderation">
                        ${projetsModeration.map(p => this.templateLigneProjet(p)).join('')}
                        ${projetsModeration.length === 0 ? `<p style="color:#777;">${I18n.t('admin_safe_zone')}</p>` : ''}
                    </div>
                </div>

                <!-- SECTION COMMUNAUTÉ -->
                <div id="tab-commu" class="admin-tab-content" style="display:none;">
                    <h2 style="margin-bottom:20px; font-family:'Outfit', sans-serif;"><span class="material-symbols-outlined" style="color:#60a5fa;">groups</span> ${I18n.t('admin_commu_title')}</h2>
                    <div style="background:rgba(255,255,255,0.02); border:1px solid #222; border-radius:12px; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse; text-align:left;">
                            <tr style="background:rgba(0,0,0,0.4); border-bottom:1px solid #333;">
                                <th style="padding:15px; color:#aaa; font-size:0.8rem; text-transform:uppercase;">${I18n.t('admin_table_member')}</th>
                                <th style="padding:15px; color:#aaa; font-size:0.8rem; text-transform:uppercase;">${I18n.t('admin_table_role')}</th>
                                <th style="padding:15px; color:#aaa; font-size:0.8rem; text-transform:uppercase;">${I18n.t('admin_table_actions')}</th>
                            </tr>
                            ${profils.map(user => `
                                <tr style="border-bottom:1px solid #222;">
                                    <td style="padding:15px; display:flex; align-items:center; gap:12px;">
                                        <a href="/profil/${user.pseudo}" data-link style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                                            <img src="${user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.pseudo}`}" style="width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,0.1);">
                                            <span style="font-weight:700; color:white;">${Security.escapeHTML(user.pseudo)}</span>
                                        </a>
                                    </td>
                                    <td style="padding:15px;">
                                        <span style="background:${user.role==='admin' ? 'red' : user.role==='moderateur' ? '#6366f1' : user.role==='createur' ? '#a855f7' : '#444'}; padding:4px 10px; border-radius:var(--radius-badge); font-size:0.75rem; font-weight:900; color:white; text-transform:uppercase;">${user.role}</span>
                                    </td>
                                    <td style="padding:15px;">
                                        <div style="display:flex; gap:8px;">
                                            <button class="btn-role-update" data-id="${user.id}" data-role="moderateur" style="background:none; color:#6366f1; border:1px solid #6366f1; padding:5px 8px; border-radius:4px; font-size:0.7rem; cursor:pointer;">${I18n.t('admin_btn_modo')}</button>
                                            <button class="btn-role-update" data-id="${user.id}" data-role="createur" style="background:none; color:#a855f7; border:1px solid #a855f7; padding:5px 8px; border-radius:4px; font-size:0.7rem; cursor:pointer;">${I18n.t('admin_btn_creator')}</button>
                                            <button class="btn-badge-beta" data-id="${user.id}" style="background:none; color:#60a5fa; border:1px solid #60a5fa; padding:5px 8px; border-radius:4px; font-size:0.7rem; cursor:pointer;">${I18n.t('admin_btn_badge_beta')}</button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            </div>
            
            <div id="admin-modal-root"></div>
        `;
    }

    static rendreModaleEdition(projet = null) {
        const isNew = !projet;
        if (!projet) projet = { id:'', titre:'', description:'', couverture:'', chapitres:[], statut:'publie', pegi:'TP', langues:['fr'] };
        return `
            <div id="modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:100; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s; backdrop-filter:blur(10px);">
                <div style="background:#111; padding:40px; border-radius:var(--radius-card); border:1px solid #333; max-width:600px; width:100%; box-shadow:0 0 30px rgba(0,0,0,0.9); max-height:90vh; overflow-y:auto;">
                    <h2 style="color:white; margin-bottom:25px; font-size:2rem; font-family:'Outfit', sans-serif;">
                        <span class="material-symbols-outlined" style="font-size:2rem; vertical-align:middle; color:var(--primary);">${isNew ? 'add_circle' : 'edit_document'}</span> 
                        ${isNew ? I18n.t('admin_modal_create_serie') : I18n.t('admin_modal_edit_serie')}
                    </h2>
                    
                    <form id="form-edit-serie" style="display:flex; flex-direction:column; gap:20px;">
                        <input type="hidden" id="edit-id" value="${projet.id}">
                        
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_title')}</label>
                            <input type="text" id="edit-titre" value="${Security.escapeHTML(projet.titre)}" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1.1rem; font-family:'Outfit', sans-serif; font-weight:600;" required>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_synopsis')}</label>
                            <textarea id="edit-desc" rows="4" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1rem; font-family:'Inter', sans-serif;" required>${Security.escapeHTML(projet.description || '')}</textarea>
                        </div>

                        <!-- SECTION CREW / FICHE DE PROD -->
                        <div style="background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid #333; display:flex; flex-direction:column; gap:20px;">
                            <h3 style="color:var(--primary); font-size:1rem; margin-bottom:0; display:flex; align-items:center; gap:8px;">
                                <span class="material-symbols-outlined">movie_filter</span> ${I18n.t('admin_label_prod_sheet')}
                            </h3>
                            
                            <div style="display:flex; gap:15px; flex-wrap:wrap;">
                                <div style="flex:1; min-width:200px; display:flex; flex-direction:column; gap:5px;">
                                    <label style="color:#888; font-size:0.8rem;">${I18n.t('admin_label_writer')}</label>
                                    <input type="text" id="edit-scenariste" value="${Security.escapeHTML(projet.scenariste || '')}" placeholder="Ex: Jean Du-Script" style="padding:12px; border-radius:6px; border:1px solid #444; background:#000; color:white; width:100%;">
                                </div>
                                <div style="flex:1; min-width:200px; display:flex; flex-direction:column; gap:5px;">
                                    <label style="color:#888; font-size:0.8rem;">${I18n.t('admin_label_artist')}</label>
                                    <input type="text" id="edit-dessinateur" value="${Security.escapeHTML(projet.dessinateur || '')}" placeholder="Ex: Kim Art" style="padding:12px; border-radius:6px; border:1px solid #444; background:#000; color:white; width:100%;">
                                </div>
                            </div>

                            <div style="display:flex; flex-direction:column; gap:5px;">
                                <label style="color:#888; font-size:0.8rem;">${I18n.t('admin_label_trailer_url')}</label>
                                <input type="url" id="edit-trailer" value="${Security.escapeHTML(projet.video_promo_url || projet.videoPromoUrl || '')}" placeholder="https://..." style="padding:12px; border-radius:6px; border:1px solid #444; background:#000; color:#60a5fa; width:100%;">
                            </div>
                        </div>

                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div style="flex:1; min-width:140px; display:flex; flex-direction:column; gap:5px;">
                                <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_statut_pub')}</label>
                                <select id="edit-statut" style="padding:15px; border-radius:6px; border:1px solid #444; background:#1a1a20; color:white; font-size:1rem; cursor:pointer;">
                                    <option value="publie" ${!isNew && projet.statut === 'publie' ? 'selected' : ''}>${I18n.t('admin_opt_pub')}</option>
                                    <option value="brouillon" ${!isNew && projet.statut === 'brouillon' ? 'selected' : ''}>${I18n.t('admin_opt_draft')}</option>
                                    <option value="banni" ${!isNew && projet.statut === 'banni' ? 'selected' : ''}>${I18n.t('admin_opt_ban')}</option>
                                </select>
                            </div>
                            
                            <div style="flex:1; min-width:140px; display:flex; flex-direction:column; gap:5px;">
                                <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_pegi')}</label>
                                <select id="edit-pegi" style="padding:15px; border-radius:6px; border:1px solid #444; background:#1a1a20; color:white; font-size:1rem; cursor:pointer;">
                                    <option value="TP" ${!isNew && projet.pegi === 'TP' ? 'selected' : ''}>${I18n.t('admin_opt_pegi_tp')}</option>
                                    <option value="12+" ${!isNew && projet.pegi === '12+' ? 'selected' : ''}>${I18n.t('admin_opt_pegi_12')}</option>
                                    <option value="16+" ${!isNew && projet.pegi === '16+' ? 'selected' : ''}>${I18n.t('admin_opt_pegi_16')}</option>
                                    <option value="18+" ${!isNew && projet.pegi === '18+' ? 'selected' : ''}>${I18n.t('admin_opt_pegi_18')}</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                            <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_langs')}</label>
                            <div style="display:flex; gap:10px; flex-wrap:wrap; background:#1a1a20; padding:15px; border-radius:8px; border:1px solid #444;">
                                ${['fr', 'en', 'es', 'jp'].map(lang => `
                                    <label style="color:white; display:flex; align-items:center; gap:8px; cursor:pointer; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; border:1px solid #333; font-size:0.9rem;">
                                        <input type="checkbox" name="edit-lang" value="${lang}" ${(!isNew && projet.langues && projet.langues.includes(lang)) || (isNew && lang === 'fr') ? 'checked' : ''} style="accent-color:var(--primary); width:18px; height:18px;"> 
                                        <span>${lang === 'fr' ? '🇫🇷 FR' : lang === 'en' ? '🇬🇧 EN' : lang === 'es' ? '🇪🇸 ES' : '🇯🇵 JP'}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:5px;">
                            <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_upload_cover')}</label>
                            <div style="position:relative;">
                                <input type="file" id="edit-couverture" accept="image/png, image/jpeg, image/jpg, image/webp" style="padding:15px; border-radius:8px; border:2px dashed #444; background:#1a1a20; color:white; font-size:0.95rem; cursor:pointer; width:100%; transition:border-color 0.2s;" ${isNew ? 'required' : ''}>
                            </div>
                            ${!isNew ? `<p style="font-size:0.8rem; color:#888; font-style:italic; background:rgba(0,0,0,0.3); padding:8px; border-radius:4px; border:1px solid #222;">${I18n.t('admin_txt_current_cover')} : <span style="font-family:monospace; color:#60a5fa; word-break:break-all;">${projet.couverture}</span></p>` : ''}
                        </div>
                        
                        <div style="display:flex; gap:15px; margin-top:10px;">
                            <button type="button" class="btn-secondary btn-close-modal" style="flex:1;"><span class="material-symbols-outlined">close</span> ${I18n.t('admin_btn_cancel')}</button>
                            <button type="submit" class="btn-primary" style="flex:2;">${isNew ? `<span class="material-symbols-outlined">add</span> ${I18n.t('admin_btn_create_serie_confirm')}` : `<span class="material-symbols-outlined">save</span> ${I18n.t('admin_btn_save')}`}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    static rendreModaleChapitre(projetId) {
        return `
            <div id="modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:100; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.2s; backdrop-filter:blur(10px);">
                <div style="background:#111; padding:40px; border-radius:var(--radius-card); border:1px solid var(--primary); max-width:600px; width:100%; box-shadow:0 0 30px rgba(229,9,20,0.2);">
                    <h2 style="color:white; margin-bottom:25px; font-size:2rem; font-family:'Outfit', sans-serif;"><span class="material-symbols-outlined" style="font-size:2.2rem; vertical-align:middle; color:var(--primary);">add_photo_alternate</span> ${I18n.t('admin_modal_publish_ch')}</h2>
                    <form id="form-add-chap" style="display:flex; flex-direction:column; gap:15px;">
                        <input type="hidden" id="chap-projet-id" value="${projetId}">
                        <input type="text" id="chap-titre" placeholder="${I18n.t('admin_placeholder_ch_title')}" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1.1rem; font-family:'Outfit', sans-serif;" required>
                        <input type="number" id="chap-ordre" placeholder="${I18n.t('admin_placeholder_ch_order')}" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1.1rem;" required>
                        
                        <label style="color:#aaa; font-size:0.9rem; margin-top:10px; margin-bottom:-10px;">${I18n.t('admin_label_upload_pages')} <span style="color:var(--primary); font-weight:bold;">*${I18n.t('admin_txt_min_5')}*</span> — ${I18n.t('admin_txt_format_landscape')}</label>
                        <input type="file" id="chap-pages" accept="image/png, image/jpeg, image/webp" multiple style="padding:15px; border-radius:4px; border:1px dashed #444; background:#1a1a20; color:white; font-size:1rem; cursor:pointer;" required>
                        <p id="chap-pages-hint" style="font-size:0.8rem; color:#888; font-style:italic; margin-top:-5px;">⚠️ ${I18n.t('admin_txt_format_hint')}</p>
                        
                        <!-- Toggle de Commentaires (Niveau Chapitre) -->
                        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:4px; display:flex; align-items:center; gap:10px; margin-top:10px;">
                            <input type="checkbox" id="chap-comments-enabled" checked style="width:18px; height:18px; accent-color:var(--primary); cursor:pointer;">
                            <label for="chap-comments-enabled" style="color:white; cursor:pointer; font-weight:bold;">${I18n.t('admin_label_allow_comments')}</label>
                        </div>

                        <div style="display:flex; gap:15px; margin-top:20px;">
                            <button type="button" class="btn-secondary btn-close-modal" style="flex:1;">${I18n.t('admin_btn_cancel')}</button>
                            <button type="submit" class="btn-primary" style="flex:2;"><span class="material-symbols-outlined">publish</span> ${I18n.t('admin_btn_publish')}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Gestionnaire de chapitres pour une série
     */
    static rendreModaleGestionChapitres(projet) {
        return `
            <div id="modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.9); z-index:110; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(10px);">
                <div style="background:#111; padding:40px; border-radius:var(--radius-card); border:1px solid #333; max-width:800px; width:95%; max-height:85vh; overflow-y:auto; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                        <h2 style="color:white; font-size:1.8rem;">📖 ${I18n.t('admin_manage_ch_title')} : <span style="color:var(--primary);">${Security.escapeHTML(projet.titre)}</span></h2>
                        <button class="btn-secondary btn-close-modal" style="background:none; border:none; color:#666;"><span class="material-symbols-outlined" style="font-size:2rem;">cancel</span></button>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${projet.chapitres && projet.chapitres.length > 0 ? projet.chapitres.sort((a,b) => a.ordre - b.ordre).map(ch => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:15px 20px; border-radius:8px; border:1px solid #222;">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <span style="color:var(--primary); font-weight:800; font-size:1.2rem;">#${ch.ordre}</span>
                                    <div>
                                        <h4 style="color:white; margin:0;">${Security.escapeHTML(ch.titre)}</h4>
                                        <p style="color:#555; font-size:0.8rem; margin:0;">${ch.pages ? ch.pages.length : 0} planches</p>
                                    </div>
                                </div>
                                <div style="display:flex; gap:10px;">
                                    <button class="btn-secondary btn-edit-chap-content" data-projet-id="${projet.id}" data-chap-id="${ch.id}" style="padding:8px 15px; font-size:0.85rem;"><span class="material-symbols-outlined" style="font-size:1.1rem; vertical-align:middle;">edit</span> ${I18n.t('admin_btn_edit_ch')}</button>
                                    <button class="btn-secondary btn-del-chap" data-projet-id="${projet.id}" data-chap-id="${ch.id}" style="color:#ef4444; border-color:rgba(239,68,68,0.2); padding:8px 10px; border-radius:4px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">delete</span></button>
                                </div>
                            </div>
                        `).join('') : `<p style="color:#666; text-align:center; padding:40px;">${I18n.t('admin_no_chapters')}</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Éditeur de contenu de chapitre (Thumpnails, suppression, ajout)
     */
    static rendreModaleEditionChapitre(projet, chapitre) {
        return `
            <div id="modal-overlay" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); z-index:120; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(15px);">
                <div style="background:#0a0a0d; padding:40px; border-radius:12px; border:1px solid var(--primary); max-width:900px; width:95%; max-height:90vh; overflow-y:auto;">
                    <h2 style="color:white; margin-bottom:10px;">🛠️ ${I18n.t('admin_edit_ch_title')} ${chapitre.ordre}</h2>
                    <p style="color:#888; margin-bottom:30px;">${I18n.t('admin_edit_ch_subtitle')}</p>

                    <form id="form-update-chap" style="display:flex; flex-direction:column; gap:25px;">
                        <input type="hidden" id="up-chap-id" value="${chapitre.id}">
                        <input type="hidden" id="up-chap-projet-id" value="${projet.id}">
                        
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <label style="color:#aaa; font-size:0.9rem;">${I18n.t('admin_label_ch_title')}</label>
                            <input type="text" id="up-chap-titre" value="${Security.escapeHTML(chapitre.titre)}" style="padding:15px; border-radius:6px; border:1px solid #444; background:#111; color:white; font-size:1.2rem; font-weight:bold;">
                        </div>

                        <div style="background:#111; padding:25px; border-radius:10px; border:1px solid #222; position:relative;" id="drop-zone-container">
                            <h3 style="color:white; font-size:1rem; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
                                <span>📚 ${I18n.t('admin_label_ch_pages')} (<span id="up-chap-count">${chapitre.pages ? chapitre.pages.length : 0}</span>)</span>
                                <span style="font-size:0.85rem; color:var(--primary); font-weight:bold;">✨ ${I18n.t('admin_txt_drag_hint')}</span>
                            </h3>
                            
                            <div id="edit-thumb-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:15px; min-height:150px; padding:10px; border-radius:8px; transition:background 0.3s;">
                                <!-- Les miniatures seront générées / rafraîchies par le contrôleur -->
                                <p style="color:#444; text-align:center; grid-column: 1 / -1; padding:40px;">${I18n.t('admin_txt_loading_studio')}</p>
                            </div>

                            <div id="drop-indicator" style="display:none; position:absolute; inset:0; background:rgba(229,9,20,0.2); border:3px dashed var(--primary); border-radius:10px; z-index:5; pointer-events:none; flex-direction:column; justify-content:center; align-items:center; color:white;">
                                <span class="material-symbols-outlined" style="font-size:4rem;">cloud_upload</span>
                                <b style="font-size:1.2rem;">${I18n.t('admin_txt_drop_to_import')}</b>
                            </div>
                            
                            <input type="file" id="up-chap-add-pages-hidden" multiple accept="image/*" style="display:none;">
                            <button type="button" id="btn-trigger-add-pages" style="margin-top:20px; width:100%; padding:12px; background:rgba(255,255,255,0.05); color:white; border:1px dashed #444; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;">
                                <span class="material-symbols-outlined">add_photo_alternate</span> ${I18n.t('admin_btn_upload_pc')}
                            </button>
                        </div>

                        <div style="display:flex; gap:15px; margin-top:10px;">
                            <button type="button" class="btn-secondary btn-close-modal" style="flex:1;">${I18n.t('admin_btn_cancel')}</button>
                            <button type="submit" class="btn-primary" style="flex:2;"><span class="material-symbols-outlined">save</span> ${I18n.t('admin_btn_save')}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}
