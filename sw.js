// Service Worker for BookmarkHub
const CACHE_NAME = 'bookmarkhub-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './optimize.js',
    // 模块化文件
    './src/core/app.js',
    './src/core/config.js',
    './src/core/utils.js',
    './src/data/storage.js',
    './src/models/bookmark.js',
    './src/models/category.js',
    './src/services/bookmark-service.js',
    './src/services/category-service.js',
    './src/services/privacy-service.js',
    './src/services/search-service.js',
    // CSS模块
    './src/styles/base/reset.css',
    './src/styles/base/variables.css',
    './src/styles/base/typography.css',
    './src/styles/components/buttons.css',
    './src/styles/components/cards.css',
    './src/styles/components/forms.css',
    './src/styles/components/modals.css',
    './src/styles/layout/header.css',
    './src/styles/layout/main.css',
    './src/styles/layout/grid.css'
];

// 安装事件 - 缓存资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 获取事件 - 提供缓存资源
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 如果缓存中有资源，返回缓存版本
                if (response) {
                    return response;
                }
                
                // 否则从网络获取
                return fetch(event.request).then((response) => {
                    // 检查响应是否有效
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // 克隆响应，因为响应流只能使用一次
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
