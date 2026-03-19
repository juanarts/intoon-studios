export default class Messagerie {
    static init() {
        if (!localStorage.getItem('messages_db')) {
            const welcomeData = {
                conversations: [
                    {
                        id: 'conv-1',
                        idUtilisateur: 'bot-intoon',
                        interlocuteur: "L'Équipe Intoon 🛡️",
                        avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=IntoonTeam&backgroundColor=e50914',
                        badge: 'intoon_team',
                        messages: [
                            { id: 'm1', expediteur: "L'Équipe Intoon 🛡️", texte: "Bienvenue sur la plateforme ! N'hésitez pas à nous contacter ici si vous avez des questions sur la publication de vos œuvres.", date: new Date(Date.now() - 86400000).toISOString() },
                            { id: 'm2', expediteur: "L'Équipe Intoon 🛡️", texte: "📢 Rappel : format recommandé pour vos planches — paysage 1400×900px, 3 Mo max. Bonne création ! 🎨", date: new Date(Date.now() - 43200000).toISOString() }
                        ],
                        nonLus: 1,
                        derniereActivite: new Date(Date.now() - 43200000).toISOString()
                    },
                    {
                        id: 'conv-2',
                        idUtilisateur: 'bot-shadowfan',
                        interlocuteur: 'ShadowFan_42 👤',
                        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ShadowFan42',
                        badge: 'lecteur',
                        messages: [
                            { id: 'm3', expediteur: 'ShadowFan_42 👤', texte: "Salut ! J'adore ton style graphique, les personnages sont incroyables 🔥", date: new Date(Date.now() - 7200000).toISOString() },
                            { id: 'm4', expediteur: 'ShadowFan_42 👤', texte: "T'as prévu de sortir le chapitre 2 quand ? j'arrive pas à attendre 😭", date: new Date(Date.now() - 3600000).toISOString() },
                            { id: 'm5', expediteur: 'ShadowFan_42 👤', texte: "Est-ce qu'on peut te soutenir quelque part ? Patreon ou autre ?", date: new Date(Date.now() - 1800000).toISOString() }
                        ],
                        nonLus: 2,
                        derniereActivite: new Date(Date.now() - 1800000).toISOString()
                    },
                    {
                        id: 'conv-3',
                        idUtilisateur: 'bot-nightowl',
                        interlocuteur: 'NightOwlReader 🦉',
                        avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NightOwl99',
                        badge: 'nouveau',
                        messages: [
                            { id: 'm6', expediteur: 'NightOwlReader 🦉', texte: "Hey ! je viens de découvrir la plateforme, je suis fan de webtoon depuis toujours !", date: new Date(Date.now() - 300000).toISOString() }
                        ],
                        nonLus: 1,
                        derniereActivite: new Date(Date.now() - 300000).toISOString()
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
