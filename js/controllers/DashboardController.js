import VueDashboard from '../views/VueDashboard.js';
import Favoris from '../models/Favoris.js';
import Projet from '../models/Projet.js';
import Auth from '../models/Auth.js';
import SupabaseService from '../services/SupabaseService.js';
import ProfilController from './ProfilController.js';

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
            const client = SupabaseService.getClient();

            // Parallélisation des requêtes Supabase
            const [projetsFavoris, { data: dbProjets }] = await Promise.all([
                idsFavoris.length > 0 ? Projet.chargerPlusieurs(idsFavoris) : Promise.resolve([]),
                client.from('projets').select('*').eq('author_id', utilisateur.id)
            ]);

            const mesProjets = dbProjets ? dbProjets.map(p => new Projet(p)) : [];

            // RÉCUPÉRATION DE L'HISTORIQUE RÉEL
            import('../models/Historique.js').then(async (m) => {
                const Historique = m.default;
                const dataHisto = Historique.getDernier();
                let projetEnCours = null;
                let chapitreEnCours = null;

                if (dataHisto) {
                    // Charger le projet de l'historique (peut être un favori ou un autre)
                    projetEnCours = await Projet.chargerParId(dataHisto.idProjet) || await Projet.chargerParSlug(dataHisto.idProjet);
                    if (projetEnCours) {
                        chapitreEnCours = projetEnCours.chapitres.find(c => c.id === dataHisto.idChapitre);
                    }
                }

                app.innerHTML = VueDashboard.rendre(projetsFavoris, utilisateur, mesProjets, projetEnCours, chapitreEnCours);
            });

            // GESTION DES ÉVÉNEMENTS DÉLÉGUÉS (DASHBOARD)
            app.onclick = async (e) => {
                // Déconnexion
                if (e.target.closest('.btn-logout')) {
                    e.preventDefault();
                    Auth.deconnecter();
                    window.appRouter.navigate('/');
                    return;
                }

                // Édition Crew
                const btnCrew = e.target.closest('.btn-edit-crew');
                if (btnCrew) {
                    this.ouvrirModaleCrew(btnCrew.getAttribute('data-id'), mesProjets, client);
                }
            };

            // Soumission du profil (Délégué sur le conteneur pour éviter les doublons document)
            app.onsubmit = (e) => {
                if (e.target.id === 'form-edit-profil') ProfilController.sauvegarderProfil(e);
            };

        } catch(err) {
            console.error('[Dashboard Error]', err);
            app.innerHTML = '<div class="error" style="padding:100px; color:white; text-align:center;">' +
                            '<h2>Oops ! Impossible de charger votre profil.</h2>' +
                            '<p style="color:#888; margin-top:10px;">Vérifiez votre connexion ou retentez dans un instant.</p>' +
                            '<button onclick="location.reload()" class="btn-primary" style="margin-top:20px;">Actualiser la page</button></div>';
        }
    }

    /**
     * Logique de la modale Cast & Crew (Déportée pour clarté)
     */
    static ouvrirModaleCrew(projetId, mesProjets, client) {
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
                            <input type="text" id="crew-scenariste" value="${projetActuel.scenariste || ''}" placeholder="Nom du scénariste..." style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:6px; outline:none;">
                        </div>
                        
                        <div>
                            <label style="color:#888; font-size:0.85rem; margin-bottom:5px; display:block;">Dessinateur(s) / Illustrateur(s)</label>
                            <input type="text" id="crew-dessinateur" value="${projetActuel.dessinateur || ''}" placeholder="Nom de l'illustrateur..." style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:6px; outline:none;">
                        </div>
                        
                        <div>
                            <label style="color:#888; font-size:0.85rem; margin-bottom:5px; display:block;">Cast (Personnages Principaux / Acteurs)</label>
                            <input type="text" id="crew-cast" value="${projetActuel.casting || ''}" placeholder="Ex: Alex, Sarah, Leo..." style="width:100%; padding:12px; background:#222; border:1px solid #444; color:white; border-radius:6px; outline:none;">
                        </div>
                        
                        <div>
                            <label style="color:#888; font-size:0.85rem; margin-bottom:5px; display:block;">Mettre à jour le Trailer TV (Lien YouTube / Vimeo)</label>
                            <input type="url" id="crew-trailer" placeholder="https://youtube.com/..." value="${projetActuel.videoPromoUrl || projetActuel.video_promo_url || ''}" style="width:100%; padding:12px; background:#1a1a24; border:1px solid #258cf4; color:white; border-radius:6px; outline:none;">
                        </div>

                        <!-- [NEW] SECTION BOUTIQUE MARKETPLACE -->
                        ${projetActuel.shopEnabled ? `
                        <div style="margin-top:20px; padding:20px; background:rgba(96,165,250,0.05); border:1px solid rgba(96,165,250,0.2); border-radius:8px;">
                            <h3 style="color:#60a5fa; font-size:1rem; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                                <span class="material-symbols-outlined">shopping_cart</span> Configuration Boutique
                            </h3>
                            
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <label style="display:flex; align-items:center; gap:10px; color:white; cursor :pointer;">
                                    <input type="checkbox" id="shop-has-physical" ${projetActuel.hasPhysical ? 'checked' : ''} style="accent-color:#4ade80; width:18px; height:18px;">
                                    <span>Vendre une Version Physique (Comic)</span>
                                </label>
                                <input type="number" id="shop-price-physical" value="${projetActuel.pricePhysical || 0}" step="0.01" placeholder="Prix du comic (€)" style="width:100%; padding:10px; background:#000; border:1px solid #333; color:#4ade80; border-radius:6px; margin-bottom:5px;">

                                <label style="display:flex; align-items:center; gap:10px; color:white; cursor:pointer; margin-top:5px;">
                                    <input type="checkbox" id="shop-has-originals" ${projetActuel.hasOriginals ? 'checked' : ''} style="accent-color:#f472b6; width:18px; height:18px;">
                                    <span>Vendre des Planches Originales</span>
                                </label>
                                <input type="number" id="shop-price-original" value="${projetActuel.priceOriginal || 0}" step="0.01" placeholder="Prix de la planche (€)" style="width:100%; padding:10px; background:#000; border:1px solid #333; color:#f472b6; border-radius:6px;">

                                <textarea id="shop-desc" placeholder="Infos de livraison, dédicaces, etc..." style="width:100%; padding:12px; background:#222; border:1px solid #444; color:#aaa; border-radius:6px; margin-top:10px; resize:none;">${projetActuel.shopDescription || ''}</textarea>
                            </div>
                        </div>
                        ` : ''}

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
                const scenar = document.getElementById('crew-scenariste').value.trim();
                const dessin = document.getElementById('crew-dessinateur').value.trim();
                const cast = document.getElementById('crew-cast').value.trim();
                const trailer = document.getElementById('crew-trailer').value.trim();

                const payload = {
                    scenariste: scenar,
                    dessinateur: dessin,
                    casting: cast,
                    video_promo_url: trailer || null
                };

                if (projetActuel.shopEnabled) {
                    payload.has_physical = document.getElementById('shop-has-physical').checked;
                    payload.has_originals = document.getElementById('shop-has-originals').checked;
                    payload.price_physical = parseFloat(document.getElementById('shop-price-physical').value) || 0;
                    payload.price_original = parseFloat(document.getElementById('shop-price-original').value) || 0;
                    payload.shop_description = document.getElementById('shop-desc').value.trim();
                }

                const { error: updateErr } = await client.from('projets').update(payload).eq('id', projetId);

                if (updateErr) throw updateErr;

                modale.remove();
                alert('✅ Fiche de production mise à jour avec succès !');
                DashboardController.afficher();
            } catch(errUpdate) {
                console.error('[Crew Update Error]', errUpdate);
                alert("Erreur de mise à jour : " + (errUpdate.message || JSON.stringify(errUpdate)));
                submitBtn.innerHTML = 'Mettre à jour la Fiche';
                submitBtn.disabled = false;
            }
        };
    }
}
