import VueDashboard from '../views/VueDashboard.js';
import Favoris from '../models/Favoris.js';
import Projet from '../models/Projet.js';
import Auth from '../models/Auth.js';
import SupabaseService from '../services/SupabaseService.js';

export default class DashboardController {
    static async afficher() {
        const app = document.getElementById('app');

        // PROTECTION DE ROUTE : Vérifier que quelqu'un est connecté
        if (!Auth.estConnecte()) {
            window.appRouter.navigate('/connexion');
            return;
        }

        const utilisateur = Auth.getUtilisateur();

        app.innerHTML = '<div class="loader" style="color:white;">Chargement de votre espace sécurisé INTOON...</div>';
        
        try {
            const idsFavoris = Favoris.getTous();
            let projetsFavoris = [];
            
            if (idsFavoris.length > 0) {
                const tousProjets = await Projet.chargerTous();
                projetsFavoris = tousProjets.filter(p => idsFavoris.includes(p.id));
            }
            
            const client = SupabaseService.getClient();
            const { data: dbProjets } = await client.from('projets').select('*').eq('author_id', utilisateur.id);
            const mesProjets = dbProjets ? dbProjets.map(p => new Projet(p)) : [];
            
            app.innerHTML = VueDashboard.rendre(projetsFavoris, utilisateur, mesProjets);
            
            // GESTION FICHE DE PRODUCTION (CAST & CREW)
            app.onclick = async (e) => {
                const btnCrew = e.target.closest('.btn-edit-crew');
                if (btnCrew) {
                    const projetId = btnCrew.getAttribute('data-id');
                    const projetActuel = mesProjets.find(p => p.id === projetId);
                    if (!projetActuel) return;

                    const modale = document.createElement('div');
                    modale.id = 'modal-crew';
                    modale.innerHTML = `
                        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
                            <div style="background:#111; border:1px solid #333; padding:40px; border-radius:12px; width:90%; max-width:500px; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
                                <h2 style="font-size:1.8rem; margin-bottom:10px; color:var(--primary);">Fiche de Production</h2>
                                <p style="color:#aaa; margin-bottom:25px; font-size:0.9rem;">Complétez l'équipe créative de <b>${projetActuel.titre}</b> et mettez à jour votre Bande-Annonce Officielle.</p>
                                
                                <form id="form-crew" style="display:flex; flex-direction:column; gap:15px;">
                                    <input type="hidden" id="crew-projet-id" value="${projetActuel.id}">
                                    
                                    <div>
                                        <label style="color:#888; font-size:0.85rem; margin-bottom:5px; display:block;">Scénariste(s)</label>
                                        <input type="text" id="crew-scenariste" placeholder="Nom du scénariste..." style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:6px; outline:none;">
                                    </div>
                                    
                                    <div>
                                        <label style="color:#888; font-size:0.85rem; margin-bottom:5px; display:block;">Dessinateur(s) / Illustrateur(s)</label>
                                        <input type="text" id="crew-dessinateur" placeholder="Nom de l'illustrateur..." style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:6px; outline:none;">
                                    </div>
                                    
                                    <div>
                                        <label style="color:#888; font-size:0.85rem; margin-bottom:5px; display:block;">Mettre à jour le Trailer TV (Lien YouTube / Vimeo)</label>
                                        <input type="url" id="crew-trailer" placeholder="https://youtube.com/..." value="${projetActuel.videoPromoUrl || ''}" style="width:100%; padding:12px; background:#1a1a24; border:1px solid #258cf4; color:white; border-radius:6px; outline:none;">
                                    </div>

                                    <div style="display:flex; gap:10px; margin-top:15px;">
                                        <button type="button" class="btn-close-crew" style="flex:1; padding:12px; background:#333; color:white; border:none; border-radius:6px; cursor:pointer;">Annuler</button>
                                        <button type="submit" style="flex:2; padding:12px; background:var(--primary); color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Mettre à jour la Fiche</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modale);

                    modale.querySelector('.btn-close-crew').onclick = () => modale.remove();
                    
                    modale.querySelector('#form-crew').onsubmit = async (ev) => {
                        ev.preventDefault();
                        const submitBtn = ev.target.querySelector('button[type="submit"]');
                        submitBtn.innerHTML = 'Sauvegarde...';
                        submitBtn.disabled = true;

                        try {
                            const projetId = document.getElementById('crew-projet-id').value;
                            const scenar = document.getElementById('crew-scenariste').value.trim();
                            const dessin = document.getElementById('crew-dessinateur').value.trim();
                            const trailer = document.getElementById('crew-trailer').value.trim();

                            if (!projetId) throw new Error('ID du projet manquant');
                            
                            // On injecte discrètement l'équipe dans la description
                            let newDesc = projetActuel.description || "";
                            if(newDesc.includes('\uD83C\uDFAC **Fiche de Production :**')) {
                                newDesc = newDesc.split('\uD83C\uDFAC **Fiche de Production :**')[0].trim();
                            }
                            
                            if (scenar || dessin) {
                                newDesc += `\n\n\uD83C\uDFAC **Fiche de Production :**\n`;
                                if (scenar) newDesc += `\u2022 Sc\u00e9nario : ${scenar}\n`;
                                if (dessin) newDesc += `\u2022 Illustration : ${dessin}\n`;
                            }

                            console.log('[Crew Update] Projet ID:', projetId, '| Trailer:', trailer);

                            const { error: updateErr } = await client.from('projets').update({
                                description: newDesc,
                                video_promo_url: trailer || null
                            }).eq('id', projetId);

                            if (updateErr) throw updateErr;

                            modale.remove();
                            alert('\u2705 Fiche de production mise \u00e0 jour avec succ\u00e8s !');
                            DashboardController.afficher();
                        } catch(errUpdate) {
                            console.error('[Crew Update Error]', errUpdate);
                            alert("Erreur de mise \u00e0 jour : " + (errUpdate.message || JSON.stringify(errUpdate)));
                            submitBtn.innerHTML = 'Mettre \u00e0 jour la Fiche';
                            submitBtn.disabled = false;
                        }
                    };
                }
            };

        } catch(err) {
            app.innerHTML = '<div class="error">Erreur de chargement du profil utilisateur.</div>';
        }
    }
}
