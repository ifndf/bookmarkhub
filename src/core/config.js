/**
 * BookmarkHub 应用配置
 * @author Travis
 * @version 2.0.0
 */

export const APP_CONFIG = {
    // 应用信息
    APP_NAME: 'BookmarkHub',
    VERSION: '2.0.0',
    
    // 存储键名
    STORAGE_KEYS: {
        BOOKMARKS: 'bookmarkhub_bookmarks',
        CATEGORIES: 'bookmarkhub_categories',
        PRIVACY_BOOKMARKS: 'bookmarkhub_privacy_bookmarks',
        PRIVACY_CATEGORIES: 'bookmarkhub_privacy_categories',
        PRIVACY_PASSWORD: 'bookmarkhub_privacy_password'
    },
    
    // 分页配置
    PAGINATION: {
        ITEMS_PER_PAGE: 30,
        MAX_VISIBLE_CATEGORIES: {
            MOBILE: 3,
            DESKTOP: 5
        }
    },
    
    // UI配置
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        LONG_PRESS_DURATION: 500,
        SEARCH_DEBOUNCE: 300
    },
    
    // 默认分类
    DEFAULT_CATEGORIES: [
        { id: 'work', name: '工作', color: '#2196F3' },
        { id: 'study', name: '学习', color: '#4CAF50' },
        { id: 'entertainment', name: '娱乐', color: '#FF9800' },
        { id: 'tools', name: '工具', color: '#9C27B0' },
        { id: 'news', name: '资讯', color: '#F44336' }
    ],
    
    // API配置
    API: {
        FAVICON_SERVICE: 'https://www.google.com/s2/favicons?domain=',
        FAVICON_FALLBACK: 'fas fa-globe'
    },
    
    // 正则表达式
    REGEX: {
        URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        DOMAIN: /^(?:https?:\/\/)?(?:www\.)?([^\/]+)/
    },
    
    // 文件配置
    FILE: {
        BACKUP_PREFIX: 'bookmarkhub-backup-',
        ALLOWED_TYPES: ['application/json'],
        MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
    }
};

// 主题配置
export const THEME_CONFIG = {
    COLORS: {
        PRIMARY: '#2196F3',
        SUCCESS: '#4CAF50',
        WARNING: '#FF9800',
        ERROR: '#F44336',
        INFO: '#00BCD4'
    },
    
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024,
        DESKTOP: 1200
    }
};

// 开发配置
export const DEV_CONFIG = {
    DEBUG: false,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    ENABLE_PERFORMANCE_MONITORING: false
};
