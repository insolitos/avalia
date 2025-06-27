const CACHE_NAME = 'portugues-app-cache-v1';
const urlsToCache = [
    '/',
    'index.html'
];

// Instalação do Service Worker: Abrir o cache e adicionar os URLs base
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento Fetch: Tenta ir à rede primeiro, se falhar, vai ao cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Verifica se recebemos uma resposta válida
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Importante: Clona a resposta. Uma stream só pode ser consumida uma vez.
                // Precisamos de uma para o browser usar e outra para colocar no cache.
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Se a rede falhar, tenta obter do cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        // Se não estiver no cache e a rede falhou, pode retornar uma página offline padrão (opcional)
                    });
            })
    );
});

// Ativação do Service Worker: Limpar caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
