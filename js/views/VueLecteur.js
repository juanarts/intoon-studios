import I18n from '../utils/I18n.js';

export default class VueLecteur {
    
    static rendreLecteur(projet, chapitre, estConnecte = false, user = null, estDebloque = true) {
        if (!chapitre) {
            return `<div class="lecteur-error"><h2>${I18n.t('reader_not_found')}</h2><a href="/" data-link class="btn-primary">${I18n.t('reader_btn_back')}</a></div>`;
        }

        // Si le chapitre n'est pas débloqué (Fast Pass requis et non-VIP et non-acheté)
        // On montre seulement la 1ère image (Teaser)
        const imagesAPrelever = estDebloque ? chapitre.pages.length : 1;
        
        // Format HORIZONTAL cinématique
        const pagesVisibles = chapitre.pages.slice(0, imagesAPrelever).map((url, index) => `
            <div class="reader-slide" data-index="${index}" style="
                width: 100%;
                background: #000;
                position: relative;
                flex-shrink: 0;
                margin: 0;
                padding: 0;
                line-height: 0;
                font-size: 0;
            ">
                <img 
                    class="webtoon-page-horizontal ${index >= 2 ? 'lazy-image' : ''}" 
                    ${index < 2 ? `src="${url}"` : `data-src="${url}"`}
                    alt="${I18n.t('reader_page')} ${index + 1}"
                    style="
                        width: 100%;
                        height: auto;
                        display: block;
                        vertical-align: top;
                        user-select: none;
                        -webkit-user-drag: none;
                        margin: 0 0 -1px 0;
                        padding: 0;
                        border: none;
                    "
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
                ">${index + 1} / ${chapitre.pages.length}</div>
            </div>
        `).join('');

        // Paywall Fast Pass
        let sectionBloqueeHtml = '';
        if (!estDebloque) {
            const imgBloquee = chapitre.pages[1] || chapitre.pages[0]; // Image 2 floutée
            
            let messagePaywall = '';
            if (!estConnecte) {
                messagePaywall = `
                    <h2 style="font-size:2.5rem; color:white; margin-bottom:15px; font-family:'Outfit',sans-serif;">Chapitre Restreint</h2>
                    <p style="color:#aaa; font-size:1.1rem; margin-bottom:30px; max-width:450px; line-height:1.6;">Pour lire la suite de cette œuvre, vous devez créer un compte.</p>
                    <a href="/inscription" data-link class="btn-primary" style="font-size:1.2rem; padding:15px 40px;">S'inscrire gratuitement</a>
                    <a href="/connexion" data-link style="color:#aaa; margin-top:15px; font-size:0.9rem;">Déjà membre ? Se connecter</a>
                `;
            } else {
                messagePaywall = `
                    <div style="background:rgba(234, 179, 8, 0.1); border:1px solid #eab308; padding:5px 15px; border-radius:20px; color:#eab308; font-weight:800; font-size:0.8rem; letter-spacing:2px; margin-bottom:15px; text-transform:uppercase;">Exclusivité Fast Pass</div>
                    <h2 style="font-size:2.5rem; color:white; margin-bottom:15px; font-family:'Outfit',sans-serif;">Débloquez ce Chapitre</h2>
                    <p style="color:#aaa; font-size:1.1rem; margin-bottom:30px; max-width:450px; line-height:1.6;">Ce chapitre est en accès anticipé. Débloquez-le immédiatement avec <strong style="color:#eab308">50 Pièces</strong> ou abonnez-vous au grade Membre VIP pour un accès illimité !</p>
                    
                    <button id="btn-unlock-fastpass" class="btn-primary" style="font-size:1.2rem; padding:15px 40px; background:#eab308; color:black; border:none; display:flex; align-items:center; gap:10px; font-weight:bold; cursor:pointer; box-shadow:0 0 20px rgba(234,179,8,0.4);">
                        <span class="material-symbols-outlined">toll</span> DÉBLOQUER - 50 COINS
                    </button>
                    
                    <a href="/vip" data-link style="color:#aaa; margin-top:20px; font-size:0.9rem; text-decoration:underline;">Devenir Membre VIP</a>
                `;
            }

            sectionBloqueeHtml = `
                <div class="reader-slide" style="width:100%; min-height:90vh; display:flex; justify-content:center; align-items:center; background:#000; position:relative; flex-shrink:0;">
                    <img src="${imgBloquee}" style="max-width:1400px; width:100%; height:auto; filter:blur(24px) brightness(0.25); pointer-events:none;">
                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:40px;">
                        <span class="material-symbols-outlined" style="font-size:4.5rem; color:${estConnecte ? '#eab308' : 'var(--primary)'}; margin-bottom:20px;">lock</span>
                        ${messagePaywall}
                    </div>
                </div>
            `;
        }

        // Chapitre suivant + Espace Commentaires
        const chapSuivant = projet.chapitres.find(c => c.ordre === chapitre.ordre + 1);
        const footerHtml = `
            <div class="reader-slide" style="width:100%; min-height:60vh; display:flex; flex-direction:column; justify-content:flex-start; align-items:center; background:#08080a; flex-shrink:0; padding:60px 20px;">
                
                <span class="material-symbols-outlined" style="font-size:3rem; color:var(--primary); margin-bottom:15px;">check_circle</span>
                <h2 style="font-size:2rem; color:white; font-family:'Outfit',sans-serif; margin-bottom:25px;">${I18n.t('reader_end_ch')} ${chapitre.ordre}</h2>
                <div style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center; margin-bottom:50px;">
                    ${chapSuivant 
                        ? `<a href="/lire/${projet.id}/${chapSuivant.id}" data-link class="btn-primary" style="font-size:1.1rem; display:flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">skip_next</span> ${I18n.t('chapter')} ${chapSuivant.ordre}</a>`
                        : `<span style="color:#666; font-style:italic;">${I18n.t('reader_no_more_ch')}</span>`
                    }
                    <a href="/projet/${projet.slug}" data-link class="btn-secondary" style="font-size:1.1rem;">${I18n.t('reader_btn_back_serie')}</a>
                </div>

                <!-- NEW COMMENTS HTML -->
                <div id="section-chapitre-commentaires" style="width:100%; max-width:800px; text-align:left; background:rgba(255,255,255,0.02); padding:30px; border-radius:12px; border:1px solid #111;">
                    <h3 style="color:white; margin-bottom:20px; font-family:'Outfit',sans-serif; border-bottom:1px solid #222; padding-bottom:10px; display:flex; align-items:center; gap:10px;">
                        <span class="material-symbols-outlined">forum</span> Espace Communauté
                    </h3>
                    
                    ${estConnecte ? `
                    <form id="form-chapitre-comment" style="display:flex; gap:10px; margin-bottom:30px;">
                        <input type="text" id="chapitre-comment-input" placeholder="Partagez votre avis sur ce chapitre (+5 XP)..." required style="flex:1; background:rgba(255,255,255,0.05); border:1px solid #333; padding:12px; border-radius:8px; color:white; outline:none; transition: border 0.3s;" onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#333'">
                        <button type="submit" class="btn-primary" style="padding:0 25px; border-radius:8px;">Publier</button>
                    </form>
                    ` : `
                    <div style="background:rgba(255,255,255,0.03); padding:20px; text-align:center; border-radius:8px; margin-bottom:30px; border:1px solid #222;">
                        <p style="color:#aaa; margin-bottom:10px;">Connectez-vous pour rejoindre la discussion et gagner de l'XP.</p>
                        <a href="/connexion" data-link class="btn-secondary" style="font-size:0.9rem;">Se connecter</a>
                    </div>
                    `}
                    
                    <div id="chapitre-comments-list" style="display:flex; flex-direction:column; gap:20px;">
                        <div style="color:#666; text-align:center; font-style:italic;">Chargement des commentaires...</div>
                    </div>
                </div>

            </div>
        `;

        const formComment = estConnecte ? `
            <form id="form-live-comment" style="display:flex; align-items:center; gap:8px;">
                <input type="text" id="live-comment-input" placeholder="${I18n.t('reader_comment_placeholder')}" maxlength="60" style="background:rgba(255,255,255,0.08); border:1px solid #333; border-radius:20px; padding:6px 14px; color:white; font-size:0.8rem; outline:none; text-transform:lowercase; width:150px;" required>
                <button type="submit" style="background:none; border:none; color:var(--primary); font-weight:bold; cursor:pointer; font-size:0.8rem;">OK</button>
            </form>
        ` : `<a href="/connexion" data-link style="color:#666; font-size:0.8rem;">${I18n.t('reader_login_react')}</a>`;

        return `
            <div class="webtoon-reader" style="background:#000; position:relative; overflow:hidden;">

                <!-- OVERLAY COMMENTAIRES TRANSPARENTS -->
                <div id="comments-overlay" style="position:fixed; top:40px; left:0; right:0; bottom:80px; pointer-events:none; z-index:45; overflow:hidden;"></div>

                <!-- BARRE NETFLIX COLLANTE (haut) -->
                <div class="reader-toolbar" style="position:fixed; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%); z-index:100; transition:opacity 0.4s;" id="reader-topbar">
                    <a href="/projet/${projet.slug}" data-link style="color:white; text-decoration:none; display:flex; align-items:center; gap:6px; opacity:0.7; font-size:0.9rem;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                        <span class="material-symbols-outlined" style="font-size:1.2rem;">arrow_back</span>
                    </a>
                    <span style="font-size:0.9rem; color:rgba(255,255,255,0.7); font-family:'Outfit',sans-serif; letter-spacing:1px; text-align:center;">
                        Ch.<strong>${chapitre.ordre}</strong> — ${projet.titre}
                        <div style="font-size:0.75rem; margin-top:2px;"><a href="/profil/${projet.authorPseudo}" data-link style="color:var(--primary); text-decoration:none; opacity:0.8;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">${I18n.t('by') || 'Par'} ${projet.authorPseudo}</a></div>
                    </span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${formComment}
                        <button id="toggle-comments" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; padding:4px;" title="Commentaires">
                            <span class="material-symbols-outlined" style="font-size:1.2rem;">chat</span>
                        </button>
                    </div>
                </div>

                <!-- CONTAINER SLIDES VERTICAL (scroll classique entre les planches) -->
                <div id="reader-slides-container" style="width:100%; position:relative; background:#000; display:flex; flex-direction:column; gap:0;">
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
                    " title="${I18n.t('reader_scroll_speed')}">
                    
                    <div style="width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>

                    <!-- Stop (retour début) -->
                    <button id="btn-stop" title="${I18n.t('reader_btn_restart')}" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:6px; border-radius:50%; transition:all 0.2s; display:flex;">
                        <span class="material-symbols-outlined" style="font-size:1.3rem;">stop</span>
                    </button>

                    <!-- Play / Pause -->
                    <button id="btn-play-pause" title="${I18n.t('reader_btn_autoplay')}" style="background:white; border:none; color:#000; cursor:pointer; padding:10px; border-radius:50%; transition:all 0.2s; display:flex; box-shadow:0 2px 12px rgba(255,255,255,0.2);">
                        <span class="material-symbols-outlined" id="play-icon" style="font-size:1.5rem;">play_arrow</span>
                    </button>

                    <!-- Chapitre suivant -->
                    ${chapSuivant 
                        ? `<a href="/lire/${projet.id}/${chapSuivant.id}" data-link title="${I18n.t('reader_btn_next_ch')}" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:6px; border-radius:50%; display:flex; text-decoration:none;">
                            <span class="material-symbols-outlined" style="font-size:1.3rem;">skip_next</span>
                        </a>`
                        : `<button disabled style="background:none; border:none; color:rgba(255,255,255,0.2); padding:6px; cursor:not-allowed; display:flex;">
                            <span class="material-symbols-outlined" style="font-size:1.3rem;">skip_next</span>
                        </button>`
                    }

                    <div style="width:1px; height:20px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>

                    <!-- Plein écran -->
                    <button id="btn-fullscreen" title="${I18n.t('reader_btn_fullscreen')}" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; padding:6px; display:flex;">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">fullscreen</span>
                    </button>
                </div>

            </div>
        `;
    }
}
