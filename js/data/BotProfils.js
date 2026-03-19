/**
 * BotProfils — Profils statiques des bots de test INTOON STUDIOS
 * Ces profils sont visibles publiquement via /profil/bot-xxx
 * Pas de compte Supabase nécessaire — données en dur.
 */
const BOT_PROFILS = {
    'bot-intoon': {
        id: 'bot-intoon',
        pseudo: "L'Équipe Intoon",
        role: 'admin',
        isBot: true,
        botType: 'team',
        avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=IntoonTeam&backgroundColor=e50914',
        bio: "Compte officiel de l'équipe INTOON STUDIOS 🛡️ Annonces, rappels et support créateur. Pour nous contacter, utilisez la messagerie interne.",
        genres_preferes: ['Action', 'Aventure', 'Sci-Fi', 'Fantaisie'],
        style_musique: ['Hip-Hop', 'Électro', 'Lo-fi'],
        stats: { commentaires: 120, heuresLues: 0, projetsCreer: 0, chapitresPublies: 0 },
        badges_ids: ['intoon_team', 'moderateur', 'vip'],
    },
    'bot-shadowfan': {
        id: 'bot-shadowfan',
        pseudo: 'ShadowFan_42',
        role: 'lecteur',
        isBot: true,
        botType: 'visitor',
        avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ShadowFan42',
        bio: "Fan de webtoon depuis toujours 🔥 J'adore les univers sombres, l'action et les twists inattendus. Toujours là pour hype les créateurs !",
        genres_preferes: ['Action', 'Horreur', 'Mystère'],
        style_musique: ['Trap', 'Rock', 'Hip-Hop'],
        stats: { commentaires: 34, heuresLues: 87, projetsCreer: 0, chapitresPublies: 0 },
        badges_ids: ['lecteur', 'nouveau'],
    },
    'bot-nightowl': {
        id: 'bot-nightowl',
        pseudo: 'NightOwlReader',
        role: 'nouveau',
        isBot: true,
        botType: 'visitor',
        avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NightOwl99',
        bio: "🦉 Découverte récente de la plateforme. Amateur de webtoon depuis mes débuts. Je lis surtout la nuit, mais ça c'est mon secret !",
        genres_preferes: ['Slice of Life', 'Romance', 'Comédie'],
        style_musique: ['Lo-fi', 'Jazz', 'Classique'],
        stats: { commentaires: 2, heuresLues: 8, projetsCreer: 0, chapitresPublies: 0 },
        badges_ids: ['nouveau'],
    },
};

export default BOT_PROFILS;
