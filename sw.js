const CACHE_NAME = 'intoon-cache-v1';
const DYNAMIC_CACHE = 'intoon-dynamic-v1';

// Fichiers critiques à mettre en cache lors de l'installation (App Shell)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/Router.js',
    '/assets/favicon.png'
    // Idéalement on rajouterait tous les JS des views/controllers ici
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Mise en cache du Shell');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            );
        })
    );
    return self.clients.claim();
});

// Stratégie de requête (Fetch)
self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Ne pas cacher les appels API Supabase (Base de données / Auth)
    if (url.hostname.includes('supabase.co') && !url.pathname.includes('/storage/v1/object/public/')) {
        return; // Laisse passer le réseau direct
    }

    // Stratégie "Cache First" pour les images Webtoon (hébergées sur Supabase Storage ou autres)
    // Utile pour la lecture Hors-Ligne
    if (req.destination === 'image') {
        event.respondWith(
            caches.match(req).then((cachedRes) => {
                if (cachedRes) return cachedRes;
                
                return fetch(req).then((networkRes) => {
                    return caches.open(DYNAMIC_CACHE).then((cache) => {
                        // On clone la réponse pour la mettre en cache
                        cache.put(req, networkRes.clone());
                        limitCacheSize(DYNAMIC_CACHE, 200); // Limite à ~200 planches pour ne pas saturer le stockage
                        return networkRes;
                    });
                }).catch(() => {
                    // Fallback (ex: image d'erreur hors ligne)
                });
            })
        );
        return;
    }

    // Stratégie "Stale While Revalidate" pour les données JSON ou les autres requêtes HTML/JS
    event.respondWith(
        caches.match(req).then((cachedRes) => {
            const fetchPromise = fetch(req).then((networkRes) => {
                caches.open(CACHE_NAME).then((cache) => {
                    if(req.method === 'GET' && !req.url.startsWith('chrome-extension')) {
                        cache.put(req, networkRes.clone());
                    }
                });
                return networkRes;
            }).catch(() => {
                // Si on est hors ligne, on retourne la vue shell index.html pour les routes du routeur JS
                if (req.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });

            return cachedRes || fetchPromise;
        })
    );
});

// Fonction utilitaire pour limiter la taille du cache des images (LRU - Least Recently Used approximatif)
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(() => limitCacheSize(name, size));
            }
        });
    });
};
