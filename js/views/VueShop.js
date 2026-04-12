import Security from '../utils/Security.js';
import I18n from '../utils/I18n.js';

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
                    <h2 style="font-size:1.8rem; margin-bottom:10px; font-family:'Outfit', sans-serif;">📖 ${I18n.t('shop_physical_title')}: ${Security.escapeHTML(projet.titre)}</h2>
                    <p style="color:#aaa; line-height:1.6; margin-bottom:20px;">${I18n.t('shop_physical_text')}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:2rem; font-weight:900; color:#4ade80;">${projet.pricePhysical.toFixed(2)}€ <small style="font-size:0.8rem; color:#777;">TTC</small></span>
                        <button class="btn-primary btn-buy-item" 
                            data-item="Comic - ${projet.titre}" 
                            data-type="physical" 
                            data-montant="${projet.pricePhysical}"
                            style="background:#4ade80; color:black; border:none; padding:12px 30px; font-weight:900; border-radius:30px;">
                            <span class="material-symbols-outlined">shopping_cart</span> ${I18n.t('shop_btn_buy_comic')}
                        </button>
                    </div>
                </div>
            </div>
        ` : '';

        const originalsHtml = projet.hasOriginals ? `
            <div style="margin-top:60px;">
                <h2 style="font-size:2rem; margin-bottom:30px; color:white; border-left:5px solid #f472b6; padding-left:20px; font-family:'Outfit', sans-serif;">🎨 ${I18n.t('shop_originals_title')}</h2>
                <div class="shop-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:25px;">
                    ${projet.shopItems && projet.shopItems.length > 0 ? projet.shopItems.map(item => `
                        <div class="shop-item-card" style="background:#111; border:1px solid #222; border-radius:12px; overflow:hidden; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            <img src="${item.url}" style="width:100%; height:250px; object-fit:cover; border-bottom:1px solid #222;">
                            <div style="padding:20px;">
                                <h3 style="margin-bottom:8px; font-size:1.2rem;">${Security.escapeHTML(item.titre)}</h3>
                                <p style="color:#666; font-size:0.85rem; margin-bottom:20px;">${I18n.t('shop_original_desc')}</p>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:1.4rem; font-weight:bold; color:#f472b6;">${parseFloat(item.prix).toFixed(2)}€</span>
                                    <button class="btn-secondary btn-buy-item" 
                                          data-item="${item.titre}" 
                                          data-type="original" 
                                          data-montant="${item.prix}"
                                          style="border-color:#f472b6; color:#f472b6; padding:8px 15px; font-size:0.8rem;">${I18n.t('shop_btn_reserve')}</button>
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <!-- Fallback si pas d'items spécifiques, on montre le prix générique -->
                        <div style="grid-column: 1 / -1; background:rgba(244,114,182,0.05); padding:40px; border-radius:12px; border:1px dashed #f472b6; text-align:center;">
                            <span class="material-symbols-outlined" style="font-size:3rem; color:#f472b6; margin-bottom:15px;">palette</span>
                            <h3 style="color:white; margin-bottom:10px;">${I18n.t('shop_sale_active')}</h3>
                            <p style="color:#aaa; max-width:500px; margin:0 auto 20px;">${I18n.t('shop_sale_text').replace('{price}', `<b>${projet.priceOriginal.toFixed(2)}€</b>`)}</p>
                            <button class="btn-primary btn-buy-item" 
                                    data-item="Planche Originale - ${projet.titre}" 
                                    data-type="original" 
                                    data-montant="${projet.priceOriginal}"
                                    style="background:#f472b6; color:white; border:none; padding:12px 30px;">${I18n.t('shop_btn_contact')}</button>
                        </div>
                    `}
                </div>
            </div>
        ` : '';

        return `
            <div class="shop-page" style="max-width:1100px; margin:0 auto; padding:60px 4%; animation:fadeIn 0.8s ease;">
                <header style="margin-bottom:60px; text-align:center;">
                    <a href="/projet/${projet.slug}" data-link style="color:#777; text-decoration:none; display:flex; align-items:center; gap:5px; justify-content:center; margin-bottom:20px;">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;">arrow_back</span> ${I18n.t('shop_link_back')}
                    </a>
                    <h1 style="font-size:3rem; margin-bottom:15px; font-family:'Outfit', sans-serif;">${I18n.t('shop_title')}</h1>
                    <p style="color:#aaa; font-size:1.2rem; max-width:700px; margin:0 auto;">${I18n.t('shop_tagline').replace('{author}', `<b>${Security.escapeHTML(p.authorPseudo)}</b>`).replace('{title}', `<b>${Security.escapeHTML(p.titre)}</b>`)}</p>
                </header>

                <div class="shop-content">
                    ${physicalHtml}
                    ${originalsHtml}

                    <div style="margin-top:80px; padding:40px; background:#0a0a0d; border-radius:16px; border:1px solid #1a1a20; text-align:center;">
                        <h3 style="margin-bottom:15px; font-family:'Outfit', sans-serif;">📦 ${I18n.t('shop_shipping_title')}</h3>
                        <p style="color:#777; line-height:1.6; max-width:800px; margin:0 auto;">
                            ${Security.escapeHTML(p.shopDescription || I18n.t('shop_shipping_default'))}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rendu de la page d'accueil de la Boutique (Marketplace)
     * @param {Array} projetsShop Liste des projets avec boutique active
     */
    static rendreIndex(projetsShop) {
        return `
            <div class="shop-index-page" style="padding: 60px 4%; animation: fadeIn 0.8s ease-out; max-width: 1200px; margin: 0 auto; min-height:80vh;">
                <header style="text-align:center; margin-bottom: 60px;">
                    <h1 style="font-size: 3.5rem; color: white; margin-bottom:15px; font-family:'Outfit', sans-serif;">${I18n.t('marketplace_title')} <span style="color:#60a5fa">${I18n.t('marketplace_title_span')}</span></h1>
                    <p style="color:#aaa; font-size:1.2rem; max-width:700px; margin:0 auto; line-height:1.6;">
                        ${I18n.t('marketplace_tagline')}
                    </p>
                </header>

                <div class="shop-index-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:30px;">
                    ${projetsShop.length > 0 ? projetsShop.map(p => `
                        <div class="shop-card" style="background:rgba(25,25,30,0.5); border:1px solid #333; border-radius:16px; overflow:hidden; transition:all 0.3s; position:relative;" onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='var(--primary)';" onmouseout="this.style.transform='none'; this.style.borderColor='#333';">
                            <img src="${p.couverture}" style="width:100%; height:320px; object-fit:cover;">
                            <div style="padding:20px; background:linear-gradient(to top, #000, transparent); margin-top:-100px; position:relative; z-index:2;">
                                <h3 style="color:white; font-size:1.3rem; margin-bottom:10px;">${Security.escapeHTML(p.titre)}</h3>
                                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                    ${p.hasPhysical ? `<span style="background:rgba(74,222,128,0.1); color:#4ade80; border:1px solid #4ade80; font-size:0.7rem; padding:4px 10px; border-radius:30px; font-weight:bold;">${I18n.t('tag_physical')}</span>` : ''}
                                    ${p.hasOriginals ? `<span style="background:rgba(244,114,182,0.1); color:#f472b6; border:1px solid #f472b6; font-size:0.7rem; padding:4px 10px; border-radius:30px; font-weight:bold;">${I18n.t('tag_originals')}</span>` : ''}
                                </div>
                                <a href="/shop/${p.slug}" data-link class="btn-primary" style="display:block; text-align:center; margin-top:20px; padding:12px; font-weight:bold; font-size:0.9rem;">${I18n.t('btn_visit_shop')}</a>
                            </div>
                        </div>
                    `).join('') : `
                        <div style="grid-column: 1 / -1; text-align:center; padding:100px 0; color:#555;">
                            <span class="material-symbols-outlined" style="font-size:4rem; margin-bottom:20px;">storefront</span>
                            <p>${I18n.t('marketplace_coming_soon')}</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}
