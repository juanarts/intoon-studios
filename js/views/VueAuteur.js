export default class VueAuteur {
    /**
     * Construit la page vitrine "Le Studio" ou "L'Auteur"
     */
    static rendre() {
        return `
            <div class="auteur-page" style="padding: 40px 4%; animation: fadeIn 0.8s ease-out; max-width: 1000px; margin: 0 auto;">
                <div class="auteur-header" style="text-align:center; margin-bottom: 50px;">
                    <h1 style="font-size: 3.5rem; color: white; letter-spacing:2px;"><span style="color:var(--primary);">IN</span>TOON STUDIOS</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted); margin-top:10px;">Derrière les ombres, des créateurs de mondes.</p>
                </div>
                
                <div class="auteur-content" style="display: flex; gap: 40px; align-items: center; flex-wrap: wrap;">
                    <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?w=600&q=80" alt="Notre Studio" style="flex:1; min-width:300px; border-radius:8px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    
                    <div class="auteur-text" style="flex:1; min-width:300px;">
                        <h2 style="margin-bottom: 20px; font-size: 2rem;">Notre Vision</h2>
                        <p style="color:var(--text-muted); font-size: 1.1rem; margin-bottom: 30px; line-height: 1.8;">
                            Nous sommes un studio indépendant spécialisé dans la création de Webtoons originaux mêlant la fantaisie sombre, la science-fiction et l'esthétique cyberpunk.
                            <br><br>
                            Notre mission : Vous plonger dans des récits sans concession, portés par des univers graphiques marquants.
                        </p>
                        
                        <h3 style="margin-bottom: 15px; font-size: 1.5rem;">Soutenez le Studio !</h3>
                        <p style="color:var(--text-muted); margin-bottom: 30px;">
                            Notre studio vit grâce à l'aide de ses plus fervents lecteurs. Devenez un sponsor officiel pour nous aider à produire financièrement les prochains gros blockbusters de la plateforme !
                        </p>
                        
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <a href="/vip" data-link class="btn-secondary" style="font-size: 1.1rem; padding: 12px 24px; border-color:#eab308; color:#eab308!important;"><span class="material-symbols-outlined">stars</span> Découvrir le Programme VIP</a>
                            <a href="/soumission" data-link class="btn-primary" style="font-size: 1.1rem; padding: 12px 24px;"><span class="material-symbols-outlined">upload_file</span> Lancer une Série Indé'</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
