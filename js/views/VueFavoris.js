import I18n from '../utils/I18n.js';

export default class VueFavoris {
    
    /**
     * Statut Vide de "Ma Liste"
     */
    static rendreVide() {
        return `
            <div class="favoris-vide" style="text-align:center; padding: 15vh 4%; animation: fadeIn 1s ease-out;">
                <h1 style="font-size:3rem; margin-bottom: 20px;">${I18n.t('fav_empty_title')}</h1>
                <p style="font-size:1.2rem; color:var(--text-muted); margin-bottom: 40px;">${I18n.t('fav_empty_text')}</p>
                <a href="/" data-link class="btn-primary" style="font-size:1.1rem; padding: 15px 30px;">${I18n.t('fav_btn_discover')}</a>
            </div>
        `;
    }

    /**
     * Grille de "Ma Liste" identique au design Netflix
     */
    static rendreListe(projets) {
        const titre = `<h1 class="page-title">${I18n.t('fav_page_title')}</h1>`;
        
        const grille = projets.map(projet => `
            <div class="projet-card">
                <a href="/projet/${projet.slug}" data-link class="projet-link">
                    <img class="projet-cover" src="${projet.couverture}" alt="${projet.titre}">
                    <div class="projet-info">
                        <h3>${projet.titre}</h3>
                    </div>
                </a>
            </div>
        `).join('');

        return `
            ${titre}
            <div class="catalogue-grid" style="animation: fadeIn 0.5s ease-out;">
                ${grille}
            </div>
        `;
    }
}
