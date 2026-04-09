import VueSoumission from '../views/VueSoumission.js';
import Projet from '../models/Projet.js';
import Chapitre from '../models/Chapitre.js';
import Auth from '../models/Auth.js';
import SupabaseService from '../services/SupabaseService.js';

export default class SoumissionController {
    static afficher() {
        const app = document.getElementById('app');
        app.innerHTML = VueSoumission.rendre();
        
        let planchesToUpload = [];

        // --- GESTION DU DRAG & DROP ET COMPRESSION WEB-P ---
        const dropzone = document.getElementById('dropzone-planches');
        const inputPlanches = document.getElementById('input-planches');
        const previewContainer = document.getElementById('preview-planches');

        if (dropzone && inputPlanches) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, () => dropzone.style.borderColor = 'var(--primary)', false);
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, () => dropzone.style.borderColor = '#555', false);
            });

            dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files), false);
            inputPlanches.addEventListener('change', (e) => handleFiles(e.target.files), false);
            
            dropzone.addEventListener('click', (e) => {
                if(e.target.tagName !== 'BUTTON') inputPlanches.click();
            });

            async function handleFiles(files) {
                const imgFiles = [...files].filter(f => f.type.startsWith('image/'));
                // Trier par nom (utile pour manga_01, manga_02...)
                imgFiles.sort((a,b) => a.name.localeCompare(b.name));
                
                dropzone.querySelector('h3').textContent = 'Compression en cours...';
                
                for (let i = 0; i < imgFiles.length; i++) {
                    const file = imgFiles[i];
                    try {
                        const compressedBlob = await compressImage(file, 800);
                        planchesToUpload.push({
                            blob: compressedBlob,
                            name: `planche_${Date.now()}_${planchesToUpload.length}.webp`,
                            originalName: file.name
                        });
                    } catch (e) {
                        console.error("Compression failed", e);
                    }
                }
                dropzone.querySelector('h3').textContent = 'Planches uploadées et compressées !';
                renderPreviews();
            }

            function renderPreviews() {
                previewContainer.innerHTML = planchesToUpload.map((p, idx) => {
                    const url = URL.createObjectURL(p.blob);
                    return `
                        <div style="position:relative; width:80px; height:120px; border-radius:4px; overflow:hidden; border:1px solid #444;">
                            <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
                            <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); color:white; font-size:0.7rem; text-align:center; padding:2px;">${idx + 1}</div>
                        </div>
                    `;
                }).join('');
            }

            function compressImage(file, maxWidth) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = event => {
                        const img = new Image();
                        img.src = event.target.result;
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            if (width > maxWidth) {
                                height = Math.round((height * maxWidth) / width);
                                width = maxWidth;
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            canvas.toBlob(blob => resolve(blob), 'image/webp', 0.85);
                        };
                        img.onerror = error => reject(error);
                    };
                    reader.onerror = error => reject(error);
                });
            }
        }

        // --- SOUMISSION ---
        document.getElementById('form-soumission').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const inputs = e.target.querySelectorAll('input, select, textarea');
            const auteurNom = inputs[0].value;
            const titreProjet = inputs[2].value;
            const descriptionPitch = inputs[4].value;
            
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = 'Upload en cours (Création du Chapitre 1)...';
            btn.disabled = true;

            try {
                // Video & Cover handling existant...
                const videoInput = document.getElementById('soumission-video');
                const videoUrlInput = document.getElementById('soumission-video-url');
                let finalVideoUrl = videoUrlInput ? videoUrlInput.value.trim() : null;
                let fileVideo = (videoInput && videoInput.files.length > 0) ? videoInput.files[0] : null;

                const coverInput = document.getElementById('soumission-cover');
                let fileCover = (coverInput && coverInput.files.length > 0) ? coverInput.files[0] : null;

                const client = SupabaseService.getClient();
                let uploadedCoverUrl = "";
                let uploadedVideoUrl = finalVideoUrl;

                if (fileCover) {
                    const ext = fileCover.name.split('.').pop();
                    const filename = `cover_${Date.now()}.${ext}`;
                    const { error: eCover } = await client.storage.from('covers').upload(filename, fileCover);
                    if (eCover) throw new Error("Erreur Cover: " + eCover.message);
                    const { data: { publicUrl: pCoverUrl } } = client.storage.from('covers').getPublicUrl(filename);
                    uploadedCoverUrl = pCoverUrl;
                }

                if (fileVideo && !finalVideoUrl) {
                    const ext = fileVideo.name.split('.').pop();
                    const filename = `video_${Date.now()}.${ext}`;
                    const { error: eVid } = await client.storage.from('videos').upload(filename, fileVideo);
                    if (eVid) throw new Error("Erreur Vidéo: " + eVid.message);
                    const { data: { publicUrl: pVidUrl } } = client.storage.from('videos').getPublicUrl(filename);
                    uploadedVideoUrl = pVidUrl;
                }

                // 1. Insertion SQL (Projet)
                const currentUser = Auth.getUtilisateur();
                if (!currentUser || !currentUser.id) throw new Error("Vous devez être connecté (compte Supabase).");

                const projetDbInfo = await Projet.ajouter({
                    author_id: currentUser.id,
                    titre: titreProjet,
                    description: descriptionPitch + `\n\n[Uploadé par le Créateur : ${auteurNom}]`,
                    couverture: uploadedCoverUrl || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&q=80',
                    videoPromoUrl: uploadedVideoUrl,
                    statut: 'brouillon',
                    pegi: 'TP'
                });

                // 2. Upload des planches & Création du Chapitre 1
                let uploadedPlanchesUrls = [];
                if (planchesToUpload.length > 0) {
                    btn.innerHTML = `Envoi des ${planchesToUpload.length} Planches...`;
                    for (let p of planchesToUpload) {
                        const { error: ePlanche } = await client.storage.from('planches').upload(p.name, p.blob);
                        if (!ePlanche) {
                            const { data: { publicUrl: pPlancheUrl } } = client.storage.from('planches').getPublicUrl(p.name);
                            uploadedPlanchesUrls.push(pPlancheUrl);
                        } else {
                            console.error("Erreur de transfert pour", p.name, ePlanche);
                        }
                    }

                    // Créer le chapitre 1 si des pages existent
                    if(uploadedPlanchesUrls.length > 0) {
                        await Chapitre.ajouter({
                            projet_id: projetDbInfo.id,
                            titre: "Épisode 1",
                            ordre: 1,
                            pages_urls: uploadedPlanchesUrls,
                            is_premium: false
                        });
                    }
                }
                
                // Succès 
                e.target.innerHTML = `
                    <div style="text-align:center; padding:60px 10px; animation:fadeIn 0.5s;">
                        <div style="font-size:4rem; margin-bottom:20px;">✅</div>
                        <h2 style="color:white; font-size:2.2rem; margin-bottom:15px;">Projet & Chapitre 1 en ligne !</h2>
                        <p style="color:#aaa; font-size:1.1rem; line-height:1.6; max-width:500px; margin:0 auto;">
                            Félicitations <b>${auteurNom}</b> ! Votre webtoon <i>${titreProjet}</i> a été compressé intelligemment (format WebP) et téléversé.<br><br>
                            Il est actullement en statut de "Brouillon" dans votre tableau de bord.
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
