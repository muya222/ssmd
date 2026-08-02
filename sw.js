// sw.js - 水母岛 Service Worker
const CACHE_NAME = 'jellyfish-island-v1';

// 安装时缓存核心资源
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll([
            './',
            './index.html',
            './manifest.json',
            './icons/icon-192.png',
            './icons/icon-1024.png'
        ]).catch(() => {}))
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// 网络优先，失败时回退缓存
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request).then(res => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy)).catch(() => {});
            return res;
        }).catch(() => caches.match(e.request).then(r => r || caches.match('./')))
    );
});
