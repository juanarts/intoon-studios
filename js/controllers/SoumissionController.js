import VueSoumission from '../views/VueSoumission.js';
import Projet from '../models/Projet.js';
import Auth from '../models/Auth.js';
import SupabaseService from '../services/SupabaseService.js';

export default class SoumissionController {
    static afficher() {
        const app = document.getElementById('app');
        app.innerHTML = VueSoumission.rendre();
        
        // Logique Réelle d'envoi du dossier vers la modération
        document.getElementById('form-soumission').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Extraction des données du DOM
            const inputs = e.target.querySelectorAll('input, select, textarea');
            const auteurNom = inputs[0].value;
            const titreProjet = inputs[2].value;
            const descriptionPitch = inputs[4].value;
            const lienPlanches = inputs[7].value; 
            
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = 'Upload en cours (veuillez patienter)...';
            btn.disabled = true;

            try {
                // Traitement Vidéo
                const videoInput = document.getElementById('soumission-video');
                const videoUrlInput = document.getElementById('soumission-video-url');
                let finalVideoUrl = videoUrlInput.value.trim() !== '' ? videoUrlInput.value.trim() : null;
                let fileVideo = (videoInput && videoInput.files.length > 0) ? videoInput.files[0] : null;

                if (fileVideo && fileVideo.size > 20 * 1024 * 1024) { 
                    alert('⚠️ La vidéo dépasse 20 Mo !');
                    btn.innerHTML = 'Envoyer ma candidature 🔥';
                    btn.disabled = false;
                    return; 
                }

                // Récupération Cover
                const coverInput = document.getElementById('soumission-cover');
                let fileCover = (coverInput && coverInput.files.length > 0) ? coverInput.files[0] : null;

                const client = SupabaseService.getClient();
                let uploadedCoverUrl = "";
                let uploadedVideoUrl = finalVideoUrl;

                // 1. Upload Cover sur le Bucket (Storage)
                if (fileCover) {
                    const ext = fileCover.name.split('.').pop();
                    const filename = `cover_${Date.now()}.${ext}`;
                    const { data: dCover, error: eCover } = await client.storage.from('covers').upload(filename, fileCover);
                    if (eCover) throw new Error("Erreur d'upload de la couverture: " + eCover.message);
                    
                    const { data: { publicUrl: pCoverUrl } } = client.storage.from('covers').getPublicUrl(filename);
                    uploadedCoverUrl = pCoverUrl;
                }

                // 2. Upload Video Natif (Storage)
                if (fileVideo && !finalVideoUrl) {
                    const ext = fileVideo.name.split('.').pop();
                    const filename = `video_${Date.now()}.${ext}`;
                    const { data: dVid, error: eVid } = await client.storage.from('videos').upload(filename, fileVideo);
                    if (eVid) throw new Error("Erreur d'upload de la vidéo: " + eVid.message);
                    
                    const { data: { publicUrl: pVidUrl } } = client.storage.from('videos').getPublicUrl(filename);
                    uploadedVideoUrl = pVidUrl;
                }

                // 3. Insertion SQL en BDD
                const currentUser = Auth.getUtilisateur();
                if (!currentUser || !currentUser.id) throw new Error("Vous devez être connecté (compte Supabase) pour publier.");

                await Projet.ajouter({
                    author_id: currentUser.id,
                    titre: titreProjet,
                    description: descriptionPitch + `\n\n[Uploadé par le Créateur : ${auteurNom}]\n[Lien externe Planches : ${lienPlanches}]`,
                    couverture: uploadedCoverUrl || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&q=80',
                    videoPromoUrl: uploadedVideoUrl,
                    statut: 'brouillon',
                    pegi: 'TP'
                });
                
                // Succès Visualisation
                e.target.innerHTML = `
                    <div style="text-align:center; padding:60px 10px; animation:fadeIn 0.5s;">
                        <div style="font-size:4rem; margin-bottom:20px;">✅</div>
                        <h2 style="color:white; font-size:2.2rem; margin-bottom:15px;">Œuvre uploadée sur le Cloud !</h2>
                        <p style="color:#aaa; font-size:1.1rem; line-height:1.6; max-width:500px; margin:0 auto;">
                            Félicitations <b>${auteurNom}</b> ! Votre série <i>${titreProjet}</i> a bien été aspirée dans notre Base de Données Sécurisée.<br><br>
                            Vos images sont désormais stockées de façon permanente. Nos équipes vont vérifier tout cela !
                        </p>
                        <br><br>
                        <a href="/" data-link class="btn-primary">Retour à l'Accueil</a>
                    </div>
                `;
            } catch (error) {
                console.error(error);
                alert("Erreur Serveur: " + error.message);
                btn.innerHTML = 'Ressayer';
                btn.disabled = false;
            }
        });
    }
}
