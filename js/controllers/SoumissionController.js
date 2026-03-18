import VueSoumission from '../views/VueSoumission.js';
import Projet from '../models/Projet.js';

export default class SoumissionController {
    static afficher() {
        const app = document.getElementById('app');
        app.innerHTML = VueSoumission.rendre();
        
        // Logique Réelle d'envoi du dossier vers la modération
        document.getElementById('form-soumission').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Extraction des données du DOM (basé sur la structure VueSoumission)
            const inputs = e.target.querySelectorAll('input, select, textarea');
            const auteurNom = inputs[0].value;
            const titreProjet = inputs[2].value;
            const descriptionPitch = inputs[4].value;
            const lienPlanches = inputs[7].value; // Updated index due to added inputs

            // Traitement conditionnel Vidéo (Upload Natif 20Mo vs YouTube)
            const videoInput = document.getElementById('soumission-video');
            const videoUrlInput = document.getElementById('soumission-video-url');
            let finalVideoUrl = null;
            
            if (videoUrlInput && videoUrlInput.value.trim() !== '') {
                finalVideoUrl = videoUrlInput.value.trim();
            } else if (videoInput && videoInput.files.length > 0) {
                const file = videoInput.files[0];
                if (file.size > 20 * 1024 * 1024) { // 20 MB Limit Validation
                    alert('⚠️ Poids excessif : La vidéo dépasse la limite stricte de 20 Mo imposée par les serveurs ! Veuillez la compresser ou utiliser un lien YouTube.');
                    return; // Stop la soumission
                }
                // Pour le Prototype "Sans Serveur", on convertit localement (éphémère)
                finalVideoUrl = URL.createObjectURL(file);
            }

            const processSubmission = async (coverUrl) => {
                const nvProjet = {
                    id: 'projet-' + Date.now(),
                    titre: titreProjet,
                    description: descriptionPitch + `\n\n[Uploadé par le Créateur : ${auteurNom}]\n[Lien externe DB : ${lienPlanches}]`,
                    couverture: coverUrl, 
                    videoPromoUrl: finalVideoUrl,
                    chapitres: [],
                    likes: 0,
                    statut: 'brouillon',
                    pegi: 'TP',
                    langues: ['fr']
                };

                const db = await Projet.chargerTous();
                db.unshift(nvProjet);
                Projet.sauvegarderTous(db);
                
                e.target.innerHTML = `
                    <div style="text-align:center; padding:60px 10px; animation:fadeIn 0.5s;">
                        <div style="font-size:4rem; margin-bottom:20px;">✅</div>
                        <h2 style="color:white; font-size:2.2rem; margin-bottom:15px;">Œuvre mise en file d'attente !</h2>
                        <p style="color:#aaa; font-size:1.1rem; line-height:1.6; max-width:500px; margin:0 auto;">
                            Félicitations <b>${auteurNom}</b> ! Votre série <i>${titreProjet}</i> a bien été aspirée dans l'écosystème Intoon.<br><br>
                            Elle a été placée en statut <b>Brouillon</b> dans la zone de Modération du Control Panel. Nos équipes (ou Admins) vont la valider très vite !
                        </p>
                        <br><br>
                        <a href="/" data-link class="btn-primary">Retour à l'Accueil</a>
                    </div>
                `;
            };

            const coverInput = document.getElementById('soumission-cover');
            if (coverInput && coverInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (ev) => processSubmission(ev.target.result);
                reader.readAsDataURL(coverInput.files[0]);
            } else {
                processSubmission('https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&q=80');
            }
        });
    }
}
