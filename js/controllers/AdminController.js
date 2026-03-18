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
            let projets = await Projet.chargerTous();
            app.innerHTML = VueAdmin.rendreDashboard(projets);

            // GESTION DES CLICS STANDARDS
            app.onclick = async (e) => {
                const target = e.target;
                const modalRoot = document.getElementById('admin-modal-root');
                if(!modalRoot) return;

                if (target.closest('.btn-close-modal')) {
                    modalRoot.innerHTML = '';
                } else if (target.id === 'btn-create-serie') {
                    modalRoot.innerHTML = VueAdmin.rendreModaleEdition();
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
                }
            };

            // GESTION STATIQUE DES FICHIERS UPLOADÉS
            app.onsubmit = async (e) => {
                if (e.target.tagName !== 'FORM') return;
                
                const formId = e.target.id;
                e.preventDefault();

                if (formId === 'form-edit-serie') {
                    const editId = document.getElementById('edit-id').value;
                    const titre = document.getElementById('edit-titre').value;
                    const desc = document.getElementById('edit-desc').value;
                    const couvInput = document.getElementById('edit-couverture');
                    const inputStatut = document.getElementById('edit-statut').value;
                    const inputPegi = document.getElementById('edit-pegi').value;
                    
                    const btn = document.querySelector('#form-edit-serie button');
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
                            await client.storage.from('covers').upload(filename, file);
                            const { data: { publicUrl } } = client.storage.from('covers').getPublicUrl(filename);
                            finalCouv = publicUrl;
                        }

                        const payload = {
                            titre: titre,
                            description: desc,
                            couverture_url: finalCouv,
                            statut: inputStatut,
                            pegi_rating: inputPegi
                        };

                        if (editId) {
                            await client.from('projets').update(payload).eq('id', editId);
                        } else {
                            const currentUser = Auth.getUtilisateur();
                            if(!currentUser) throw new Error("Accès refusé");
                            payload.author_id = currentUser.id;
                            await client.from('projets').insert([payload]);
                        }
                        
                        document.getElementById('admin-modal-root').innerHTML = '';
                        AdminController.afficher(); 
                    } catch(e) {
                        alert("Erreur BDD: " + e.message);
                        btn.disabled = false;
                        btn.innerHTML = 'Enregistrer';
                    }
                }

                if (formId === 'form-add-chap') {
                    const projetId = document.getElementById('chap-projet-id').value;
                    const titre = document.getElementById('chap-titre').value;
                    const fileInput = document.getElementById('chap-pages');
                    
                    const btn = document.querySelector('#form-add-chap button');
                    btn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">cloud_upload</span> Upload des planches...';
                    btn.disabled = true;

                    try {
                        const client = SupabaseService.getClient();
                        const pagesArray = [];
                        
                        if (fileInput && fileInput.files.length > 0) {
                            for (let i = 0; i < fileInput.files.length; i++) {
                                const file = fileInput.files[i];
                                const ext = file.name.split('.').pop();
                                const filename = `${projetId}_${Date.now()}_${i}.${ext}`;
                                
                                const { error: upErr } = await client.storage.from('pages').upload(filename, file);
                                if (upErr) throw upErr;
                                
                                const { data: { publicUrl } } = client.storage.from('pages').getPublicUrl(filename);
                                pagesArray.push(publicUrl);
                            }
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
}
