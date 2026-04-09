import Projet from '../models/Projet.js';
import VueLecteur from '../views/VueLecteur.js';
import Auth from '../models/Auth.js';
import Historique from '../models/Historique.js';
import Commentaires from '../models/Commentaires.js';
import SEOManager from '../utils/SEOManager.js';

export default class LecteurController {
    
    // Moteur d'auto-scroll cinématique
    static scrollEngine = {
        active: false,
        speed: 1,          // Vitesse (1-10)
        rafId: null,
        accumulator: 0,    // Accumulation pixels fractionnaires (fix bug v=1)
        hidden: false,
        hideTimer: null,
        commentsPaused: false
    };

    static async lireChapitre(idProjet, idChapitre) {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader">Chargement du webtoon...</div>';

        // Reset du moteur entre navigations
        LecteurController.scrollEngine.active = false;
        LecteurController.scrollEngine.rafId = null;

        try {
            const projet = await Projet.chargerParId(idProjet) || await Projet.chargerParSlug(idProjet);

            if (projet) {
                // Recherche par ID ou par Slug (insensible à la casse)
                const target = idChapitre.toLowerCase();
                const chapitre = projet.chapitres.find(c => 
                    (c.id && c.id.toLowerCase() === target) || 
                    (c.slug && c.slug.toLowerCase() === target)
                );
                
                if (!chapitre) {
                    app.innerHTML = `
                        <div class="error" style="text-align:center; padding:50px; color:white;">
                            <h2>Oups ! Ce chapitre est introuvable.</h2>
                            <p style="color:#aaa; margin-top:10px;">Le lien semble incorrect ou le chapitre a été renommé.</p>
                            <div style="margin-top:30px;">
                                <h3 style="font-size:1rem; margin-bottom:15px;">Chapitres disponibles :</h3>
                                <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">
                                    ${projet.chapitres.map(c => `
                                        <a href="/lire/${projet.slug}/${c.slug}" data-link style="background:#222; padding:8px 15px; border-radius:30px; border:1px solid #444; color:white; font-size:0.85rem; text-decoration:none;">${c.titre || 'Chapitre ' + c.ordre}</a>
                                    `).join('')}
                                </div>
                            </div>
                            <a href="/" data-link class="btn-primary" style="margin-top:40px; display:inline-block;">Retour à l'accueil</a>
                        </div>`;
                    return;
                }

                // BEAUTIFFIER L'URL (REPLACE STATE)
                if (idProjet !== projet.slug || idChapitre !== chapitre.slug) {
                    history.replaceState(null, '', `/lire/${projet.slug}/${chapitre.slug}`);
                }

                const userConnecte = Auth.estConnecte();
                const user = Auth.getUtilisateur();
                let estDebloque = true;

                // Fast Pass (Chapitres 4 et +)
                if (chapitre.ordre > 3) {
                    if (!userConnecte) {
                        estDebloque = false;
                    } else {
                        const estVip = user.role === 'vip' || user.role === 'admin' || user.role === 'createur';
                        const achats = JSON.parse(localStorage.getItem('intoon_achats_chapitres') || '[]');
                        const aAchete = achats.includes(chapitre.id);
                        if (!estVip && !aAchete) {
                            estDebloque = false;
                        }
                    }
                }

                app.innerHTML = VueLecteur.rendreLecteur(projet, chapitre, userConnecte, user, estDebloque);

                LecteurController.initialiserControlesNetflix();
                LecteurController.initialiserCommentairesImmersifs();
                LecteurController.initialiserLazyLoading();
                
                SEOManager.update({
                    title: `Ch. ${chapitre.ordre} - ${projet.titre}`,
                    description: `Lisez le chapitre ${chapitre.ordre} de ${projet.titre}.`,
                    image: projet.couverture,
                    url: window.location.href
                });
                
                if (estDebloque) {
                    LecteurController.initialiserTracking(projet.id, chapitre.id);
                    LecteurController.initialiserSectionCommentaires(projet.id, chapitre.id);
                    
                    // Restauration du scroll
                    const lastHisto = await Historique.getDernier();
                    if (lastHisto && lastHisto.idChapitre === chapitre.id && lastHisto.scrollOffset > 0) {
                        setTimeout(() => {
                            window.scrollTo({ top: lastHisto.scrollOffset, behavior: 'smooth' });
                        }, 500);
                    }
                } else {
                    LecteurController.initialiserFastPass(projet.id, chapitre.id);
                }
            } else {
                app.innerHTML = '<div class="error">Projet ou chapitre temporairement indisponible.</div>';
            }
        } catch (err) {
            console.error(err);
            app.innerHTML = '<div class="error">Erreur critique lors du chargement des planches.</div>';
        }
    }

    // ────────────────────────────────────────────────────────────
    // DYNAMIQUE LAZY LOADING
    // ────────────────────────────────────────────────────────────
    static initialiserLazyLoading() {
        const lazyImages = document.querySelectorAll('img.lazy-image');
        if (!lazyImages.length) return;

        const observer = new IntersectionObserver((entries, observerInfo) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    observerInfo.unobserve(img);
                }
            });
        }, {
            rootMargin: '120% 0px' // Précharge environ un écran en avance
        });

        lazyImages.forEach(img => observer.observe(img));
    }

    // ────────────────────────────────────────────────────────────
    // TRACKING HISTORIQUE & BOOKMARK
    // ────────────────────────────────────────────────────────────
    static initialiserTracking(idProjet, idChapitre) {
        let saveTimer = null;
        
        // Enregistrement initial (scroll 0 pour l'instant, maj au défilement)
        Historique.enregistrer(idProjet, idChapitre, 0);

        const onScroll = () => {
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                const offset = window.scrollY || document.documentElement.scrollTop;
                if(offset > 0) Historique.enregistrer(idProjet, idChapitre, Math.floor(offset));
            }, 1000); // Debounce de 1 seconde pour limiter les appels réseau
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        // Nettoyage au changement de page
        const cleanup = () => {
            if(saveTimer) clearTimeout(saveTimer);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('popstate', cleanup);
        };
        window.addEventListener('popstate', cleanup);
    }

    // ────────────────────────────────────────────────────────────
    // MOTEUR NETFLIX : AUTO-SCROLL CINÉMATIQUE
    // ────────────────────────────────────────────────────────────
    static initialiserControlesNetflix() {
        const btnPlay = document.getElementById('btn-play-pause');
        const btnStop = document.getElementById('btn-stop');
        const slider = document.getElementById('scroll-speed');
        const playIcon = document.getElementById('play-icon');
        const engine = LecteurController.scrollEngine;

        if (!btnPlay || !btnStop || !slider) return;

        slider.value = engine.speed;
        slider.oninput = (e) => engine.speed = parseInt(e.target.value);

        const scrollLoop = () => {
            if (!engine.active) return;

            // Accumulation des pixels fractionnaires pour éviter que scrollBy(0,0.3) = 0
            engine.accumulator += engine.speed * 0.4;
            const pixelsToScroll = Math.floor(engine.accumulator);
            if (pixelsToScroll >= 1) {
                window.scrollBy(0, pixelsToScroll);
                engine.accumulator -= pixelsToScroll;
            }

            // Fin naturelle de la page → pause automatique
            const distanceRestante = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
            if (distanceRestante <= 2) {
                engine.active = false;
                engine.commentsPaused = false;
                engine.accumulator = 0;
                if (playIcon) playIcon.textContent = 'play_arrow';
                return;
            }
            engine.rafId = requestAnimationFrame(scrollLoop);
        };

        const controls = document.getElementById('netflix-controls');
        const navbar = document.getElementById('reader-topbar');

        const toggleUI = (visible) => {
            const isFs = document.fullscreenElement !== null;
            if (controls) controls.style.transform = visible ? 'translate(-50%, 0)' : 'translate(-50%, 150%)';
            if (navbar && !isFs) navbar.style.top = visible ? '0' : '-100px';
        };

        btnPlay.onclick = () => {
            engine.active = !engine.active;
            engine.commentsPaused = engine.active; // Pause Niconico pendant la lecture auto pour meilleure perf
            if (playIcon) playIcon.textContent = engine.active ? 'pause' : 'play_arrow';
            
            if (engine.active) {
                const overlay = document.getElementById('comments-overlay');
                if (overlay) {
                    const spans = overlay.querySelectorAll('span');
                    spans.forEach(span => span.style.opacity = '0'); // Fade out doux
                }
                toggleUI(false);
                engine.rafId = requestAnimationFrame(scrollLoop);
            } else {
                toggleUI(true);
                cancelAnimationFrame(engine.rafId);
            }
        };

        btnStop.onclick = () => {
            engine.active = false;
            engine.commentsPaused = false;
            cancelAnimationFrame(engine.rafId);
            if (playIcon) playIcon.textContent = 'play_arrow';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            engine.accumulator = 0;
            toggleUI(true);
        };

        // Plein Écran
        const btnFs = document.getElementById('btn-fullscreen');
        if (btnFs) {
            btnFs.onclick = () => {
                const isFs = document.fullscreenElement !== null;
                
                if (!isFs) {
                    document.documentElement.requestFullscreen().catch(err => console.log('Erreur FS', err));
                    if (navbar) navbar.style.display = 'none'; // Cacher la navbar
                } else {
                    document.exitFullscreen();
                    if (navbar) navbar.style.display = 'flex'; // Remettre la navbar
                }
            };
        }

        // Clic ou touch sur l'écran pour réafficher ou pauser
        const handleScreenInteraction = (e) => {
            if (e.target.closest('button, a, input, form')) return; // ignorer les éléments interactifs
            if (engine.active) {
                btnPlay.click(); // Met en pause
            } else {
                toggleUI(true); // Réaffiche au touché
            }
        };
        document.addEventListener('click', handleScreenInteraction);

        // Fix de la barre (disparition au scroll)
        let lastScrollY = window.scrollY;
        
        window.onscroll = () => {
            if (engine.active) return; // Forcer caché pendant le lecteur
            
            const isFs = document.fullscreenElement !== null;
            if (window.scrollY > lastScrollY && window.scrollY > 200 && !isFs) {
                if (controls) controls.style.transform = 'translate(-50%, 150%)'; // Cache en bas
                if (navbar) navbar.style.top = '-100px';
            } else {
                if (controls) controls.style.transform = 'translate(-50%, 0)'; // Réaffiche
                if (navbar && !isFs) navbar.style.top = '0';
            }
            lastScrollY = window.scrollY;
        };

        // Nettoyage spécial pour les écouteurs document-level
        const cleanupControls = () => {
             document.removeEventListener('click', handleScreenInteraction);
             window.removeEventListener('popstate', cleanupControls);
        };
        window.addEventListener('popstate', cleanupControls);
    }

    // ────────────────────────────────────────────────────────────
    // ESPACE COMMENTAIRES & FAST PASS
    // ────────────────────────────────────────────────────────────
    
    static async initialiserSectionCommentaires(idProjet, idChapitre) {
        const listDiv = document.getElementById('chapitre-comments-list');
        const form = document.getElementById('form-chapitre-comment');

        if (!listDiv) return;

        // Render d'un commentaire
        const rendreUnCommentaire = (c) => `
            <div style="display:flex; gap:15px; background:rgba(25,25,30,0.5); padding:15px; border-radius:10px; border:1px solid #222;">
                <img src="${c.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed='+c.pseudo}" style="width:40px; height:40px; border-radius:50%; background:#222;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                        <span style="color:#eab308; font-weight:bold; font-family:'Outfit',sans-serif;">${c.pseudo || 'Utilisateur'}</span>
                        <span style="color:#666; font-size:0.8rem;">${new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style="color:#ccc; line-height:1.4; margin:0; word-break:break-word;">${c.texte}</p>
                </div>
            </div>
        `;

        // Load initiaux
        const comments = await Commentaires.obtenirParChapitre(idChapitre);
        if (comments.length === 0) {
            listDiv.innerHTML = `<div style="text-align:center; color:#555; font-style:italic;">Soyez le premier à commenter ce chapitre !</div>`;
        } else {
            listDiv.innerHTML = comments.map(rendreUnCommentaire).join('');
        }

        // Submit form
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('chapitre-comment-input');
                const text = input.value.trim();
                if (!text) return;

                const submitBtn = form.querySelector('button');
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Publication...';

                const newComment = await Commentaires.ajouter(idProjet, idChapitre, text);
                
                if (newComment) {
                    input.value = '';
                    if (comments.length === 0) listDiv.innerHTML = ''; // Enlever le fallback "soyez le premier"
                    listDiv.insertAdjacentHTML('afterbegin', rendreUnCommentaire(newComment));
                    
                    // Gamification +5 XP
                    if (Auth.gagnerXP) Auth.gagnerXP(5);
                }

                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Publier';
            });
        }
    }

    static initialiserFastPass(idProjet, idChapitre) {
        const btn = document.getElementById('btn-unlock-fastpass');
        if (!btn) return;

        btn.addEventListener('click', () => {
             // Retrait de 50 Coins
             if (Auth.depenserCoins && Auth.depenserCoins(50)) {
                 const achats = JSON.parse(localStorage.getItem('intoon_achats_chapitres') || '[]');
                 achats.push(idChapitre);
                 localStorage.setItem('intoon_achats_chapitres', JSON.stringify(achats));
                 
                 btn.innerHTML = 'Débloqué ! Rechargement...';
                 btn.style.background = '#4ade80';
                 
                 setTimeout(() => {
                     // Recharger le chapitre (sans modifier l'URL)
                     LecteurController.lireChapitre(idProjet, idChapitre);
                 }, 1000);
             } else {
                 alert('Fonds insuffisants ! Vous avez besoin de 50 Coins. Rechargez depuis le Profil V.I.P.');
             }
        });
    }

    // ────────────────────────────────────────────────────────────
    // PARALLAX ZOOM CINÉMATIQUE (style Netflix Ken Burns per slide)
    // ────────────────────────────────────────────────────────────
    static initialiserParallaxZoom() {
        const images = document.querySelectorAll('[data-parallax="true"]');
        if (!images.length) return;

        // 1. IntersectionObserver : dézoom doux à l'entrée dans la vue
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const img = entry.target;
                if (entry.isIntersecting) {
                    // Entre dans la vue → démarre le dézoom Netflix
                    img.style.transform = 'scale(1.0)';
                } else {
                    // Sort de la vue → re-zoom pour le prochain scroll
                    img.style.transform = 'scale(1.06)';
                }
            });
        }, {
            threshold: [0.05, 0.3, 0.6, 1.0],
            rootMargin: '0px'
        });

        images.forEach(img => observer.observe(img));

        // 2. Scroll listener : parallax dynamique continu (profondeur cinéma)
        const onScroll = () => {
            images.forEach(img => {
                const rect = img.closest('.reader-slide')?.getBoundingClientRect();
                if (!rect) return;
                const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
                // centerOffset = 0 quand centré à l'écran, ±1 quand hors vue
                const scale = 1.0 + Math.abs(centerOffset) * 0.06;
                const clampedScale = Math.min(1.06, Math.max(1.0, scale));
                img.style.transition = 'transform 0.1s linear';
                img.style.transform = `scale(${clampedScale})`;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        // Nettoyage à la sortie du lecteur (navigation SPA)
        const cleanup = () => {
            observer.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('popstate', cleanup);
        };
        window.addEventListener('popstate', cleanup);
    }


    // ────────────────────────────────────────────────────────────
    // AUTO-HIDE : Les contrôles disparaissent après 3s d'inactivité
    // ────────────────────────────────────────────────────────────
    // AutoHide retiré (retour aux contrôles classiques)

    // ────────────────────────────────────────────────────────────
    // COMMENTAIRES NicoNico IMMERSIFS
    // ────────────────────────────────────────────────────────────
    static initialiserCommentairesImmersifs() {
        const overlay = document.getElementById('comments-overlay');
        const toggleBtn = document.getElementById('toggle-comments');
        const form = document.getElementById('form-live-comment');
        if (!overlay) return;

        let commentsActive = true;

        const dropComment = (text, isUser = false) => {
            if (!commentsActive || LecteurController.scrollEngine.commentsPaused) return;
            const span = document.createElement('span');
            span.textContent = text.toLowerCase();
            span.style.cssText = `
                position: absolute;
                left: ${Math.random() * 60 + 20}%;
                top: 100%;
                color: ${isUser ? 'rgba(229,9,20,0.85)' : 'rgba(255,255,255,0.4)'};
                font-weight: ${isUser ? '300' : '100'};
                font-family: 'Be Vietnam Pro', sans-serif;
                letter-spacing: 1px;
                font-size: ${Math.random() * 0.4 + 1.2}rem;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                white-space: nowrap;
                transition: top 8s linear, opacity 1.5s ease-in-out;
                opacity: 0;
                z-index: 45;
                pointer-events: none;
            `;
            overlay.appendChild(span);
            setTimeout(() => { span.style.opacity = '1'; span.style.top = '-10%'; }, 50);
            setTimeout(() => { span.style.opacity = '0'; }, 6500);
            setTimeout(() => { if (span.parentNode) span.parentNode.removeChild(span); }, 8100);
        };

        if (toggleBtn) {
            toggleBtn.onclick = () => {
                commentsActive = !commentsActive;
                overlay.style.display = commentsActive ? 'block' : 'none';
            };
        }

        const fakeComments = [
            "masterclass ce chapitre", "omg les dessins", "le goat est de retour !!",
            "l'ambiance est incroyable", "la colorisation m'a achevé..", "need la suite vite",
            "incroyable 😭", "les détails sur les yeux...", "c'est du pur cinéma",
            "top 1 webtoon fr", "les persos sont trop biens"
        ];

        const streamInterval = setInterval(() => {
            if (!document.getElementById('comments-overlay')) { clearInterval(streamInterval); return; }
            if (LecteurController.scrollEngine.commentsPaused) return; // Ne pas générer si lecture
            if (Math.random() > 0.4) dropComment(fakeComments[Math.floor(Math.random() * fakeComments.length)]);
        }, 2200);

        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const input = document.getElementById('live-comment-input');
                if (input && input.value.trim()) {
                    dropComment(input.value.trim(), true);
                    input.value = '';
                }
            };
        }
    }
}
