import Projet from '../models/Projet.js';
import Favoris from '../models/Favoris.js';
import Historique from '../models/Historique.js';
import Likes from '../models/Likes.js';
import Reviews from '../models/Reviews.js';
import Auth from '../models/Auth.js';
import VueCatalogue from '../views/VueCatalogue.js';

export default class AccueilController {
    static async afficherCatalogue() {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loader" style="color:white;">Chargement du catalogue de Webtoons...</div>';
        try {
            const projetsBruts = await Projet.chargerTous();
            const projets = projetsBruts.filter(p => p.statut === 'publie');
            const projetsLab = projetsBruts.filter(p => p.statut === 'brouillon');
            
            const dataHisto = Historique.getDernier();
            let projetEnCours = null;
            let chapitreEnCours = null;
            
            if (dataHisto) {
                projetEnCours = projets.find(p => p.id === dataHisto.idProjet);
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
            const projet = await Projet.chargerParId(id);
            if (projet && (projet.statut === 'publie' || projet.statut === 'brouillon')) {
                const estFavori = Favoris.estFavori(id);
                const aLikeLocal = Likes.aLike(id);
                
                const statsReviews = Reviews.getMoyenne(id);
                const listeReviews = Reviews.obtenirTous(id);
                const estConnecte = Auth.estConnecte();
                const userRole = estConnecte ? Auth.getUtilisateur().role : null;

                app.innerHTML = VueCatalogue.rendreDetailProjet(projet, estFavori, aLikeLocal, statsReviews, listeReviews, estConnecte);

                const formReview = document.getElementById('form-add-review');
                if (formReview) {
                    formReview.onsubmit = (e) => {
                        e.preventDefault();
                        const note = document.getElementById('review-note').value;
                        const text = document.getElementById('review-text').value;
                        
                        // Sauvegarde de la Review (StarRating local)
                        Reviews.ajouter(id, note, text, userRole);
                        
                        // Rechargement immédiat de la vue sans recharger le navigateur ! (SPA fluide)
                        AccueilController.afficherDetailProjet(id);
                    };
                }
            } else {
                app.innerHTML = '<div class="error">Projet introuvable ou retiré. <a href="/" data-link class="btn-primary">Retour à l\'accueil</a></div>';
            }
        } catch (err) {
            app.innerHTML = `<div class="error">Erreur de chargement pour la page du projet.</div>`;
        }
    }
}
