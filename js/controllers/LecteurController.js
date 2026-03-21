import Projet from '../models/Projet.js';
import VueLecteur from '../views/VueLecteur.js';
import Auth from '../models/Auth.js';
import Historique from '../models/Historique.js';

export default class LecteurController {
    
    // Moteur d'auto-scroll cinématique
    static scrollEngine = {
        active: false,
        speed: 1,          // Vitesse (1-10)
        rafId: null,
        accumulator: 0,    // Accumulation pixels fractionnaires (fix bug v=1)
        hidden: false,
        hideTimer: null
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
                // Recherche par ID ou par Slug
                const chapitre = projet.chapitres.find(c => c.id === idChapitre || c.slug === idChapitre);
                
                if (!chapitre) {
                    console.error("[Lecteur] Chapitre introuvable pour ID/Slug:", idChapitre);
                    console.log("[Lecteur] Slugs disponibles:", projet.chapitres.map(c => c.slug));
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

                Historique.enregistrer(projet.id, chapitre.id);
                const userConnecte = Auth.estConnecte();
                app.innerHTML = VueLecteur.rendreLecteur(projet, chapitre, userConnecte);

                LecteurController.initialiserControlesNetflix();
                LecteurController.initialiserCommentairesImmersifs();
                LecteurController.initialiserAutoHide();
            } else {
                app.innerHTML = '<div class="error">Projet ou chapitre temporairement indisponible.</div>';
            }
        } catch (err) {
            console.error(err);
            app.innerHTML = '<div class="error">Erreur critique lors du chargement des planches.</div>';
        }
    }

    // ────────────────────────────────────────────────────────────
    // MOTEUR NETFLIX : AUTO-SCROLL CINÉMATIQUE
    // ────────────────────────────────────────────────────────────
    static initialiserControlesNetflix() {
        const btnPlay  = document.getElementById('btn-play-pause');
        const btnStop  = document.getElementById('btn-stop');
        const slider   = document.getElementById('scroll-speed');
        const playIcon = document.getElementById('play-icon');
        const btnFs    = document.getElementById('btn-fullscreen');
        const engine   = LecteurController.scrollEngine;

        if (!btnPlay) return;

        // Lecture au RAF (requestAnimationFrame) pour un scroll fluide 60fps
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
                engine.accumulator = 0;
                if (playIcon) playIcon.textContent = 'play_arrow';
                return;
            }
            engine.rafId = requestAnimationFrame(scrollLoop);
        };

        // Play / Pause
        btnPlay.onclick = () => {
            engine.active = !engine.active;
            playIcon.textContent = engine.active ? 'pause' : 'play_arrow';
            if (engine.active) {
                engine.rafId = requestAnimationFrame(scrollLoop);
            } else {
                cancelAnimationFrame(engine.rafId);
            }
        };

        // Stop → retour tout en haut + pause
        btnStop.onclick = () => {
            engine.active = false;
            cancelAnimationFrame(engine.rafId);
            playIcon.textContent = 'play_arrow';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        // Vitesse
        slider.oninput = (e) => {
            engine.speed = parseInt(e.target.value);
        };

        // Molette souris : ajuste la vitesse ou pause si scroll manuel
        window.addEventListener('wheel', (e) => {
            if (engine.active) {
                engine.active = false;
                cancelAnimationFrame(engine.rafId);
                playIcon.textContent = 'play_arrow';
            }
        }, { passive: true });

        // Plein écran (expérience TV Canapé)
        btnFs.onclick = () => {
            const el = document.documentElement;
            if (!document.fullscreenElement) {
                el.requestFullscreen().catch(() => {});
                btnFs.querySelector('.material-symbols-outlined').textContent = 'fullscreen_exit';
            } else {
                document.exitFullscreen();
                btnFs.querySelector('.material-symbols-outlined').textContent = 'fullscreen';
            }
        };

        // Raccourcis clavier (Space = Play/Pause, Esc = Stop, +/- = vitesse)
        document.onkeydown = (e) => {
            const forbiddenTags = ['INPUT', 'TEXTAREA', 'SELECT'];
            if (forbiddenTags.includes(e.target.tagName)) return;
            
            if (e.code === 'Space') { e.preventDefault(); btnPlay.click(); }
            if (e.code === 'KeyS' || e.key === 'Escape') { btnStop.click(); }
            if (e.code === 'ArrowUp')   { slider.value = Math.min(10, parseInt(slider.value) + 1); engine.speed = parseInt(slider.value); }
            if (e.code === 'ArrowDown') { slider.value = Math.max(1,  parseInt(slider.value) - 1); engine.speed = parseInt(slider.value); }
        };
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
    static initialiserAutoHide() {
        const controls  = document.getElementById('netflix-controls');
        const topbar    = document.getElementById('reader-topbar');
        const engine    = LecteurController.scrollEngine;

        if (!controls) return;

        const show = () => {
            controls.style.opacity = '1';
            controls.style.transform = 'translateX(-50%) translateY(0)';
            if (topbar) topbar.style.opacity = '1';
            clearTimeout(engine.hideTimer);
            if (engine.active) {
                engine.hideTimer = setTimeout(hide, 3000);
            }
        };

        const hide = () => {
            controls.style.opacity = '0';
            controls.style.transform = 'translateX(-50%) translateY(20px)';
            if (topbar) topbar.style.opacity = '0';
        };

        document.addEventListener('mousemove', show);
        document.addEventListener('touchstart', show);
        document.addEventListener('keydown', show);
    }

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
            if (!commentsActive) return;
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
