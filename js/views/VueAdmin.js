export default class VueAdmin {
    
    static templateLigneProjet(p) {
        const estActif = p.statut === 'publie';
        const isBanni = p.statut === 'banni';
        const isBrouillon = p.statut === 'brouillon';
        
        let headerColor = estActif ? "var(--primary)" : isBanni ? "#555" : "orange";
        let statusBadge = '';
        if (isBanni) statusBadge = `<span style="background:red; padding:3px 6px; border-radius:var(--radius-badge); font-size:0.7rem; font-weight:bold;">BANNI</span>`;
        if (isBrouillon) statusBadge = `<span style="background:orange; padding:3px 6px; border-radius:var(--radius-badge); font-size:0.7rem; font-weight:bold; color:black;">BROUILLON / LAB</span>`;
        if (estActif) statusBadge = `<span style="background:rgba(229,9,20,0.2); border:1px solid var(--primary); padding:3px 6px; border-radius:var(--radius-badge); font-size:0.7rem; font-weight:bold;">PUBLIÉ</span>`;

        return `
            <div class="admin-projet-item" style="display:flex; gap:20px; align-items:center; background:rgba(255,255,255,0.02); padding:20px; border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-card); margin-bottom:15px; border-left:4px solid ${headerColor}; opacity:${isBanni ? '0.6' : '1'};">
                <img src="${p.couverture}" style="width:70px; height:100px; object-fit:cover; border-radius:6px;">
                <div style="flex:1;">
                    <h3 style="font-size:1.3rem; margin-bottom:5px; font-family:'Outfit', sans-serif;">
                        ${p.titre} 
                        ${statusBadge}
                        <span style="font-size:0.8rem; border:1px solid #666; padding:2px 5px; border-radius:var(--radius-badge);">${p.pegi || 'TP'}</span>
                    </h3>
                    <p style="color:#aaa; font-size:0.9rem; line-height:1.4;">${(p.description || 'Description non renseignée...').substring(0, 100)}...</p>
                    <div style="margin-top:10px; font-size:0.85rem; color:var(--text-muted);">
                        <strong>${p.chapitres ? p.chapitres.length : 0}</strong> chapitres | <strong>${p.likes || 0}</strong> likes
                    </div>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="/projet/${p.slug}" data-link class="btn-secondary" style="background:rgba(255,255,255,0.05); color:white; border:none;" title="Voir le rendu final public"><span class="material-symbols-outlined">visibility</span></a>
                    <button class="btn-secondary btn-edit-serie" data-id="${p.id}" style="background:transparent; border:1px solid rgba(255,255,255,0.1);"><span class="material-symbols-outlined">edit</span> Éditer</button>
                    ${(!isBanni && !isBrouillon) ? `<button class="btn-primary btn-add-chap" data-id="${p.id}"><span class="material-symbols-outlined">add</span> Chapitre</button>` : ''}
                    ${(isBanni || isBrouillon) 
                        ? `<button class="btn-secondary btn-restore-serie" data-id="${p.id}" style="background:rgba(0,255,0,0.1); color:#4ade80; border:1px solid #4ade80;"><span class="material-symbols-outlined">restore</span> Restaurer / Publier</button>`
                        : `<button class="btn-secondary btn-ban-serie" data-id="${p.id}" style="background:rgba(255,0,0,0.1); color:red; border:1px solid red;"><span class="material-symbols-outlined">block</span> Bannir</button>`
                    }
                </div>
            </div>
        `;
    }

    static rendreDashboard(projets) {
        let btnNewSerie = `<button id="btn-create-serie" class="btn-primary" style="margin-bottom:20px;"><span class="material-symbols-outlined">add_circle</span> Ajouter une Série</button>`;
        
        const projetsActifs = projets.filter(p => p.statut === 'publie');
        const projetsModeration = projets.filter(p => p.statut === 'banni' || p.statut === 'brouillon');

        return `
            <div style="max-width:1000px; margin:0 auto; padding:40px 4%;">
                <h1 style="margin-bottom:30px; border-bottom:1px solid #333; padding-bottom:10px; font-size:2.5rem;"><span class="material-symbols-outlined" style="font-size:2.5rem; color:var(--primary);">admin_panel_settings</span> Master Control Panel</h1>
                
                ${btnNewSerie}

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:40px;">
                    <div style="background:rgba(255,255,255,0.02); pading:20px; border-radius:var(--radius-card); border:1px solid rgba(255,255,255,0.05); padding:20px; text-align:center;">
                        <span class="material-symbols-outlined" style="font-size:2.5rem; color:#aaa;">library_books</span>
                        <h3 style="font-size:2rem; margin:10px 0; color:white; font-family:'Outfit', sans-serif;">${projets.length}</h3>
                        <p style="color:#aaa;">Séries Existantes</p>
                    </div>
                    <div style="background:rgba(229,9,20,0.05); pading:20px; border-radius:var(--radius-card); border:1px dashed var(--primary); padding:20px; text-align:center;">
                        <span class="material-symbols-outlined" style="font-size:2.5rem; color:var(--primary);">trending_up</span>
                        <h3 style="font-size:2rem; margin:10px 0; color:white; font-family:'Outfit', sans-serif;">+124%</h3>
                        <p style="color:#aaa;">Trafic Simulé Aujourd'hui</p>
                    </div>
                </div>

                <h2 style="margin-top:40px; margin-bottom:20px; font-family:'Outfit', sans-serif;"><span class="material-symbols-outlined" style="color:var(--primary);">check_circle</span> Séries Actives (Publiées)</h2>
                <div id="admin-liste-projets">
                    ${projetsActifs.map(p => this.templateLigneProjet(p)).join('')}
                    ${projetsActifs.length === 0 ? '<p style="color:#777;">Aucune série publiée.</p>' : ''}
                </div>

                <h2 style="margin-top:50px; margin-bottom:20px; font-family:'Outfit', sans-serif; color:orange;"><span class="material-symbols-outlined">warning</span> Zone de Modération (Brouillons & Bannis)</h2>
                <div id="admin-liste-moderation">
                    ${projetsModeration.map(p => this.templateLigneProjet(p)).join('')}
                    ${projetsModeration.length === 0 ? '<p style="color:#777;">Zone sécurisée. Aucune série en quarantaine ou en création.</p>' : ''}
                </div>
            </div>
            
            <!-- DOM Root pour les popups d'édition/création du Panel -->
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
                        ${isNew ? 'Créer une Série' : 'Éditer la Série'}
                    </h2>
                    
                    <form id="form-edit-serie" style="display:flex; flex-direction:column; gap:20px;">
                        <input type="hidden" id="edit-id" value="${projet.id}">
                        
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <label style="color:#aaa; font-size:0.9rem;">Titre de l'œuvre</label>
                            <input type="text" id="edit-titre" value="${projet.titre}" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1.1rem; font-family:'Outfit', sans-serif; font-weight:600;" required>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <label style="color:#aaa; font-size:0.9rem;">Synopsis Complet</label>
                            <textarea id="edit-desc" rows="4" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1rem; font-family:'Inter', sans-serif;" required>${projet.description}</textarea>
                        </div>

                        <div style="display:flex; gap:15px;">
                            <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
                                <label style="color:#aaa; font-size:0.9rem;">Statut de Publication</label>
                                <select id="edit-statut" style="padding:15px; border-radius:4px; border:1px solid #444; background:#222; color:white; font-size:1rem;">
                                    <option value="publie" ${!isNew && projet.statut === 'publie' ? 'selected' : ''}>Publié (Catalogue)</option>
                                    <option value="brouillon" ${!isNew && projet.statut === 'brouillon' ? 'selected' : ''}>Brouillon (Intoon Lab)</option>
                                    <option value="banni" ${!isNew && projet.statut === 'banni' ? 'selected' : ''}>Banni (Quarantaine)</option>
                                </select>
                            </div>
                            
                            <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
                                <label style="color:#aaa; font-size:0.9rem;">Classification Âge (PEGI)</label>
                                <select id="edit-pegi" style="padding:15px; border-radius:4px; border:1px solid #444; background:#222; color:white; font-size:1rem;">
                                    <option value="TP" ${!isNew && projet.pegi === 'TP' ? 'selected' : ''}>TP - Tout Public</option>
                                    <option value="12+" ${!isNew && projet.pegi === '12+' ? 'selected' : ''}>12+ (Violences légères)</option>
                                    <option value="16+" ${!isNew && projet.pegi === '16+' ? 'selected' : ''}>16+ (Mature, Sang)</option>
                                    <option value="18+" ${!isNew && projet.pegi === '18+' ? 'selected' : ''}>18+ (Explicit)</option>
                                </select>
                            </div>
                        </div>

                        <label style="color:#aaa; font-size:0.9rem; margin-bottom:-10px; margin-top:10px;">Langues Supportées (Disponibilité)</label>
                        <div style="display:flex; gap:15px; background:#1a1a20; padding:15px; border-radius:4px; border:1px solid #444;">
                            <label style="color:white; display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="checkbox" name="edit-lang" value="fr" ${(!isNew && projet.langues && projet.langues.includes('fr')) || isNew ? 'checked' : ''}> 🇫🇷 FR
                            </label>
                            <label style="color:white; display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="checkbox" name="edit-lang" value="en" ${!isNew && projet.langues && projet.langues.includes('en') ? 'checked' : ''}> 🇬🇧 EN
                            </label>
                            <label style="color:white; display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="checkbox" name="edit-lang" value="es" ${!isNew && projet.langues && projet.langues.includes('es') ? 'checked' : ''}> 🇪🇸 ES
                            </label>
                            <label style="color:white; display:flex; align-items:center; gap:5px; cursor:pointer;">
                                <input type="checkbox" name="edit-lang" value="jp" ${!isNew && projet.langues && projet.langues.includes('jp') ? 'checked' : ''}> 🇯🇵 JP
                            </label>
                        </div>

                        <label style="color:#aaa; font-size:0.9rem; margin-bottom:-10px; margin-top:10px;">Uploader l'Affiche Officielle</label>
                        <input type="file" id="edit-couverture" accept="image/png, image/jpeg, image/jpg, image/webp" style="padding:15px; border-radius:4px; border:1px dashed #444; background:#1a1a20; color:white; font-size:1rem; cursor:pointer;" ${isNew ? 'required' : ''}>
                        ${!isNew ? `<p style="font-size:0.85rem; color:#888; font-style:italic; margin-top:-5px;">Affiche actuelle : <code>${projet.couverture}</code></p>` : ''}
                        
                        <div style="display:flex; gap:15px; margin-top:20px;">
                            <button type="button" class="btn-secondary btn-close-modal" style="flex:1;"><span class="material-symbols-outlined">close</span> Annuler</button>
                            <button type="submit" class="btn-primary" style="flex:2;">${isNew ? '<span class="material-symbols-outlined">add</span> Créer la Série' : '<span class="material-symbols-outlined">save</span> Enregistrer'}</button>
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
                    <h2 style="color:white; margin-bottom:25px; font-size:2rem; font-family:'Outfit', sans-serif;"><span class="material-symbols-outlined" style="font-size:2.2rem; vertical-align:middle; color:var(--primary);">add_photo_alternate</span> Publier un Chapitre</h2>
                    <form id="form-add-chap" style="display:flex; flex-direction:column; gap:15px;">
                        <input type="hidden" id="chap-projet-id" value="${projetId}">
                        <input type="text" id="chap-titre" placeholder="Titre du Chapitre (ex: L'éveil de l'ombre)" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1.1rem; font-family:'Outfit', sans-serif;" required>
                        <input type="number" id="chap-ordre" placeholder="Numéro (ex: 1, 2, 3...)" style="padding:15px; border-radius:4px; border:1px solid #444; background:#1a1a20; color:white; font-size:1.1rem;" required>
                        
                        <label style="color:#aaa; font-size:0.9rem; margin-top:10px; margin-bottom:-10px;">Uploader les Planches <span style="color:var(--primary);">*minimum 5*</span> — Format Horizontal (Paysage, max 1400px)</label>
                        <input type="file" id="chap-pages" accept="image/png, image/jpeg, image/webp" multiple style="padding:15px; border-radius:4px; border:1px dashed #444; background:#1a1a20; color:white; font-size:1rem; cursor:pointer;" required>
                        <p id="chap-pages-hint" style="font-size:0.8rem; color:#888; font-style:italic; margin-top:-5px;">⚠️ Format recommandé : <strong>1400×900px</strong> (paysage cinéma). Maintenez CTRL pour sélectionner plusieurs images.</p>
                        
                        <!-- Toggle de Commentaires (Niveau Chapitre) -->
                        <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:4px; display:flex; align-items:center; gap:10px; margin-top:10px;">
                            <input type="checkbox" id="chap-comments-enabled" checked style="width:18px; height:18px; accent-color:var(--primary); cursor:pointer;">
                            <label for="chap-comments-enabled" style="color:white; cursor:pointer; font-weight:bold;">Autoriser les Commentaires Immersifs</label>
                        </div>

                        <div style="display:flex; gap:15px; margin-top:20px;">
                            <button type="button" class="btn-secondary btn-close-modal" style="flex:1;">Annuler</button>
                            <button type="submit" class="btn-primary" style="flex:2;"><span class="material-symbols-outlined">publish</span> Mettre en ligne</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
}
