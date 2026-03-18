export default class Likes {
    /**
     * @returns {Boolean} Vrai si le visiteur a liké(coeur) ce webtoon
     */
    static aLike(idProjet) {
        const likes = JSON.parse(localStorage.getItem('intoon_likes') || '[]');
        return likes.includes(idProjet);
    }

    /**
     * @returns {Boolean} Le nouvel état (true si liké, false si enlevé)
     */
    static basculerLike(idProjet) {
        let likes = JSON.parse(localStorage.getItem('intoon_likes') || '[]');
        const index = likes.indexOf(idProjet);
        
        if (index > -1) {
            likes.splice(index, 1);
            localStorage.setItem('intoon_likes', JSON.stringify(likes));
            return false;
        } else {
            likes.push(idProjet);
            localStorage.setItem('intoon_likes', JSON.stringify(likes));
            return true;
        }
    }
}
