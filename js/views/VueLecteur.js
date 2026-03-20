export default class VueLecteur {
    
    static rendreLecteur(projet, chapitre, estConnecte = false) {
        if (!chapitre) {
            return `<div class="lecteur-error"><h2>Chapitre introuvable.</h2><a href="/" data-link class="btn-primary">Retour</a></div>`;
        }

        const maximumVuesLibres = estConnecte ? 9999 : 2;
        const imagesAPrelever = Math.min(chapitre.pages.length, maximumVuesLibres);
        
        // Format HORIZONTAL cinématique : 1 planche = 1 slide plein écran
        const pagesVisibles = chapitre.pages.slice(0, imagesAPrelever).map((url, index) => `
            <div class="reader-slide" data-index="${index}" style="
                width: 100%;
                background: #000;
                position: relative;
                flex-shrink: 0;
                margin: 0;
                padding: 0;
                line-height: 0;
            ">
                <img 
                    class="webtoon-page-horizontal" 
                    src="${url}" 
                    alt="Planche ${index + 1}"
                    style="
                        width: 100%;
                        height: auto;
                        display: block;
                        user-select: none;
                        -webkit-user-drag: none;
                    "
                    loading="${index < 2 ? 'eager' : 'lazy'}"
                >

                <div class="slide-number" style="
                    position: absolute;
                    bottom: 18px;
                    right: 24px;
                    color: rgba(255,255,255,0.25);
                    font-size: 0.8rem;
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: 2px;
                    pointer-events:none;
                ">${index + 1} / ${imagesAPrelever}</div>
            </div>
        `).join('');

        // Paywall flou si non-connecté
        let sectionBloqueeHtml = '';
        if (!estConnecte && chapitre.pages.length > maximumVuesLibres) {
            const imgBloquee = chapitre.pages[maximumVuesLibres];
            sectionBloqueeHtml = `
                <div class="reader-slide" style="width:100%; min-height:90vh; display:flex; justify-content:center; align-items:center; background:#000; position:relative; flex-shrink:0;">
                    <img src="${imgBloquee}" style="max-width:1400px; width:100%; height:auto; filter:blur(16px) brightness(0.35); pointer-events:none;">
                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:40px;">
                        <span class="material-symbols-outlined" style="font-size:4rem; color:var(--primary); margin-bottom:20px;">lock</span>
                        <h2 style="font-size:2.5rem; color:white; margin-bottom:15px; font-family:'Outfit',sans-serif;">Fin de l'aperçu gratuit</h2>
                        <p style="color:#aaa; font-size:1.1rem; margin-bottom:30px; max-width:450px; line-height:1.6;">Inscrivez-vous gratuitement pour lire la suite de <strong>${projet.titre}</strong>.</p>
                        <a href="/inscription" data-link class="btn-primary" style="font-size:1.2rem; padding:15px 40px;">M'inscrire gratuitement</a>
                        <a href="/connexion" data-link style="color:#aaa; margin-top:15px; font-size:0.9rem;">Déjà un compte ? Se connecter</a>
                    </div>
                </div>
            `;
        }

        // Chapitre suivant
        const chapSuivant = projet.chapitres.find(c => c.ordre === chapitre.ordre + 1);
        const footerHtml = `
            <div class="reader-slide" style="width:100%; min-height:60vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#08080a; flex-shrink:0; gap:25px;">
                <span class="material-symbols-outlined" style="font-size:3rem; color:var(--primary);">check_circle</span>
                <h2 style="font-size:2rem; color:white; font-family:'Outfit',sans-serif;">Fin du Chapitre ${chapitre.ordre}</h2>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">
                    ${chapSuivant 
                        ? `<a href="/lire/${projet.id}/${chapSuivant.id}" data-link class="btn-primary" style="font-size:1.1rem; display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">skip_next</span> Chapitre ${chapSuivant.ordre}</a>`
                        : `<span style="color:#666; font-style:italic;">Dernier chapitre disponible — revenez bientôt !</span>`
                    }
                    <a href="/projet/${projet.slug}" data-link class="btn-secondary" style="font-size:1.1rem;">Retour à la série</a>
                </div>
            </div>
        `;

        const formComment = estConnecte ? `
            <form id="form-live-comment" style="display:flex; align-items:center; gap:8px;">
                <input type="text" id="live-comment-input" placeholder="Réagir..." maxlength="60" style="background:rgba(255,255,255,0.08); border:1px solid #333; border-radius:20px; padding:6px 14px; color:white; font-size:0.8rem; outline:none; text-transform:lowercase; width:150px;" required>
                <button type="submit" style="background:none; border:none; color:var(--primary); font-weight:bold; cursor:pointer; font-size:0.8rem;">OK</button>
            </form>
        ` : `<a href="/connexion" data-link style="color:#666; font-size:0.8rem;">Connexion pour réagir</a>`;

        return `
            <div class="webtoon-reader" style="background:#000; position:relative; overflow:hidden;">

                <!-- OVERLAY COMMENTAIRES TRANSPARENTS -->
                <div id="comments-overlay" style="position:fixed; top:120px; left:0; right:0; bottom:80px; pointer-events:none; z-index:45; overflow:hidden;"></div>

                <!-- BARRE NETFLIX COLLANTE (haut) -->
                <div class="reader-toolbar" style="position:fixed; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%); z-index:100; transition:opacity 0.4s;" id="reader-topbar">
                    <a href="/projet/${projet.slug}" data-link style="color:white; text-decoration:none; display:flex; align-items:center; gap:6px; opacity:0.7; hover:opacity:1; font-size:0.9rem;">
                        <span class="material-symbols-outlined" style="font-size:1.2rem;">arrow_back</span>
                    </a>
                    <span style="font-size:0.9rem; color:rgba(255,255,255,0.7); font-family:'Outfit',sans-serif; letter-spacing:1px; text-align:center;">
                        Ch.<strong>${chapitre.ordre}</strong> — ${projet.titre}
                        <div style="font-size:0.75rem; margin-top:2px;"><a href="/profil/${projet.authorPseudo}" data-link style="color:var(--primary); text-decoration:none; opacity:0.8; hover:opacity:1;">par ${projet.authorPseudo}</a></div>
                    </span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${formComment}
                        <button id="toggle-comments" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; padding:4px;" title="Commentaires"><span class="material-symbols-outlined" style="font-size:1.2rem;">chat</span></button>
                    </div>
                </div>

                <!-- CONTAINER SLIDES VERTICAL (scroll classique entre les planches) -->
                <div id="reader-slides-container" style="width:100%; position:relative;">
                    ${pagesVisibles}
                    ${sectionBloqueeHtml}
                    ${!sectionBloqueeHtml ? footerHtml : ''}
                </div>

                <!-- BARRE DE CONTRÔLES NETFLIX (bas, fixe) -->
                <div id="netflix-controls" style="
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(15,15,20,0.85);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 10px 20px;
                    border-radius: 50px;
                    z-index: 100;
                    transition: opacity 0.4s, transform 0.4s;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
                ">
                    <!-- Règle de vitesse -->
                    <span class="material-symbols-outlined" style="font-size:1rem; color:rgba(255,255,255,0.4);">speed</span>
                    <input type="range" id="scroll-speed" min="1" max="10" value="3" style="
                        width: 70px;
                        accent-color: var(--primary);
                        cursor: pointer;
                        background: transparent;
                    " title="Vitesse de défilement">
                    
                    <div style="width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>

                    <!-- Stop (retour début) -->
                    <button id="btn-stop" title="Redémarrer" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:6px; border-radius:50%; transition:all 0.2s; display:flex;">
                        <span class="material-symbols-outlined" style="font-size:1.3rem;">stop</span>
                    </button>

                    <!-- Play / Pause -->
                    <button id="btn-play-pause" title="Lecture automatique" style="background:white; border:none; color:#000; cursor:pointer; padding:10px; border-radius:50%; transition:all 0.2s; display:flex; box-shadow:0 2px 12px rgba(255,255,255,0.2);">
                        <span class="material-symbols-outlined" id="play-icon" style="font-size:1.5rem;">play_arrow</span>
                    </button>

                    <!-- Chapitre suivant -->
                    ${chapSuivant 
                        ? `<a href="/lire/${projet.id}/${chapSuivant.id}" data-link title="Chapitre suivant" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:6px; border-radius:50%; display:flex; text-decoration:none;">
                            <span class="material-symbols-outlined" style="font-size:1.3rem;">skip_next</span>
                        </a>`
                        : `<button disabled style="background:none; border:none; color:rgba(255,255,255,0.2); padding:6px; cursor:not-allowed; display:flex;">
                            <span class="material-symbols-outlined" style="font-size:1.3rem;">skip_next</span>
                        </button>`
                    }

                    <div style="width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>

                    <!-- Plein écran -->
                    <button id="btn-fullscreen" title="Plein écran TV" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; padding:6px; display:flex;">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">fullscreen</span>
                    </button>
                </div>

            </div>
        `;
    }
}
