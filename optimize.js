// 性能优化脚本
(function() {
    'use strict';
    
    // 1. 延迟加载非关键CSS
    function loadCSS(href, media) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = media || 'all';
        document.head.appendChild(link);
    }
    
    // 2. 图片懒加载
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // 3. 预加载关键资源
    function preloadResources() {
        const criticalResources = [
            { href: 'styles.css', as: 'style' },
            { href: 'script.js', as: 'script' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = function() {
                    this.rel = 'stylesheet';
                };
            }
            document.head.appendChild(link);
        });
    }
    
    // 4. 代码分割和动态导入
    async function loadModuleOnDemand(moduleName) {
        try {
            const module = await import(`./src/${moduleName}.js`);
            return module;
        } catch (error) {
            console.error(`Failed to load module ${moduleName}:`, error);
        }
    }
    
    // 5. 服务工作者注册（PWA支持）
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }
    
    // 6. 性能监控
    function performanceMonitor() {
        // 首次内容绘制
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                console.log(`${entry.name}: ${entry.startTime}ms`);
            });
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // 页面加载完成时间
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
        });
    }
    
    // 7. 资源优先级提示
    function setResourcePriority() {
        // 为关键资源设置高优先级
        const criticalLinks = document.querySelectorAll('link[rel="preload"]');
        criticalLinks.forEach(link => {
            if (link.as === 'style' || link.as === 'script') {
                link.setAttribute('importance', 'high');
            }
        });
    }
    
    // 初始化优化
    function init() {
        // DOM加载完成后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                lazyLoadImages();
                performanceMonitor();
                setResourcePriority();
            });
        } else {
            lazyLoadImages();
            performanceMonitor();
            setResourcePriority();
        }
        
        // 页面加载完成后执行
        window.addEventListener('load', () => {
            registerServiceWorker();
        });
    }
    
    // 导出优化工具
    window.PerformanceOptimizer = {
        loadCSS,
        lazyLoadImages,
        preloadResources,
        loadModuleOnDemand,
        registerServiceWorker,
        performanceMonitor,
        init
    };
    
    // 自动初始化
    init();
})();
