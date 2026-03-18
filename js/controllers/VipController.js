import VueVip from '../views/VueVip.js';

export default class VipController {
    static afficher() {
        const app = document.getElementById('app');
        app.innerHTML = VueVip.rendre();
        
        // Animations subtiles optionnelles
        window.scrollTo(0, 0);
    }
}
