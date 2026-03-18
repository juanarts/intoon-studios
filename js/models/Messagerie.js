export default class Messagerie {
    static init() {
        if (!localStorage.getItem('messages_db')) {
            const welcomeData = {
                conversations: [
                    {
                        id: 'conv-1',
                        interlocuteur: 'L\\'Équipe Intoon',
                        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Admin&backgroundColor=e50914',
                        messages: [
                            { id: 'm1', expediteur: 'L\\'Équipe Intoon', texte: 'Bienvenue sur la plateforme ! N\\'hésitez pas à nous contacter ici si vous avez des questions sur la publication de vos œuvres.', date: new Date(Date.now() - 86400000).toISOString() }
                        ],
                        nonLus: 1,
                        derniereActivite: new Date(Date.now() - 86400000).toISOString()
                    },
                    {
                        id: 'conv-2',
                        interlocuteur: 'Shadow Blade (Fan)',
                        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fan123',
                        messages: [
                            { id: 'm2', expediteur: 'Shadow Blade (Fan)', texte: 'Salut ! J\\'adore ton dernier chapitre, les décors sont fous !', date: new Date(Date.now() - 3600000).toISOString() }
                        ],
                        nonLus: 0,
                        derniereActivite: new Date(Date.now() - 3600000).toISOString()
                    }
                ]
            };
            localStorage.setItem('messages_db', JSON.stringify(welcomeData));
        }
    }

    static getConversations() {
        this.init();
        return JSON.parse(localStorage.getItem('messages_db')).conversations.sort((a,b) => new Date(b.derniereActivite) - new Date(a.derniereActivite));
    }

    static getTotalNonLus() {
        const convs = this.getConversations();
        return convs.reduce((total, c) => total + c.nonLus, 0);
    }

    static getConversation(id) {
        const convs = this.getConversations();
        return convs.find(c => c.id === id);
    }

    static marquerCommeLu(convId) {
        const data = JSON.parse(localStorage.getItem('messages_db'));
        const conv = data.conversations.find(c => c.id === convId);
        if (conv) {
            conv.nonLus = 0;
            localStorage.setItem('messages_db', JSON.stringify(data));
        }
    }

    static envoyerMessage(convId, texte) {
        const data = JSON.parse(localStorage.getItem('messages_db'));
        const conv = data.conversations.find(c => c.id === convId);
        
        if (conv) {
            const newMsg = {
                id: 'msg-' + Date.now(),
                expediteur: 'Vous',
                texte: texte,
                date: new Date().toISOString()
            };
            conv.messages.push(newMsg);
            conv.derniereActivite = new Date().toISOString();
            localStorage.setItem('messages_db', JSON.stringify(data));
            return newMsg;
        }
        return null;
    }
}
