import Security from '../utils/Security.js';

export default class VueShop {
    /**
     * Rendu de la page Boutique d'un projet
     * @param {Object} projet L'instance du projet
     */
    static rendre(projet) {
        const physicalHtml = projet.hasPhysical ? `
            <div style="background:rgba(255,255,255,0.03); border:1px solid #333; border-radius:16px; padding:30px; display:flex; gap:30px; align-items:center; flex-wrap:wrap; margin-bottom:40px; border-left:5px solid #4ade80;">
                <img src="${projet.couverture}" style="width:150px; height:220px; object-fit:cover; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                <div style="flex:1; min-width:250px;">
                    <h2 style="font-size:1.8rem; margin-bottom:10px; font-family:'Outfit', sans-serif;">📖 Tirage Physique : ${Security.escapeHTML(projet.titre)}</h2>
                    <p style="color:#aaa; line-height:1.6; margin-bottom:20px;">Recevez chez vous l'exemplaire imprimé de cette œuvre. Qualité premium InToon, reliure soignée et papier haut de gamme.</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:2rem; font-weight:900; color:#4ade80;">${projet.pricePhysical.toFixed(2)}€ <small style="font-size:0.8rem; color:#777;">TTC</small></span>
                        <button class="btn-primary btn-buy-item" data-item="Comic - ${projet.titre}" style="background:#4ade80; color:black; border:none; padding:12px 30px; font-weight:900; border-radius:30px;">
                            <span class="material-symbols-outlined">shopping_cart</span> ACHETER LE COMIC
                        </button>
                    </div>
                </div>
            </div>
        ` : '';

        const originalsHtml = projet.hasOriginals ? `
            <div style="margin-top:60px;">
                <h2 style="font-size:2rem; margin-bottom:30px; color:white; border-left:5px solid #f472b6; padding-left:20px; font-family:'Outfit', sans-serif;">🎨 Planches Originales de l'Auteur</h2>
                <div class="shop-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:25px;">
                    ${projet.shopItems && projet.shopItems.length > 0 ? projet.shopItems.map(item => `
                        <div class="shop-item-card" style="background:#111; border:1px solid #222; border-radius:12px; overflow:hidden; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            <img src="${item.url}" style="width:100%; height:250px; object-fit:cover; border-bottom:1px solid #222;">
                            <div style="padding:20px;">
                                <h3 style="margin-bottom:8px; font-size:1.2rem;">${Security.escapeHTML(item.titre)}</h3>
                                <p style="color:#666; font-size:0.85rem; margin-bottom:20px;">Planche originale, format A3, signée par l'auteur.</p>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:1.4rem; font-weight:bold; color:#f472b6;">${parseFloat(item.prix).toFixed(2)}€</span>
                                    <button class="btn-secondary btn-buy-item" data-item="${item.titre}" style="border-color:#f472b6; color:#f472b6; padding:8px 15px; font-size:0.8rem;">RESERVER</button>
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <!-- Fallback si pas d'items spécifiques, on montre le prix générique -->
                        <div style="grid-column: 1 / -1; background:rgba(244,114,182,0.05); padding:40px; border-radius:12px; border:1px dashed #f472b6; text-align:center;">
                            <span class="material-symbols-outlined" style="font-size:3rem; color:#f472b6; margin-bottom:15px;">palette</span>
                            <h3 style="color:white; margin-bottom:10px;">Vente de Planches Originales Active</h3>
                            <p style="color:#aaa; max-width:500px; margin:0 auto 20px;">Le créateur propose ses planches originales à la vente pour cette série au prix moyen de <b>${projet.priceOriginal.toFixed(2)}€</b>.</p>
                            <button class="btn-primary btn-buy-item" data-item="Planche Originale - ${projet.titre}" style="background:#f472b6; color:white; border:none; padding:12px 30px;">CONTACTER POUR LES DISPOS</button>
                        </div>
                    `}
                </div>
            </div>
        ` : '';

        return `
            <div class="shop-page" style="max-width:1100px; margin:0 auto; padding:60px 4%; animation:fadeIn 0.8s ease;">
                <header style="margin-bottom:60px; text-align:center;">
                    <a href="/projet/${projet.slug}" data-link style="color:#777; text-decoration:none; display:flex; align-items:center; gap:5px; justify-content:center; margin-bottom:20px;">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span> Retour au projet
                    </a>
                    <h1 style="font-size:3rem; margin-bottom:15px; font-family:'Outfit', sans-serif;">Le Marché de l'Artiste</h1>
                    <p style="color:#aaa; font-size:1.2rem; max-width:700px; margin:0 auto;">Soutenez directement <b>${Security.escapeHTML(projet.authorPseudo)}</b> en acquérant une version physique de <b>${Security.escapeHTML(projet.titre)}</b>.</p>
                </header>

                <div class="shop-content">
                    ${physicalHtml}
                    ${originalsHtml}

                    <div style="margin-top:80px; padding:40px; background:#0a0a0d; border-radius:16px; border:1px solid #1a1a20; text-align:center;">
                        <h3 style="margin-bottom:15px; font-family:'Outfit', sans-serif;">📦 Informations de Livraison</h3>
                        <p style="color:#777; line-height:1.6; max-width:800px; margin:0 auto;">
                            ${Security.escapeHTML(projet.shopDescription || "Les expéditions sont gérées directement par le Studio ou l'Artiste. Comptez entre 5 et 10 jours ouvrés pour la réception de vos œuvres physiques. Un numéro de suivi vous sera communiqué par mail.")}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
}
