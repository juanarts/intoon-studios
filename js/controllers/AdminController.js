import VueAdmin from '../views/VueAdmin.js';
import Projet from '../models/Projet.js';
import Auth from '../models/Auth.js';
import SupabaseService from '../services/SupabaseService.js';

export default class AdminController {
    static async afficher() {
        const app = document.getElementById('app');

        if (!Auth.estConnecte() || Auth.getUtilisateur().role !== 'admin') {
            window.appRouter.navigate('/');
            return;
        }

        app.innerHTML = '<div class="loader" style="color:white;">Synchronisation Master Control Panel...</div>';
        
        try {
            const client = SupabaseService.getClient();
            const [projets, rProfils] = await Promise.all([
                Projet.chargerTous(),
                client.from('profils').select('*').order('created_at', { ascending: false })
            ]);
            
            const profils = rProfils.data || [];
            app.innerHTML = VueAdmin.rendreDashboard(projets, profils);

            // GESTION DES CLICS STANDARDS
            app.onclick = async (e) => {
                const target = e.target;
                const modalRoot = document.getElementById('admin-modal-root');

                // 1. SWITCH D'ONGLETS
                if (target.classList.contains('admin-tab-btn')) {
                    const tabName = target.getAttribute('data-tab');
                    document.querySelectorAll('.admin-tab-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.borderBottom = 'none';
                        b.style.color = '#777';
                    });
                    target.classList.add('active');
                    target.style.borderBottom = '3px solid var(--primary)';
                    target.style.color = 'white';

                    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
                    document.getElementById(`tab-${tabName}`).style.display = 'block';
                    return;
                }

                if(!modalRoot) return;

                // 2. ACTIONS MODÉRATION (PROFIL)
                if (target.classList.contains('btn-role-update')) {
                    const userId = target.getAttribute('data-id');
                    const newRole = target.getAttribute('data-role');
                    if (confirm(`MODÉRATION : Changer le rôle de ce membre en [${newRole.toUpperCase()}] ?`)) {
                        await client.from('profils').update({ role: newRole }).eq('id', userId);
                        AdminController.afficher();
                    }
                } else if (target.classList.contains('btn-badge-beta')) {
                    const userId = target.getAttribute('data-id');
                    if (confirm("MODÉRATION : Attribuer le badge Privilège [BETA TESTEUR] à ce membre ?")) {
                        await client.from('profils').update({ is_beta_tester: true }).eq('id', userId);
                        alert("Badge Bêta attribué avec succès ! ✨");
                        AdminController.afficher();
                    }
                } else if (target.closest('.btn-close-modal')) {
                    modalRoot.innerHTML = '';
                } else if (target.id === 'btn-create-serie') {
                    modalRoot.innerHTML = VueAdmin.rendreModaleEdition();
                } else if (target.closest('.btn-toggle-shop')) {
                    // [NEW] Toggle Boutique Marketplace
                    const btn = target.closest('.btn-toggle-shop');
                    const id = btn.getAttribute('data-id');
                    const isEnabled = btn.getAttribute('data-enabled') === 'true';
                    
                    if (confirm(`ADMIN : ${isEnabled ? 'Désactiver' : 'AUTORISER'} la boutique pour ce projet ?`)) {
                        await SupabaseService.getClient()
                            .from('projets')
                            .update({ shop_enabled: !isEnabled })
                            .eq('id', id);
                        AdminController.afficher();
                    }
                } else if (target.closest('.btn-edit-serie')) {
                    const id = target.closest('.btn-edit-serie').getAttribute('data-id');
                    const projetActuel = projets.find(p => p.id === id);
                    if (projetActuel) modalRoot.innerHTML = VueAdmin.rendreModaleEdition(projetActuel);
                } else if (target.closest('.btn-add-chap')) {
                    const id = target.closest('.btn-add-chap').getAttribute('data-id');
                    modalRoot.innerHTML = VueAdmin.rendreModaleChapitre(id);
                } else if (target.closest('.btn-del-serie')) {
                    if (confirm("MODÉRATION : Bannir cette œuvre ? Elle sera placée dans la zone de quarantaine et le créateur sera notifié.")) {
                        const id = target.closest('.btn-del-serie').getAttribute('data-id');
                        await SupabaseService.getClient().from('projets').update({ statut: 'banni' }).eq('id', id);
                        alert("Un email d'avertissement de suspension automatique de compte a été simulé à l'auteur de l'œuvre.");
                        AdminController.afficher(); 
                    }
                } else if (target.closest('.btn-restore-serie')) {
                    const id = target.closest('.btn-restore-serie').getAttribute('data-id');
                    await SupabaseService.getClient().from('projets').update({ statut: 'publie' }).eq('id', id);
                    AdminController.afficher(); 
                } else if (target.closest('.btn-manage-chaps')) {
                    const id = target.closest('.btn-manage-chaps').getAttribute('data-id');
                    const projetActuel = projets.find(p => p.id === id);
                    if (projetActuel) modalRoot.innerHTML = VueAdmin.rendreModaleGestionChapitres(projetActuel);
                } else if (target.closest('.btn-edit-chap-content')) {
                    const pid = target.closest('.btn-edit-chap-content').getAttribute('data-projet-id');
                    const cid = target.closest('.btn-edit-chap-content').getAttribute('data-chap-id');
                    const proj = projets.find(p => p.id === pid);
                    const chap = proj.chapitres.find(c => c.id === cid);
                    if (proj && chap) {
                        modalRoot.innerHTML = VueAdmin.rendreModaleEditionChapitre(proj, chap);
                        AdminController.initialiserStudioChapitre(proj, chap);
                    }
                } else if (target.closest('.btn-del-chap')) {
                    if (confirm("Attention : Supprimer ce chapitre est définitif. Confirmer ?")) {
                        const cid = target.closest('.btn-del-chap').getAttribute('data-chap-id');
                        await client.from('chapitres').delete().eq('id', cid);
                        AdminController.afficher();
                    }
                } else if (target.closest('.btn-remove-thumb')) {
                    const thumb = target.closest('.edit-chap-thumb');
                    if (confirm("Enlever cette planche du chapitre ?")) thumb.remove();
                }
            };

            // ÉDITEUR DRAG & DROP — s'active après sélection de fichiers
            document.addEventListener('change', (e) => {
                if (e.target.id !== 'chap-pages') return;
                const files = e.target.files;
                const hint = document.getElementById('chap-pages-hint');
                const existingEditor = document.getElementById('drag-sort-editor');
                if (existingEditor) existingEditor.remove();
                if (!files || files.length === 0) return;

                // Feedback minimum 5
                if (hint) {
                    hint.textContent = files.length < 5
                        ? `⚠️ ${files.length} planche(s) sélectionnée(s) — minimum 5 requises !`
                        : `✅ ${files.length} planches prêtes — glissez pour réorganiser l'ordre.`;
                    hint.style.color = files.length < 5 ? '#ef4444' : '#4ade80';
                }

                // Injection du panneau de tri
                const editor = document.createElement('div');
                editor.id = 'drag-sort-editor';
                editor.style.cssText = 'margin-top:12px; background:#0a0a0d; border:1px solid #333; border-radius:8px; padding:15px;';
                editor.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span style="color:#aaa; font-size:0.85rem; font-weight:bold;">
                            <span class="material-symbols-outlined" style="font-size:1rem; vertical-align:middle;">drag_indicator</span>
                            Glissez les planches pour réorganiser l'ordre :
                        </span>
                        <button type="button" id="btn-preview-reader" style="background:rgba(229,9,20,0.15); border:1px solid var(--primary); color:white; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                            <span class="material-symbols-outlined" style="font-size:1rem;">preview</span> Aperçu du Lecteur
                        </button>
                    </div>
                    <div id="thumb-grid" style="display:flex; flex-wrap:wrap; gap:10px; min-height:80px;"></div>
                `;
                e.target.closest('form').insertBefore(editor, e.target.nextSibling.nextSibling);

                const grid = document.getElementById('thumb-grid');
                let dragSrc = null;

                const renderThumbs = (fileList) => {
                    grid.innerHTML = '';
                    fileList.forEach((file, idx) => {
                        const url = URL.createObjectURL(file);
                        const thumb = document.createElement('div');
                        thumb.className = 'sortable-thumb';
                        thumb.dataset.origIndex = idx;
                        thumb.draggable = true;
                        thumb.style.cssText = `
                            width: 100px; height: 70px; position: relative; cursor: grab;
                            border: 2px solid #333; border-radius: 6px; overflow: hidden;
                            transition: transform 0.15s, border-color 0.15s; flex-shrink:0;
                        `;
                        thumb.innerHTML = `
                            <img src="${url}" style="width:100%; height:100%; object-fit:cover; pointer-events:none;">
                            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); text-align:center; font-size:0.7rem; color:white; padding:2px 0; font-family:'Outfit',sans-serif;">
                                ${idx + 1}
                            </div>
                            <div style="position:absolute; top:3px; right:3px; background:rgba(0,0,0,0.6); border-radius:3px; padding:1px 4px; font-size:0.6rem; color:#aaa;">${file.name.slice(0, 8)}...</div>
                        `;

                        // Drag events
                        thumb.addEventListener('dragstart', (ev) => {
                            dragSrc = thumb;
                            thumb.style.opacity = '0.4';
                            thumb.style.borderColor = 'var(--primary)';
                            ev.dataTransfer.effectAllowed = 'move';
                        });
                        thumb.addEventListener('dragend', () => {
                            thumb.style.opacity = '1';
                            thumb.style.borderColor = '#333';
                            // Renumber
                            grid.querySelectorAll('.sortable-thumb div:first-of-type').forEach((label, i) => {
                                label.textContent = i + 1;
                            });
                        });
                        thumb.addEventListener('dragover', (ev) => {
                            ev.preventDefault();
                            ev.dataTransfer.dropEffect = 'move';
                            thumb.style.borderColor = '#4ade80';
                        });
                        thumb.addEventListener('dragleave', () => { thumb.style.borderColor = '#333'; });
                        thumb.addEventListener('drop', (ev) => {
                            ev.preventDefault();
                            thumb.style.borderColor = '#333';
                            if (dragSrc && dragSrc !== thumb) {
                                const allThumbs = [...grid.querySelectorAll('.sortable-thumb')];
                                const srcIdx = allThumbs.indexOf(dragSrc);
                                const dstIdx = allThumbs.indexOf(thumb);
                                if (srcIdx < dstIdx) grid.insertBefore(dragSrc, thumb.nextSibling);
                                else grid.insertBefore(dragSrc, thumb);
                            }
                        });

                        grid.appendChild(thumb);
                    });
                };

                renderThumbs([...files]);

                // BOUTON DE PRÉVISUALISATION DU LECTEUR HORIZONTAL
                document.getElementById('btn-preview-reader').onclick = () => {
                    const sortedItems = [...grid.querySelectorAll('.sortable-thumb')];
                    const orderedUrls = sortedItems.map(item => {
                        const img = item.querySelector('img');
                        return img.src; // ObjectURL local
                    });
                    const overlay = document.createElement('div');
                    overlay.id = 'reader-preview-overlay';
                    overlay.style.cssText = `
                        position: fixed; inset: 0; background: #000; z-index: 9999;
                        overflow-y: auto; display: flex; flex-direction: column;
                    `;
                    overlay.innerHTML = `
                        <div style="position:sticky; top:0; background:rgba(0,0,0,0.9); padding:12px 20px; display:flex; justify-content:space-between; align-items:center; z-index:10; border-bottom:1px solid #333;">
                            <span style="color:white; font-family:'Outfit',sans-serif; font-weight:bold;">👁️ Aperçu du Rendu Lecteur (${orderedUrls.length} planches)</span>
                            <button onclick="document.getElementById('reader-preview-overlay').remove()" style="background:var(--primary); border:none; color:white; padding:8px 18px; border-radius:6px; cursor:pointer; font-weight:bold;">✕ Fermer</button>
                        </div>
                        ${orderedUrls.map((url, i) => `
                            <div style="width:100%; background:#000; display:flex; justify-content:center; align-items:center; padding:20px 0; border-bottom:1px solid #111; position:relative;">
                                <img src="${url}" style="max-width:1400px; width:100%; height:auto; object-fit:contain; display:block;">
                                <div style="position:absolute; bottom:28px; right:24px; color:rgba(255,255,255,0.2); font-size:0.75rem; font-family:'Outfit',sans-serif; letter-spacing:2px;">${i+1} / ${orderedUrls.length}</div>
                            </div>
                        `).join('')}
                    `;
                    document.body.appendChild(overlay);
                };
            });


            // GESTION STATIQUE DES FICHIERS UPLOADÉS
            app.onsubmit = async (e) => {
                if (e.target.tagName !== 'FORM') return;
                
                const formId = e.target.id;
                e.preventDefault();

                if (formId === 'form-edit-serie') {
                    const editId = document.getElementById('edit-id').value;
                    const titre = document.getElementById('edit-titre').value;
                    const desc = document.getElementById('edit-desc').value;
                    const scenariste = document.getElementById('edit-scenariste').value;
                    const dessinateur = document.getElementById('edit-dessinateur').value;
                    const trailer = document.getElementById('edit-trailer').value;
                    const couvInput = document.getElementById('edit-couverture');
                    const inputStatut = document.getElementById('edit-statut').value;
                    const inputPegi = document.getElementById('edit-pegi').value;
                    
                    const langsElements = document.querySelectorAll('input[name="edit-lang"]:checked');
                    const langs = Array.from(langsElements).map(el => el.value);
                    
                    const btn = document.querySelector('#form-edit-serie button[type="submit"]');
                    const originalBtnText = btn.innerHTML;
                    btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">sync</span> Sauvegarde Cloud...';
                    btn.disabled = true;

                    try {
                        const client = SupabaseService.getClient();
                        let finalCouv = "";
                        
                        if (editId) {
                            const pIndex = projets.findIndex(p => p.id === editId);
                            finalCouv = pIndex >= 0 ? projets[pIndex].couverture : "";
                        }

                        if (couvInput && couvInput.files.length > 0) {
                            const file = couvInput.files[0];
                            const ext = file.name.split('.').pop();
                            const filename = `cover_${Date.now()}.${ext}`;
                            const uploadRes = await client.storage.from('covers').upload(filename, file);
                            if (uploadRes.error) throw uploadRes.error;
                            
                            const { data: { publicUrl } } = client.storage.from('covers').getPublicUrl(filename);
                            finalCouv = publicUrl;
                        }

                        const payload = {
                            titre: titre,
                            description: desc,
                            scenariste: scenariste,
                            dessinateur: dessinateur,
                            video_promo_url: trailer,
                            couverture_url: finalCouv,
                            statut: inputStatut,
                            pegi_rating: inputPegi,
                            langues: langs
                        };

                        let dbRes;
                        if (editId) {
                            dbRes = await client.from('projets').update(payload).eq('id', editId);
                        } else {
                            const currentUser = Auth.getUtilisateur();
                            if(!currentUser) throw new Error("Accès refusé");
                            payload.author_id = currentUser.id;
                            dbRes = await client.from('projets').insert([payload]);
                        }
                        
                        if (dbRes && dbRes.error) {
                            throw dbRes.error;
                        }
                        
                        document.getElementById('admin-modal-root').innerHTML = '';
                        AdminController.afficher(); 
                    } catch(e) {
                        console.error('Erreur form-edit-serie:', e);
                        alert("Erreur BDD: " + (e.message || "Impossible de sauvegarder le projet."));
                        btn.disabled = false;
                        btn.innerHTML = originalBtnText;
                    }
                }

                if (formId === 'form-add-chap') {
                    const projetId = document.getElementById('chap-projet-id').value;
                    const titre = document.getElementById('chap-titre').value;
                    const fileInput = document.getElementById('chap-pages');
                    
                    const btn = document.querySelector('#form-add-chap button');
                    btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">cloud_upload</span> Upload des planches...';
                    btn.disabled = true;

                    if (!fileInput || fileInput.files.length < 5) {
                            alert('⚠️ Minimum 5 planches requises pour publier un chapitre !');
                            btn.disabled = false;
                            btn.innerHTML = '<span class="material-symbols-outlined">publish</span> Mettre en ligne';
                            return;
                        }

                        // Récupère les fichiers dans l'ordre trié par le créateur (via data-order)
                        const sortedItems = [...document.querySelectorAll('.sortable-thumb')];
                        let orderedFiles;
                        if (sortedItems.length > 0) {
                            orderedFiles = sortedItems.map(item => {
                                const idx = parseInt(item.dataset.origIndex);
                                return fileInput.files[idx];
                            });
                        } else {
                            orderedFiles = [...fileInput.files];
                        }

                        try {
                        const client = SupabaseService.getClient();
                        const pagesArray = [];
                        
                        for (let i = 0; i < orderedFiles.length; i++) {
                            const file = orderedFiles[i];
                            btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">cloud_upload</span> Upload planche ${i+1}/${orderedFiles.length}...`;
                            const ext = file.name.split('.').pop();
                            const filename = `${projetId}_${Date.now()}_p${i}.${ext}`;
                            
                            const { error: upErr } = await client.storage.from('pages').upload(filename, file);
                            if (upErr) throw upErr;
                            
                            const { data: { publicUrl } } = client.storage.from('pages').getPublicUrl(filename);
                            pagesArray.push(publicUrl);
                        }


                        const pIndex = projets.findIndex(p => p.id === projetId);
                        const order = projets[pIndex]?.chapitres ? projets[pIndex].chapitres.length + 1 : 1;
                        
                        await client.from('chapitres').insert([{
                            projet_id: projetId,
                            titre: titre,
                            ordre: order,
                            pages_urls: pagesArray
                        }]);

                        document.getElementById('admin-modal-root').innerHTML = '';
                        AdminController.afficher();
                    } catch(e) {
                        alert("Erreur lors de l'Upload : " + e.message);
                        btn.disabled = false;
                        btn.innerHTML = 'Publier Chapitre';
                    }
                }

                if (formId === 'form-update-chap') {
                    const chapId = document.getElementById('up-chap-id').value;
                    const projetId = document.getElementById('up-chap-projet-id').value;
                    const titre = document.getElementById('up-chap-titre').value;
                    
                    const btn = e.target.querySelector('button[type="submit"]');
                    btn.innerHTML = 'Synchronisation Cloud...';
                    btn.disabled = true;

                    try {
                        const client = SupabaseService.getClient();
                        
                        // 1. Récupérer l'ordre final depuis la grille
                        const sortedThumbs = [...document.querySelectorAll('.edit-chap-thumb')];
                        const finalPages = [];
                        const filesToUpload = [];

                        for (const thumb of sortedThumbs) {
                            if (thumb.dataset.type === 'url') {
                                finalPages.push(thumb.dataset.content);
                            } else if (thumb.dataset.type === 'file') {
                                // On stocke l'index pour le remplacement ultérieur
                                finalPages.push(null); 
                                filesToUpload.push({
                                    index: finalPages.length - 1,
                                    file: AdminController._tempStudioFiles[parseInt(thumb.dataset.contentIdx)]
                                });
                            }
                        }
                        
                        // 2. Uploader les nouveaux fichiers
                        if (filesToUpload.length > 0) {
                            for (let i = 0; i < filesToUpload.length; i++) {
                                const { index, file } = filesToUpload[i];
                                btn.innerHTML = `Cloud Sync... (${i+1}/${filesToUpload.length})`;
                                const ext = file.name.split('.').pop();
                                const filename = `${projetId}_update_${Date.now()}_${i}.${ext}`;
                                await client.storage.from('pages').upload(filename, file);
                                const { data: { publicUrl } } = client.storage.from('pages').getPublicUrl(filename);
                                finalPages[index] = publicUrl;
                            }
                        }

                        // 3. Update BDD
                        await client.from('chapitres').update({
                            titre: titre,
                            pages_urls: finalPages
                        }).eq('id', chapId);

                        // Cleanup temp state
                        AdminController._tempStudioFiles = [];
                        document.getElementById('admin-modal-root').innerHTML = '';
                        AdminController.afficher();
                    } catch(errUp) {
                        alert("Erreur MAJ Chapitre : " + errUp.message);
                        btn.disabled = false;
                        btn.innerHTML = 'Enregistrer les modifications';
                    }
                }
            };

        } catch(err) {
            console.error("DEBUG ADMIN CRASH:", err);
            app.innerHTML = `<div style="color:red; background:#111; padding:30px; border:1px solid red; font-family:monospace; margin:50px;">
                <h2>Erreur critique du serveur Admin Studio</h2>
                <b>Message:</b> ${err.message}<br>
                <b>Stack:</b><br><pre style="white-space:pre-wrap; font-size:12px; margin-top:10px;">${err.stack}</pre>
            </div>`;
        }
    }

    /**
     * MOTEUR DU STUDIO DE PRODUCTION (Drag & Drop + Tri)
     */
    static _tempStudioFiles = [];

    static initialiserStudioChapitre(projet, chapitre) {
        const grid = document.getElementById('edit-thumb-grid');
        const container = document.getElementById('drop-zone-container');
        const indicator = document.getElementById('drop-indicator');
        const fileInput = document.getElementById('up-chap-add-pages-hidden');
        const btnTrigger = document.getElementById('btn-trigger-add-pages');
        
        // État local des planches : { type: 'url'|'file', content: string|index }
        let currentPlanches = (chapitre.pages || []).map(url => ({ type: 'url', content: url }));
        AdminController._tempStudioFiles = [];

        const renderGrid = () => {
            grid.innerHTML = '';
            document.getElementById('up-chap-count').textContent = currentPlanches.length;

            currentPlanches.forEach((p, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'edit-chap-thumb';
                thumb.draggable = true;
                thumb.dataset.type = p.type;
                thumb.dataset.content = p.type === 'url' ? p.content : '';
                thumb.dataset.contentIdx = p.type === 'file' ? p.content : '';

                const src = p.type === 'url' ? p.content : URL.createObjectURL(AdminController._tempStudioFiles[p.content]);
                
                thumb.style.cssText = `
                    position:relative; border-radius:6px; overflow:hidden; border:2px solid #222; 
                    aspect-ratio:3/2; background:#000; cursor:grab; transition: transform 0.2s, border-color 0.2s;
                `;
                
                thumb.innerHTML = `
                    <img src="${src}" style="width:100%; height:100%; object-fit:cover; opacity:0.8; pointer-events:none;">
                    <div style="position:absolute; bottom:0; left:0; background:rgba(0,0,0,0.8); color:white; padding:2px 6px; font-size:0.7rem; font-weight:bold;">#${idx+1}</div>
                    ${p.type === 'file' ? `<div style="position:absolute; top:5px; left:5px; background:var(--primary); color:white; padding:2px 4px; border-radius:3px; font-size:0.6rem; font-weight:bold;">NOUVEAU</div>` : ''}
                    <button type="button" class="btn-remove-p" style="position:absolute; top:5px; right:5px; background:rgba(239,68,68,0.9); color:white; border:none; width:22px; height:22px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold;">✕</button>
                `;

                // Suppression individuelle
                thumb.querySelector('.btn-remove-p').onclick = (e) => {
                    e.stopPropagation();
                    if(confirm("Supprimer cette planche ?")) {
                        currentPlanches.splice(idx, 1);
                        renderGrid();
                    }
                };

                // DRAG & DROP INTERNE (TRI)
                thumb.ondragstart = (e) => {
                    e.dataTransfer.setData('index', idx);
                    thumb.style.opacity = '0.5';
                    thumb.style.transform = 'scale(0.9)';
                };
                thumb.ondragend = () => { thumb.style.opacity = '1'; thumb.style.transform = 'none'; };
                thumb.ondragover = (e) => { e.preventDefault(); thumb.style.borderColor = 'var(--primary)'; };
                thumb.ondragleave = () => { thumb.style.borderColor = '#222'; };
                thumb.ondrop = (e) => {
                    e.preventDefault();
                    const fromIdx = parseInt(e.dataTransfer.getData('index'));
                    if(!isNaN(fromIdx) && fromIdx !== idx) {
                        const moved = currentPlanches.splice(fromIdx, 1)[0];
                        currentPlanches.splice(idx, 0, moved);
                        renderGrid();
                    }
                };

                grid.appendChild(thumb);
            });
        };

        // DRAG & DROP EXTERNE (FICHIERS)
        container.ondragover = (e) => {
            e.preventDefault();
            indicator.style.display = 'flex';
        };
        container.ondragleave = () => {
            indicator.style.display = 'none';
        };
        container.ondrop = (e) => {
            e.preventDefault();
            indicator.style.display = 'none';
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                Array.from(files).forEach(f => {
                    if (f.type.startsWith('image/')) {
                        const newIdx = AdminController._tempStudioFiles.push(f) - 1;
                        currentPlanches.push({ type: 'file', content: newIdx });
                    }
                });
                renderGrid();
            }
        };

        // CLICK TRIGGER ADD
        btnTrigger.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const files = e.target.files;
            if (files) {
                Array.from(files).forEach(f => {
                    const newIdx = AdminController._tempStudioFiles.push(f) - 1;
                    currentPlanches.push({ type: 'file', content: newIdx });
                });
                renderGrid();
            }
        };

        renderGrid();
    }
}
