export default class VueLecteur {
    
    /**
     * Génère la vue du Webtoon (Adaptée selon l'état de connexion de l'utilisateur)
     */
    static rendreLecteur(projet, chapitre, estConnecte = false) {
        if (!chapitre) {
            return `<div class="lecteur-error"><h2>Chapitre introuvable.</h2><a href="/" data-link class="btn-primary">Retour</a></div>`;
        }

        // --- Logique du Mur Payant (Paywall Netflix) ---
        // S'il est connecté, c'est illimité (999). Sinon, limite de 2 pages.
        const maximumVuesLibres = estConnecte ? 9999 : 2; 
        
        // On récupère uniquement le nombre limite d'images gratuites
        const imagesAPrelever = Math.min(chapitre.pages.length, maximumVuesLibres);
        const pagesVisibles = chapitre.pages.slice(0, imagesAPrelever).map((url, index) => `
            <img class="webtoon-page" src="${url}" alt="Planche ${index + 1}" style="width:100%; display:block;">
        `).join('');

        // 2. Si non-connecté et plus long que l'aperçu gratuit, on bloque l'image suivante !
        let sectionBloqueeHtml = '';
        if (!estConnecte && chapitre.pages.length > maximumVuesLibres) {
            const imageBloqueeType = chapitre.pages[maximumVuesLibres];
            sectionBloqueeHtml = `
                <div class="paywall-container" style="position:relative; overflow:hidden; width:100%;">
                    <img class="webtoon-page" src="${imageBloqueeType}" style="filter: blur(12px) brightness(0.5); transform: scale(1.05); width:100%; display:block; pointer-events:none;">
                    
                    <div class="paywall-overlay" style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; flex-direction:column; justify-content:center; align-items:center; background: linear-gradient(to bottom, rgba(15,16,20,0.5), rgba(15,16,20,1) 80%); text-align:center; padding: 40px;">
                        
                        <h2 style="font-size: 2.8rem; margin-bottom: 15px; color:white; font-weight:800; text-transform:uppercase;">Fin de l'aperçu gratuit</h2>
                        <p style="font-size: 1.25rem; color:#d0d0d0; margin-bottom:30px; max-width:550px; line-height:1.5;">
                            Vous êtes captivé par <strong>${projet.titre}</strong> ?<br>Soutenez le studio et débloquez la suite immédiatement en rejoignant la communauté !
                        </p>
                        
                        <a href="/inscription" data-link class="btn-primary" style="font-size:1.3rem; padding: 16px 45px; box-shadow: 0 10px 25px rgba(229,9,20,0.4); text-transform:uppercase; font-weight:800; border-radius:4px;">M'inscrire gratuitement</a>
                        
                        <p style="margin-top: 30px; font-size: 1rem; color: #888;">
                            Vous avez déjà un compte ? <a href="/connexion" data-link style="color:white; text-decoration:none; font-weight:bold;">Se connecter</a>
                        </p>
                    </div>
                </div>
            `;
        }
        
        // Si tout le document a été lu
        const footerComplet = estConnecte || (chapitre.pages.length <= maximumVuesLibres) ? `
            <div class="reader-footer" style="padding: 60px 4%; text-align: center; background: #08080a;">
                <div style="font-size: 1.2rem; margin-bottom: 20px;">Fin du chapitre.</div>
                <a href="/projet/${projet.id}" data-link class="btn-primary">Retour à la Sélection</a>
            </div>
        ` : '';

        const formComment = estConnecte ? `
            <div style="display:flex; align-items:center; gap:15px;">
                <form id="form-live-comment" style="display:flex; align-items:center; gap:8px;">
                    <input type="text" id="live-comment-input" placeholder="Soutenir (Abonné VIP)..." maxlength="60" style="background:rgba(255,255,255,0.1); border:1px solid #444; border-radius:20px; padding:6px 15px; color:white; font-size:0.85rem; outline:none; text-transform:lowercase; width:180px;" required>
                    <button type="submit" style="background:none; border:none; color:var(--primary); font-weight:bold; cursor:pointer;">POSTER</button>
                </form>
                <button id="toggle-comments" style="background:none; border:none; font-size:1.3rem; cursor:pointer;" title="Désactiver les commentaires transparents">💬</button>
            </div>
        ` : `
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="font-size:0.8rem; color:#888; font-style:italic;">Abonnement requis pour commenter.</span>
                <button id="toggle-comments" class="btn-secondary" style="background:transparent; border:none; padding:5px;"><span class="material-symbols-outlined">chat</span></button>
            </div>
        `;

        return `
            <div class="webtoon-reader" style="background:var(--bg-dark); position:relative;">
                
                <!-- OVERLAY COMMENTAIRES TRANSPARENTS -->
                <div id="comments-overlay" style="position:fixed; top:120px; left:0; right:0; bottom:80px; pointer-events:none; z-index:45; overflow:hidden;"></div>

                <div class="reader-toolbar" style="position:sticky; top:70px; display:flex; justify-content:space-between; align-items:center; padding:10px 15px; background:rgba(15,16,20,0.95); z-index:50; border-bottom:1px solid #222;">
                    <div style="flex:1;"><a href="/projet/${projet.id}" data-link class="btn-back">⬅ Détails</a></div>
                    <div style="flex:2; text-align:center;"><span class="reader-title" style="font-size:0.95rem;"><strong>Ch.${chapitre.ordre}</strong> - ${projet.titre}</span></div>
                    <div style="flex:1; display:flex; justify-content:flex-end;">
                        ${formComment}
                    </div>
                </div>
                
                <div class="reader-content" style="max-width:800px; margin:0 auto; width:100%; box-shadow:0 0 50px rgba(0,0,0,0.8); position:relative; z-index:10;">
                    ${pagesVisibles.length > 0 ? pagesVisibles : '<div style="padding:100px;text-align:center;">Désolé, aucune image à charger.</div>'}
                    ${sectionBloqueeHtml}
                </div>
                
                <div style="background:#08080a; border-top:1px solid #222; text-align:center; padding:80px 4% 100px; margin-top:0; z-index:20; position:relative;">
                    <span class="material-symbols-outlined" style="font-size:3.5rem; color:var(--primary); margin-bottom:15px; display:inline-block;">volunteer_activism</span>
                    <h2 style="font-size:2.2rem; font-family:'Outfit', sans-serif; color:white; margin-bottom:15px;">Soutenez le Créateur !</h2>
                    <p style="color:#aaa; font-size:1.1rem; line-height:1.6; max-width:600px; margin:0 auto 30px;">
                        Les webtoons indépendants existent grâce à vous. Si vous avez vibré avec ce chapitre, laissez un pourboire pour financer la suite de l'aventure !
                    </p>
                    <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                        <button class="btn-primary" onclick="alert('Simulation Stripe : Paiement Unique (3€) validé.')" style="background:#e50914; border:none; padding:15px 30px; font-size:1.1rem; display:flex; align-items:center; gap:10px;"><span class="material-symbols-outlined">local_cafe</span> Offrir un Café (3€)</button>
                        <a href="/vip" data-link class="btn-secondary" style="border-color:#eab308; color:#eab308!important; background:rgba(234,179,8,0.1); padding:15px 30px; font-size:1.1rem; display:flex; align-items:center; gap:10px;"><span class="material-symbols-outlined">stars</span> Rejoindre le Club VIP</a>
                    </div>
                </div>
                
                ${footerComplet}
            </div>
        `;
    }
}
