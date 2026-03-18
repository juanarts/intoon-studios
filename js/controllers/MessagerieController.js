import VueMessagerie from '../views/VueMessagerie.js';
import Messagerie from '../models/Messagerie.js';

export default class MessagerieController {
    static state = {
        activeConvId: null
    };

    static afficher() {
        const conversations = Messagerie.getConversations();
        
        // Par défaut, activer la première config non-lue ou la première tout court
        if (!this.state.activeConvId && conversations.length > 0) {
            const unread = conversations.find(c => c.nonLus > 0);
            this.state.activeConvId = unread ? unread.id : conversations[0].id;
        }

        const activeConv = this.state.activeConvId ? Messagerie.getConversation(this.state.activeConvId) : null;
        
        if (activeConv) {
            Messagerie.marquerCommeLu(activeConv.id);
            // Mets à jour l'icône globale dans la navbar eventuellement
            const navIcon = document.getElementById('nav-inbox-badge');
            if (navIcon) {
                const tot = Messagerie.getTotalNonLus();
                navIcon.style.display = tot > 0 ? 'flex' : 'none';
                navIcon.innerText = tot;
            }
        }

        const app = document.getElementById('app');
        app.innerHTML = VueMessagerie.rendre(conversations, activeConv);

        this.attacherEvenements();
        this.scrollBottom();
        window.scrollTo(0, 0);
    }

    static attacherEvenements() {
        // Clics sur les conversations
        const items = document.querySelectorAll('.conv-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                this.state.activeConvId = e.currentTarget.dataset.id;
                this.afficher();
            });
        });

        // Envoi de message
        const formMsg = document.getElementById('form-message');
        if (formMsg) {
            formMsg.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('input-new-msg');
                const texte = input.value.trim();
                if (texte && this.state.activeConvId) {
                    Messagerie.envoyerMessage(this.state.activeConvId, texte);
                    this.afficher(); // Re-render pour afficher la bulle !
                }
            });
        }
    }

    static scrollBottom() {
        const container = document.getElementById('chat-messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
}
