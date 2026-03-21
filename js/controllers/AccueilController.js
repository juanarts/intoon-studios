import Projet from '../models/Projet.js';
import Favoris from '../models/Favoris.js';
import Historique from '../models/Historique.js';
import Likes from '../models/Likes.js';
import Reviews from '../models/Reviews.js';
import Auth from '../models/Auth.js';
import VueCatalogue from '../views/VueCatalogue.js';

export default class AccueilController {
    static async afficherCatalogue(query = null) {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader" style="color:white;">Chargement du catalogue de Webtoons...</div>';
        try {
            const projetsBruts = await Projet.chargerTous();
            let projets = projetsBruts.filter(p => p.statut === 'publie');
            let projetsLab = projetsBruts.filter(p => p.statut === 'brouillon');

            // Pré-charger les stats pour les 3 premiers projets du Hero
            const heroSlides = projets.slice(0, 3);
            for (const p of heroSlides) {
                p.statsReviews = await Reviews.getMoyenne(p.id);
            }

            if (query) {
                const q = query.toLowerCase();
                projets = projets.filter(p => 
                    p.titre.toLowerCase().includes(q) || 
                    (p.description && p.description.toLowerCase().includes(q)) ||
                    (p.genres && p.genres.some(g => g.toLowerCase().includes(q))) ||
                    (p.auteurs && p.auteurs.some(a => a.toLowerCase().includes(q)))
                );
                // On ne filtre pas les projets Lab pour l'instant ou on les masque
                projetsLab = []; 
            }
            
            const dataHisto = Historique.getDernier();
            let projetEnCours = null;
            let chapitreEnCours = null;
            
            if (dataHisto) {
                // On cherche dans TOUS les projets (Publiés ou Lab) pour la reprise de lecture
                projetEnCours = projetsBruts.find(p => p.id === dataHisto.idProjet);
                if (projetEnCours) {
                    chapitreEnCours = projetEnCours.chapitres.find(c => c.id === dataHisto.idChapitre);
                }
            }

            app.innerHTML = VueCatalogue.rendreCatalogue(projets, projetsLab, projetEnCours, chapitreEnCours);
            AccueilController.initialiserCarousel();
            AccueilController.initialiserSmartTV();
        } catch (err) {
            app.innerHTML = '<div class="error">Erreur lors de la récupération du catalogue. Veuillez réessayer.</div>';
        }
    }

    static initialiserSmartTV() {
        const app = document.getElementById('app');
        app.addEventListener('click', (e) => {
            if (e.target.closest('.btn-cast-tv')) {
                e.preventDefault();
                
                const pinCode = Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
                const modale = document.createElement('div');
                modale.id = 'modal-smart-tv';
                modale.innerHTML = `
                    <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:9999; display:flex; justify-content:center; align-items:center; animation:fadeIn 0.3s; backdrop-filter:blur(10px);">
                        <div style="background:#111; border:1px solid #333; padding:50px; border-radius:16px; max-width:600px; width:90%; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
                            <span class="material-symbols-outlined" style="font-size:4rem; color:var(--primary); margin-bottom:20px;">tv</span>
                            <h2 style="font-size:2rem; margin-bottom:10px; font-family:'Outfit', sans-serif;">Connectez-vous à votre TV</h2>
                            <p style="color:#aaa; font-size:1.1rem; margin-bottom:30px;">Ouvrez l'application <b>Intoon Studio</b> sur votre Smart TV, Apple TV ou Chromecast, puis scannez ce QR Code avec votre téléphone ou entrez le code PIN ci-dessous.</p>
                            
                            <div style="display:flex; justify-content:center; gap:40px; align-items:center; margin-bottom:30px;">
                                <div style="background:white; padding:15px; border-radius:12px;">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=intoon-tv-auth" alt="QR Code TV" style="display:block;">
                                </div>
                                <div style="text-align:left;">
                                    <div style="color:#666; font-size:0.9rem; text-transform:uppercase; font-weight:bold; letter-spacing:2px; margin-bottom:5px;">Code PIN TV</div>
                                    <div style="font-size:2.5rem; font-weight:900; letter-spacing:8px; font-family:'Outfit', sans-serif;">${pinCode}</div>
                                </div>
                            </div>
                            
                            <button class="btn-secondary btn-close-tv" style="width:100%; padding:15px; font-size:1.1rem; border:none; background:#333; color:white;">Fermer</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modale);

                modale.querySelector('.btn-close-tv').addEventListener('click', () => {
                    modale.remove();
                });
            }
        });
    }

    static initialiserCarousel() {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dots .dot');
        if (slides.length <= 1) return;

        let currentIndex = 0;
        let timer = null;

        const showSlide = (index) => {
            // Reset de toutes les slides
            slides.forEach(s => {
                s.style.opacity = '0';
                s.style.zIndex = '1';
                const v = s.querySelector('video');
                if(v) v.pause();
            });
            dots.forEach(d => d.style.background = 'rgba(255,255,255,0.3)');
            
            currentIndex = index;

            // Activation de la nouvelle slide
            slides[currentIndex].style.opacity = '1';
            slides[currentIndex].style.zIndex = '5';
            dots[currentIndex].style.background = 'white';
            
            // Relancer la vidéo s'il y en a une, sinon timer image
            const newVideo = slides[currentIndex].querySelector('video');
            if (newVideo) {
                newVideo.currentTime = 0; // Remise au début (Netflix trailer)
                newVideo.play().catch(e => console.log(e));
                
                // Transition automatique à la FIN de la vidéo !
                newVideo.onended = () => nextSlide();
                
                if (timer) clearTimeout(timer);
            } else {
                // Image fixe avec Animation slowZoom (7 secondes de vue)
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => nextSlide(), 7000);
            }
        };

        const nextSlide = () => {
            let nextIndex = (currentIndex + 1) % slides.length;
            showSlide(nextIndex);
        };

        // Click sur les indicateurs de navigation (Dots en bas)
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (index !== currentIndex) {
                    showSlide(index);
                }
            });
        });

        // Lancement immédiat de la première slide
        showSlide(0);
    }

    static async afficherDetailProjet(id) {
        const app = document.getElementById('app');
        app.innerHTML = `<div class="loader">Chargement des détails...</div>`;
        try {
            // Recherche par ID (UUID) ou par Slug (SEO)
            let projet = await Projet.chargerParId(id);
            if (!projet) {
                projet = await Projet.chargerParSlug(id);
            }
            if (projet && (projet.statut === 'publie' || projet.statut === 'brouillon')) {
                // BEAUTIFFIER L'URL (REPLACE STATE)
                if (id !== projet.slug) {
                    history.replaceState(null, '', `/projet/${projet.slug}`);
                }

                const estFavori = Favoris.estFavori(projet.id);
                const aLikeLocal = await Likes.aLike(projet.id);
                
                const statsReviews = await Reviews.getMoyenne(projet.id);
                const listeReviews = await Reviews.obtenirTous(projet.id);
                const estConnecte = Auth.estConnecte();
                const userRole = estConnecte ? Auth.getUtilisateur().role : null;

            app.innerHTML = VueCatalogue.rendreDetailProjet(projet, estFavori, aLikeLocal, statsReviews, listeReviews, estConnecte);

            // 1. EFFET NICONICO : Nettoyage et Relance
            const overlay = document.getElementById('project-comments-overlay');
            if (overlay) overlay.innerHTML = ''; 
            AccueilController.lancerCommentairesFlottants(listeReviews);

            // 2. PARTAGE SOCIAL
            const btnShare = document.querySelector('.btn-share-project');
            if (btnShare) {
                btnShare.onclick = async () => {
                    const shareData = {
                        title: `INTOON : ${projet.titre}`,
                        text: `Découvrez "${projet.titre}" sur INTOON STUDIOS !`,
                        url: window.location.href
                    };
                    try {
                        if (navigator.share) {
                            await navigator.share(shareData);
                        } else {
                            await navigator.clipboard.writeText(shareData.url);
                            alert("Lien copié dans le presse-papier ! 🔗");
                        }
                    } catch(e) { console.warn("Share failed", e); }
                };
            }

            // 2. Gestion du Formulaire Principal
            const formReview = document.getElementById('form-add-review');
            if (formReview) {
                formReview.onsubmit = async (e) => {
                    e.preventDefault();
                    const note = document.getElementById('review-note').value;
                    const text = document.getElementById('review-text').value;
                    await Reviews.ajouter(projet.id, note, text);
                    // On recharge par slug ou id actuel
                    AccueilController.afficherDetailProjet(id);
                };
            }

            // 3. Délégation d'Événements pour les Actions Sociales (Likes, Réponses, Édition)
            app.onclick = (e) => {
                const reviewBlock = e.target.closest('.review-block');
                if (!reviewBlock) return;
                const reviewId = reviewBlock.dataset.id;
                const user = Auth.getUtilisateur();

                // LIKE
                if (e.target.classList.contains('btn-review-like')) {
                    if (!user) return alert("Connectez-vous pour liker !");
                    Reviews.liker(reviewId, user.id);
                    AccueilController.afficherDetailProjet(id);
                }

                // REPONDRE (Affiche un petit champ de réponse)
                if (e.target.classList.contains('btn-review-repondre')) {
                    if (!user) return alert("Connectez-vous pour répondre !");
                    const existingInput = reviewBlock.querySelector('.reply-input-wrap');
                    if (existingInput) return existingInput.remove();

                    const replyWrap = document.createElement('div');
                    replyWrap.className = 'reply-input-wrap';
                    replyWrap.style = "margin-top:10px; margin-left:45px; display:flex; gap:10px;";
                    replyWrap.innerHTML = `
                        <input type="text" placeholder="Votre réponse..." style="flex:1; background:#000; border:1px solid #333; color:white; padding:8px 12px; border-radius:15px; font-size:0.85rem;">
                        <button class="btn-primary btn-send-reply" style="padding:5px 15px; border-radius:15px; font-size:0.8rem;">Envoyer</button>
                    `;
                    reviewBlock.appendChild(replyWrap);
                    
                    replyWrap.querySelector('.btn-send-reply').onclick = () => {
                        const val = replyWrap.querySelector('input').value;
                        if (val.trim()) {
                            Reviews.repondre(reviewId, val, user);
                            AccueilController.afficherDetailProjet(id);
                        }
                    };
                }

                // MODIFIER (Affiche un champ d'édition)
                if (e.target.classList.contains('btn-review-edit')) {
                    const textSpan = reviewBlock.querySelector('.review-comment-text');
                    const originalText = textSpan.innerText;
                    textSpan.outerHTML = `<input type="text" class="edit-review-input" value="${originalText}" style="background:#111; border:1px solid var(--primary); color:white; width:100%; padding:5px; border-radius:4px; margin-top:5px;">`;
                    
                    const editInput = reviewBlock.querySelector('.edit-review-input');
                    editInput.focus();
                    editInput.onkeydown = (ev) => {
                        if (ev.key === 'Enter') {
                            Reviews.modifier(reviewId, editInput.value, user.id);
                            AccueilController.afficherDetailProjet(id);
                        }
                    };
                }
            };

            } else {
                app.innerHTML = '<div class="error">Projet introuvable ou retiré. <a href="/" data-link class="btn-primary">Retour à l\'accueil</a></div>';
            }
        } catch (err) {
            console.error(err);
            app.innerHTML = `<div class="error">Erreur de chargement pour la page du projet.</div>`;
        }
    }

    static lancerCommentairesFlottants(reviews) {
        const overlay = document.getElementById('project-comments-overlay');
        if (!overlay) return;

        // On mélange de vrais avis et des messages génériques du studio
        const messages = reviews.length > 0 ? reviews.map(r => r.commentaire) : [
            "Incroyable !", "Vraiment captivant.", "Le dessin est au top.", "J'attends la suite avec impatience !",
            "InToon Rocks 🚀", "Quelle ambiance !", "Sublime !", "❤️"
        ];

        const createComment = () => {
            if (!document.getElementById('project-comments-overlay')) return; // Sécurité si on change de page
            
            const text = messages[Math.floor(Math.random() * messages.length)];
            const span = document.createElement('span');
            span.innerText = text;
            span.style = `
                position: absolute;
                white-space: nowrap;
                color: rgba(255,255,255,0.8);
                font-family: 'Inter', sans-serif;
                font-weight: 700;
                font-size: ${Math.random() * 0.5 + 0.9}rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                left: ${Math.random() * 80 + 5}%;
                top: 100%;
                opacity: 0;
                transition: top 12s linear, opacity 1s;
                pointer-events: none;
                z-index: 100;
            `;
            
            overlay.appendChild(span);
            // Animation : Monte du bas vers le haut
            setTimeout(() => {
                span.style.opacity = '1';
                span.style.top = '-20%';
            }, 100);

            // Nettoyage
            setTimeout(() => span.remove(), 13000);
            
            // Prochain commentaire entre 1.5s et 4s
            setTimeout(createComment, 1500 + Math.random() * 2500);
        };

        // Lancement progressif des 3 premiers
        for(let i=0; i<3; i++) setTimeout(createComment, i * 1500);
    }
}
