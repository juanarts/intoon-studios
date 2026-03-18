import VueAdmin from '../views/VueAdmin.js';
import Projet from '../models/Projet.js';
import Auth from '../models/Auth.js';

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
            app.onclick = (e) => {
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
                        const pIndex = projets.findIndex(p => p.id === id);
                        if(pIndex >= 0) projets[pIndex].statut = 'banni';
                        Projet.sauvegarderTous(projets); 
                        alert("Un email d'avertissement de suspension automatique de compte a été simulé à l'auteur de l'œuvre.");
                        AdminController.afficher(); 
                    }
                } else if (target.closest('.btn-restore-serie')) {
                    const id = target.closest('.btn-restore-serie').getAttribute('data-id');
                    const pIndex = projets.findIndex(p => p.id === id);
                    if(pIndex >= 0) projets[pIndex].statut = 'publié';
                    Projet.sauvegarderTous(projets); 
                    AdminController.afficher(); 
                }
            };

            // GESTION STATIQUE DES FICHIERS UPLOADÉS
            app.onsubmit = (e) => {
                if (e.target.tagName !== 'FORM') return;
                
                const formId = e.target.id;
                e.preventDefault();

                if (formId === 'form-edit-serie') {
                    const editId = document.getElementById('edit-id').value;
                    const id = editId ? editId : 'projet-' + Date.now();
                    const titre = document.getElementById('edit-titre').value;
                    const desc = document.getElementById('edit-desc').value;
                    
                    const pIndex = projets.findIndex(p => p.id === editId);

                    const couvInput = document.getElementById('edit-couverture');
                    
                    const processSave = (finalCouv) => {
                        const inputStatut = document.getElementById('edit-statut').value;
                        const inputPegi = document.getElementById('edit-pegi').value;
                        
                        const checkboxesLang = document.querySelectorAll('input[name="edit-lang"]:checked');
                        const languesChoisis = Array.from(checkboxesLang).map(cb => cb.value);
                        if(languesChoisis.length === 0) languesChoisis.push('fr'); // Fallback automatique

                        if (pIndex >= 0) {
                            projets[pIndex].titre = titre;
                            projets[pIndex].description = desc;
                            projets[pIndex].couverture = finalCouv;
                            projets[pIndex].statut = inputStatut;
                            projets[pIndex].pegi = inputPegi;
                            projets[pIndex].langues = languesChoisis;
                        } else {
                            projets.unshift({ id: id, titre: titre, description: desc, couverture: finalCouv, videoPromoUrl: null, chapitres: [], likes: 0, statut: inputStatut, pegi: inputPegi, langues: languesChoisis });
                        }
                        
                        Projet.sauvegarderTous(projets);
                        document.getElementById('admin-modal-root').innerHTML = '';
                        AdminController.afficher(); 
                    };

                    if (couvInput && couvInput.files.length > 0) {
                        const reader = new FileReader();
                        reader.onload = (ev) => processSave(ev.target.result); // Base64 saving
                        reader.readAsDataURL(couvInput.files[0]);
                    } else {
                        let defaultCouv = '';
                        if (pIndex >= 0) defaultCouv = projets[pIndex].couverture; 
                        else defaultCouv = '/assets/images/monarque_cover.png'; 
                        processSave(defaultCouv);
                    }
                }

                if (formId === 'form-add-chap') {
                    const projetId = document.getElementById('chap-projet-id').value;
                    const titre = document.getElementById('chap-titre').value;
                    
                    // NOUVEAU : Traitement de l'input type="file" multiple
                    const fileInput = document.getElementById('chap-pages');
                    const pagesArray = [];
                    
                    if (fileInput && fileInput.files.length > 0) {
                        for (let i = 0; i < fileInput.files.length; i++) {
                            const fileName = fileInput.files[i].name;
                            // En simulant l'API backend : on définit le path public vers le dossier d'images
                            pagesArray.push(`/assets/images/${fileName}`);
                        }
                    }

                    const pIndex = projets.findIndex(p => p.id === projetId);
                    if (pIndex >= 0) {
                        const chapId = 'chap-' + Date.now();
                        const order = projets[pIndex].chapitres ? projets[pIndex].chapitres.length + 1 : 1;
                        if(!projets[pIndex].chapitres) projets[pIndex].chapitres = [];
                        
                        projets[pIndex].chapitres.push({
                            id: chapId,
                            titre: titre,
                            ordre: order,
                            pages: pagesArray
                        });
                        Projet.sauvegarderTous(projets);
                        document.getElementById('admin-modal-root').innerHTML = '';
                        AdminController.afficher();
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
