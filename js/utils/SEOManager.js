export default class SEOManager {
    /**
     * Met à jour les balises Meta et OpenGraph pour le SEO
     * @param {Object} data 
     * @param {String} data.title Titre de la page
     * @param {String} data.description Description courte
     * @param {String} data.image URL de l'image (couverture ou vignette)
     * @param {String} data.url URL absolue de la page (optionnel)
     */
    static update({ title, description, image, url }) {
        // Fallbacks par défaut
        const finalTitle = title ? `${title} - INTOON STUDIOS` : 'INTOON STUDIOS - Le Meilleur du Webtoon Original';
        const finalDesc = description || 'Lisez des webtoons originaux et de qualité. Action, Romance, et Fantaisie en avant-première.';
        const finalImg = image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=1200&q=80';
        const finalUrl = url || window.location.href;

        // Mise à jour classique
        document.title = finalTitle;
        const metaDesc = document.getElementById('meta-desc');
        if (metaDesc) metaDesc.content = finalDesc;

        // Mise à jour OpenGraph (Facebook, Twitter, Discord, etc.)
        const ogTitle = document.getElementById('og-title');
        if (ogTitle) ogTitle.content = finalTitle;

        const ogDesc = document.getElementById('og-desc');
        if (ogDesc) ogDesc.content = finalDesc;

        const ogImage = document.getElementById('og-image');
        if (ogImage) ogImage.content = finalImg;

        const ogUrl = document.getElementById('og-url');
        if (ogUrl) ogUrl.content = finalUrl;
    }
}
