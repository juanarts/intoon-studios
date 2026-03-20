import Reviews from '../models/Reviews.js';
import Auth from '../models/Auth.js';
import Security from '../utils/Security.js';

export default class VueCatalogue {
    
    static genererDrapeaux(langues) {
        if (!langues || langues.length === 0) return '🇫🇷';
        const mapDrapeaux = { 'fr': '🇫🇷', 'en': '🇬🇧', 'es': '🇪🇸', 'jp': '🇯🇵' };
        return langues.map(l => mapDrapeaux[l] || '🏳️').join(' ');
    }
    
    static rendreCatalogue(projets, projetsLab, projetEnCours = null, chapitreEnCours = null) {
        if (!projets || projets.length === 0) return `<h1 class="page-title">C'est bien vide ici...</h1>`;
        
        // 3 premiers projets pour le Carousel Hero
        const heroSlides = projets.slice(0, Math.min(3, projets.length)); 
        const autresProjets = projets; // Afficher tout dans Top Tendances

        const heroHtml = `
            <div class="projet-hero" style="position:relative; overflow:hidden;">
                ${heroSlides.map((projet, idx) => {
                    const statsHero = Reviews.getMoyenne(projet.id);
                    let btnLireHero = "";
                    if (projet.chapitres && projet.chapitres.length > 0) {
                        const premierCh = projet.chapitres.find(ch => ch.ordre === 1) || projet.chapitres[0];
                        btnLireHero = `<a href="/lire/${projet.id}/${premierCh.id}" data-link class="btn-primary" style="margin-right:15px; font-size:1.1rem; background:white; color:black!important; border:none;"><span class="material-symbols-outlined">play_arrow</span> Lecture</a>`;
                    } else {
                        btnLireHero = `<span style="color:var(--text-muted); padding:12px 0; margin-right:15px; font-weight:bold;">Prochainement...</span>`;
                    }
                    
                    // Génération intelligente selon le type de média
                    let mediaHtml;
                    if (!projet.videoPromoUrl) {
                        mediaHtml = `<img class="projet-trailer-fallback" src="${projet.couverture}" alt="${projet.titre}" style="width:100%; height:100%; object-fit:cover; animation: slowZoom 12s alternate infinite;">`;
                    } else if (projet.videoPromoUrl.includes('youtube.com') || projet.videoPromoUrl.includes('youtu.be')) {
                        const ytId = projet.videoPromoUrl.includes('youtu.be')
                            ? projet.videoPromoUrl.split('youtu.be/')[1].split('?')[0]
                            : (projet.videoPromoUrl.split('v=')[1] || '').split('&')[0];
                        mediaHtml = `<div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;">
                            <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&playsinline=1&rel=0"
                                frameborder="0" allow="autoplay; encrypted-media"
                                style="width:100%;height:140%;object-fit:cover;transform:translateY(-12%);pointer-events:none;">
                            </iframe></div>`;
                    } else if (projet.videoPromoUrl.includes('vimeo.com')) {
                        const vimeoId = projet.videoPromoUrl.split('vimeo.com/')[1].split('?')[0];
                        mediaHtml = `<div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;">
                            <iframe src="https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0"
                                frameborder="0" allow="autoplay; fullscreen"
                                style="width:100%;height:100%;object-fit:cover;pointer-events:none;">
                            </iframe></div>`;
                    } else {
                        mediaHtml = `<video class="projet-trailer hero-video" playsinline muted loop autoplay style="width:100%;height:100%;object-fit:cover;" data-index="${idx}"><source src="${projet.videoPromoUrl}" type="video/mp4"></video>`;
                    }


                    return `
                        <div class="hero-slide" data-index="${idx}" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:${idx===0?1:0}; transition:opacity 1s cubic-bezier(0.19, 1, 0.22, 1); z-index:${idx===0?5:1};">
                            ${mediaHtml}
                            <div class="hero-overlay"></div>
                            <div class="hero-content">
                                <h1>${projet.titre}</h1>
                                <div style="margin-bottom:25px; display:flex; gap:15px; align-items:center;">
                                    <span style="font-size:1.2rem;">${Reviews.genererEtoilesHTML(statsHero.moyenne)}</span>
                                    <span style="color:#aaa; font-weight:bold;">${statsHero.moyenne}/5 (${statsHero.total} avis)</span>
                                </div>
                                <p class="description">${projet.description}</p>
                                <div class="hero-actions">
                                    ${btnLireHero}
                                    <a href="/projet/${projet.slug}" data-link class="btn-secondary" style="font-size:1.1rem; border:none;"><span class="material-symbols-outlined">info</span> Plus d'infos</a>
                                    <button class="btn-secondary btn-cast-tv" style="font-size:1.1rem; border:none; background:rgba(255,255,255,0.1); margin-left:10px;"><span class="material-symbols-outlined">cast</span> TV</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
                
                <!-- Indicateurs de Carousel (Dots) -->
                <div class="hero-dots" style="position:absolute; bottom:30px; left:4%; display:flex; gap:12px; z-index:50;">
                    ${heroSlides.map((_, idx) => `<span class="dot" data-index="${idx}" style="width:10px; height:10px; border-radius:50%; background:${idx === 0 ? 'white' : 'rgba(255,255,255,0.3)'}; cursor:pointer; transition:background 0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.8);"></span>`).join('')}
                </div>
            </div>
        `;
        
        // Ranking added to grid ! (Stitch inspiration)
        const grille = autresProjets.map((projet, index) => `
            <div class="projet-card group">
                <a href="/projet/${projet.slug}" data-link class="projet-link">
                    <img class="projet-cover" src="${projet.couverture}" alt="Couverture de ${projet.titre}">
                    <div class="badge-ranking">#${index + 1}</div>
                    <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.8); border:1px solid ${projet.pegi==='18+' ? 'red' : projet.pegi==='16+' ? 'orange' : '#555'}; color:white; padding:3px 6px; border-radius:var(--radius-badge); font-weight:bold; font-size:0.75rem; z-index:5;">${projet.pegi || 'TP'}</div>
                    <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.8); padding:3px 6px; border-radius:var(--radius-badge); font-size:0.9rem; z-index:5;">${VueCatalogue.genererDrapeaux(projet.langues)}</div>
                    <div class="projet-info">
                        <h3>${projet.titre}</h3>
                        <p>Studio Original • Nouveaux Chapitres</p>
                    </div>
                </a>
            </div>
        `).join('');

        let repriseHtml = '';
        if (projetEnCours && chapitreEnCours) {
            repriseHtml = `
                <div style="position:relative; z-index:10; margin-top:-35px; margin-bottom: 20px;">
                    <h2 class="page-title" style="font-size:1.5rem; color:#fff; display:flex; align-items:center; gap:10px;">
                        <span class="material-symbols-outlined" style="color:var(--primary); font-size:1.8rem;">play_circle</span> Reprendre la lecture
                    </h2>
                    <div class="catalogue-grid" style="padding-bottom:10px; padding-top:0;">
                        <div class="projet-card" style="box-shadow: 0 5px 25px rgba(229,9,20,0.25); border: 1px solid rgba(229,9,20,0.4); max-width:280px;">
                            <a href="/lire/${projetEnCours.id}/${chapitreEnCours.id}" data-link class="projet-link">
                                <img class="projet-cover" src="${projetEnCours.couverture}" alt="${projetEnCours.titre}" style="filter: brightness(0.7);">
                                <div class="projet-info" style="opacity:1; background:linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0.6) 100%); bottom:0; padding:15px; transform:none;">
                                    <div style="color:var(--primary); font-size:0.8rem; font-weight:800; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px; font-family:'Outfit', sans-serif;">En cours</div>
                                    <h3 style="font-size:1.1rem;">${projetEnCours.titre}</h3>
                                    <p style="font-size:0.85rem; color:#aaa; margin-top:5px; margin-bottom:12px;">Chapitre ${chapitreEnCours.ordre} : ${chapitreEnCours.titre}</p>
                                    <div style="height:4px; width:100%; background:#333; border-radius:2px; overflow:hidden;">
                                        <div style="width:40%; height:100%; background:var(--primary);"></div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        const othersHtml = autresProjets.length > 0 
            ? `<h2 class="page-title" style="margin-top: ${projetEnCours ? '10px' : '-30px'}; position:relative; z-index:10; font-size:1.5rem; color:#e5e5e5;">Top Tendances <span class="material-symbols-outlined" style="color:orange; font-size:1.2rem; vertical-align:middle;">local_fire_department</span></h2>
               <div class="catalogue-grid" style="position:relative; z-index:10;">${grille}</div>`
            : '';

        const grilleLab = projetsLab && projetsLab.length > 0 ? `
            <div style="margin-top:70px; margin-bottom:50px; position:relative; z-index:10; background:rgba(16,25,34,0.4); border:1px solid rgba(255,255,255,0.05); padding:40px; border-radius:16px;">
                <h2 style="font-size:2rem; margin-bottom:10px; color:white; display:flex; align-items:center; gap:10px; font-family:'Outfit', sans-serif;">
                    <span class="material-symbols-outlined" style="font-size:2.5rem; color:#258cf4;">experiment</span> INTOON LAB
                </h2>
                <p style="color:#aaa; font-size:1.1rem; margin-top:0; margin-bottom:30px;">Découvrez les pitchs et brouillons des créateurs. Le Studio de la communauté : Notez, commentez et décidez des prochaines productions originales !</p>
                
                <div class="catalogue-grid" style="padding:0;">
                    ${projetsLab.map((projet, idx) => `
                        <div class="projet-card" style="border:1px dashed #555;">
                            <a href="/projet/${projet.slug}" data-link class="projet-link">
                                <img class="projet-cover" src="${projet.couverture}" alt="${projet.titre}" style="filter:grayscale(0.6) brightness(0.7);">
                                <div style="position:absolute; top:8px; left:8px; background:rgba(255,255,255,0.9); color:black; font-weight:800; font-size:0.65rem; padding:4px 8px; border-radius:var(--radius-badge); text-transform:uppercase; letter-spacing:1px; z-index:5;">🎨 Concept / En Dév</div>
                                <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.8); border:1px solid ${projet.pegi==='18+' ? 'red' : projet.pegi==='16+' ? 'orange' : '#555'}; color:white; padding:3px 6px; border-radius:var(--radius-badge); font-weight:bold; font-size:0.75rem; z-index:5;">${projet.pegi || 'TP'}</div>
                                <div style="position:absolute; bottom:60px; right:6px; background:rgba(0,0,0,0.8); padding:3px 6px; border-radius:var(--radius-badge); font-size:0.9rem; z-index:5;">${VueCatalogue.genererDrapeaux(projet.langues)}</div>
                                <div class="projet-info">
                                    <h3>${projet.titre}</h3>
                                    <p>Soutien Communautaire Requis</p>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            ${heroHtml}
            ${repriseHtml}
            ${othersHtml}
            ${grilleLab}
        `;
    }

    static rendreDetailProjet(projet, estFavori = false, aLike = false, statsReviews = {moyenne:0, total:0}, listeReviews = [], estConnecte = false) {
        let btnLireHtml = "";
        const isBrouillon = projet.statut === 'brouillon';

        if (isBrouillon) {
            btnLireHtml = `<span class="badge" style="background:#555; color:white; padding:12px 25px; border-radius:var(--radius-pill); font-weight:bold; margin-right:15px; border:1px dashed #ccc; display:inline-flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">science</span> Projet en évaluation</span>`;
        } else if (projet.chapitres && projet.chapitres.length > 0) {
            const premierCh = projet.chapitres.find(ch => ch.ordre === 1) || projet.chapitres[0];
            btnLireHtml = `<a href="/lire/${projet.id}/${premierCh.id}" data-link class="btn-primary" style="margin-right:15px; background:white; color:black!important;"><span class="material-symbols-outlined">play_arrow</span> Lancer le Chapitre 1</a>`;
        } else {
            btnLireHtml = `<span class="badge" style="background:gray; color:white; padding:12px 25px; border-radius:var(--radius-pill); font-weight:bold; margin-right:15px; display:inline-flex; align-items:center; gap:8px;"><span class="material-symbols-outlined">schedule</span> Prochainement...</span>`;
        }

        let trailerHtml = `<img class="projet-trailer-fallback" src="${projet.couverture}" alt="Cover">`;
        if (projet.videoPromoUrl) {
            if (projet.videoPromoUrl.includes('youtube.com') || projet.videoPromoUrl.includes('youtu.be')) {
                const ytId = projet.videoPromoUrl.includes('youtu.be') 
                    ? projet.videoPromoUrl.split('youtu.be/')[1].split('?')[0] 
                    : projet.videoPromoUrl.split('v=')[1].split('&')[0];
                // FIX VIDEO FULL : La logique est maintenant dans style.css (.projet-trailer iframe)
                trailerHtml = `<div class="projet-trailer">
                    <iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0" 
                        frameborder="0" allow="autoplay; encrypted-media">
                    </iframe>
                </div>`;
            } else if (projet.videoPromoUrl.includes('vimeo.com')) {
                const vimeoId = projet.videoPromoUrl.split('vimeo.com/')[1].split('?')[0];
                trailerHtml = `<div class="projet-trailer" style="position:absolute; top:0; left:0; width:100%; height:100%;"><iframe src="https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0" frameborder="0" allow="autoplay; fullscreen" style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></iframe></div>`;
            } else {
                trailerHtml = `<video class="projet-trailer" autoplay loop muted playsinline><source src="${projet.videoPromoUrl}" type="video/mp4"></video>`;
            }
        }

        const etoilesHtml = Reviews.genererEtoilesHTML(statsReviews.moyenne);
        const currentUser = Auth.getUtilisateur();

        let formAvisHtml = estConnecte ? `
            <div style="background:rgba(16,25,34,0.4); padding:25px; border-radius:var(--radius-card); border:1px solid rgba(255,255,255,0.05); margin-bottom:30px;">
                <h3 style="margin-bottom:15px; color:white; font-size:1.2rem; font-family:'Outfit', sans-serif;">Laissez une note (Abonné)</h3>
                <form id="form-add-review" style="display:flex; flex-direction:column; gap:15px;">
                    <div>
                        <select id="review-note" style="padding:10px; background:#111; color:white; border:1px solid #444; border-radius:4px; font-size:1rem;" required>
                            <option value="">-- Choisir une note --</option>
                            <option value="5">⭐⭐⭐⭐⭐ Chef-d'œuvre (5/5)</option>
                            <option value="4">⭐⭐⭐⭐ Très bien (4/5)</option>
                            <option value="3">⭐⭐⭐ Sympa (3/5)</option>
                            <option value="2">⭐⭐ Bof (2/5)</option>
                            <option value="1">⭐ Déception (1/5)</option>
                        </select>
                    </div>
                    <textarea id="review-text" rows="3" placeholder="Qu'avez-vous pensé de cette œuvre ?" style="padding:15px; border-radius:12px; border:1px solid #333; background:#0a0a0d; color:white; font-size:0.95rem; resize:none; font-family:'Inter', sans-serif;" required></textarea>
                    <button type="submit" class="btn-primary" style="align-self:flex-end; border-radius:20px; padding:10px 25px;"><span class="material-symbols-outlined" style="font-size:1.1rem;">send</span> Publier</button>
                </form>
            </div>
        ` : `
            <div style="background:rgba(229,9,20,0.05); padding:20px; border-radius:var(--radius-card); border:1px dashed rgba(229,9,20,0.5); margin-bottom:30px; color:#aaa; text-align:center;">
                <p style="margin-bottom:15px;">⚠️ Connectez-vous pour publier un avis et soutenir le projet.</p>
                <a href="/connexion" data-link class="btn-primary" style="display:inline-flex;"><span class="material-symbols-outlined">lock_open</span> Me connecter</a>
            </div>
        `;

        const listeAvisHtml = listeReviews.length > 0 
            ? listeReviews.map(r => {
                const avatar = r.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${r.pseudo || 'User'}`;
                const pseudo = Security.escapeHTML(r.pseudo || (r.role === 'admin' ? 'Intoon Creator' : 'Abonné'));
                const isLiked = currentUser && r.likes && r.likes.includes(currentUser.id);
                const likeCount = r.likes ? r.likes.length : 0;
                const isOwner = currentUser && r.authorId === currentUser.id;
                
                let reponsesHtml = "";
                if (r.reponses && r.reponses.length > 0) {
                    reponsesHtml = `<div style="margin-left:45px; margin-top:10px; border-left:2px solid #333; padding-left:15px;">
                        ${r.reponses.map(rep => `
                            <div style="display:flex; gap:10px; margin-bottom:12px; font-size:0.85rem;">
                                <img src="${rep.avatar}" style="width:24px; height:24px; border-radius:50%;">
                                <div>
                                    <span style="font-weight:700; color:white; margin-right:5px;">${Security.escapeHTML(rep.pseudo)}</span>
                                    <span style="color:#efefef;">${Security.escapeHTML(rep.texte)}</span>
                                    <div style="font-size:0.7rem; color:#666; margin-top:2px;">${rep.date}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>`;
                }

                return `
                <div class="review-block" data-id="${r.id}" style="margin-bottom:25px; animation: fadeIn 0.4s ease;">
                    <div class="comment-insta" style="display:flex; gap:12px;">
                        <img src="${avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.1);">
                        <div style="flex:1;">
                            <div style="font-size:0.95rem; line-height:1.4;">
                                <span style="font-weight:700; color:white; margin-right:6px;">${pseudo}</span>
                                ${r.role === 'admin' ? '<span class="material-symbols-outlined" style="font-size:0.85rem; color:#e50914; vertical-align:middle; margin-right:4px;">verified</span>' : ''}
                                <span style="color:#efefef;" class="review-comment-text">${Security.escapeHTML(r.commentaire)}</span>
                                ${r.modifie ? '<span style="font-size:0.7rem; color:#555; margin-left:5px;">(modifié)</span>' : ''}
                            </div>
                            <div style="display:flex; align-items:center; gap:15px; margin-top:8px; font-size:0.75rem; color:#8e8e8e; font-weight:600;">
                                <span>${r.date}</span>
                                <span class="btn-review-like" style="cursor:pointer; color:${isLiked ? '#e50914' : '#8e8e8e'};">${likeCount > 0 ? likeCount + ' ' : ''}${isLiked ? 'Aimé' : 'J\'aime'}</span>
                                <span class="btn-review-repondre" style="cursor:pointer;">Répondre</span>
                                ${isOwner ? '<span class="btn-review-edit" style="cursor:pointer; color:var(--primary);">Modifier</span>' : ''}
                            </div>
                        </div>
                    </div>
                    ${reponsesHtml}
                </div>
              `}).join('')
            : '<p style="color:#666; font-style:italic; text-align:center; padding:20px;">Aucun avis pour le moment. Soyez le premier à commenter !</p>';

        return `
            <div class="projet-detail">
                <div class="projet-hero">
                    ${trailerHtml}
                    <!-- OVERLAY COMMENTAIRES FLOTTANTS NICONICO -->
                    <div id="project-comments-overlay" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:3; overflow:hidden;"></div>
                    
                    <div class="hero-overlay"></div>
                    <div class="hero-content">
                        ${isBrouillon ? '<span style="background:rgba(255,255,255,0.9); color:black; font-weight:900; font-size:0.8rem; padding:4px 10px; border-radius:var(--radius-badge); text-transform:uppercase; letter-spacing:1px; margin-bottom:15px; display:inline-block;">🎨 Concept en cours / Lab</span>' : ''}
                        <h1>${projet.titre}</h1>
                        <div style="margin-bottom:20px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
                            <span style="display:inline-block; border:1px solid ${projet.pegi==='18+' ? 'red' : projet.pegi==='16+' ? 'orange' : '#555'}; color:white; font-weight:bold; font-size:0.9rem; padding:3px 8px; border-radius:var(--radius-badge);">${projet.pegi || 'TP'}</span>
                            <span style="font-size:1.3rem; letter-spacing:5px;">${VueCatalogue.genererDrapeaux(projet.langues)}</span>
                            
                            <!-- Etoiles Visuelles -->
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:1.3rem;">${etoilesHtml}</span>
                                <span style="font-weight:bold; color:#aaa; font-size:1.1rem; font-family:'Be Vietnam Pro', sans-serif;">${statsReviews.moyenne}/5 <span style="font-size:0.9rem; font-weight:normal;">(${statsReviews.total} Avis)</span></span>
                            </div>
                        </div>

                        <p class="description">${projet.description}</p>
                        
                        <div class="hero-actions">
                            ${btnLireHtml}
                            <button class="btn-secondary btn-favori" data-projet-id="${projet.id}">
                                <span class="material-symbols-outlined">${estFavori ? 'bookmark_added' : 'bookmark_add'}</span>
                                ${estFavori ? 'Dans la liste' : 'En favori'}
                            </button>
                            <button class="btn-secondary btn-like" data-id="${projet.id}" style="border:1px solid ${aLike ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; color:${aLike ? 'var(--primary)' : 'white'};">
                                <span class="material-symbols-outlined">${aLike ? 'favorite' : 'favorite_border'}</span> 
                                <span class="like-count">${aLike ? (projet.likes || 0) + 1 : (projet.likes || 0)}</span>
                            </button>
                            
                            <!-- CTAs DE MONÉTISATION -->
                            <a href="/vip" data-link class="btn-secondary btn-soutenir" style="border-color:#eab308; color:#eab308!important; margin-left:15px; background:rgba(234,179,8,0.05); display:inline-flex; align-items:center; gap:8px;">
                                <span class="material-symbols-outlined">stars</span> Devenir Mécène
                            </a>
                        </div>
                    </div>
                </div>
                
                <div style="max-width:1200px; margin:0 auto; display:flex; gap:50px; flex-wrap:wrap; padding: 40px 4%;">
                    <div class="chapitres-list-container" style="flex:1.5; min-width:350px;">
                        <h2 style="margin-bottom:20px;">Chapitres Disponibles</h2>
                        <ul class="chapitres-list">
                            ${projet.chapitres.map(ch => `
                                <li>
                                    <a href="/lire/${projet.id}/${ch.id}" data-link>
                                        <span class="ch-num">${ch.ordre}</span>
                                        <span class="ch-titre">${ch.titre}</span>
                                        <span class="material-symbols-outlined" style="margin-left:auto; color:var(--text-muted);">arrow_forward_ios</span>
                                    </a>
                                </li>
                            `).join('')}
                            ${projet.chapitres.length === 0 ? '<li><span class="ch-titre" style="color:var(--text-muted)">Aucun chapitre disponible pour le moment...</span></li>' : ''}
                        </ul>
                    </div>
                    
                    <div style="flex:1; min-width:350px; padding-top:10px;">
                        <h2 style="font-size:1.5rem; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:10px; color:white; font-family:'Outfit', sans-serif;">Avis de la Communauté</h2>
                        ${formAvisHtml}
                        <div style="max-height:500px; overflow-y:auto; padding-right:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:20px;">
                            ${listeAvisHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
