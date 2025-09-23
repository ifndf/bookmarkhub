/**
 * BookmarkHub 工具函数库
 * @author Travis
 * @version 2.0.0
 */

import { APP_CONFIG, THEME_CONFIG } from './config.js';

/**
 * 日期时间工具
 */
export const DateUtils = {
    /**
     * 格式化相对时间
     * @param {number} timestamp - 时间戳
     * @returns {string} 格式化的相对时间
     */
    formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return new Date(timestamp).toLocaleDateString('zh-CN');
    },

    /**
     * 获取当前日期字符串
     * @returns {string} YYYY-MM-DD格式的日期
     */
    getCurrentDateString() {
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * URL工具
 */
export const UrlUtils = {
    /**
     * 验证URL格式
     * @param {string} url - 要验证的URL
     * @returns {boolean} 是否为有效URL
     */
    isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return APP_CONFIG.REGEX.URL.test(url);
    },

    /**
     * 标准化URL
     * @param {string} url - 原始URL
     * @returns {string} 标准化后的URL
     */
    normalizeUrl(url) {
        if (!url) return '';
        
        // 如果没有协议，默认添加https://
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        
        try {
            const urlObj = new URL(url);
            return urlObj.href;
        } catch {
            return url;
        }
    },

    /**
     * 提取域名
     * @param {string} url - URL
     * @returns {string} 域名
     */
    extractDomain(url) {
        const match = url.match(APP_CONFIG.REGEX.DOMAIN);
        return match ? match[1] : '';
    },

    /**
     * 获取网站图标URL
     * @param {string} url - 网站URL
     * @returns {string} 图标URL
     */
    getFaviconUrl(url) {
        const domain = this.extractDomain(url);
        return domain ? `${APP_CONFIG.API.FAVICON_SERVICE}${domain}` : '';
    }
};

/**
 * DOM工具
 */
export const DomUtils = {
    /**
     * 安全地获取DOM元素
     * @param {string} selector - CSS选择器
     * @returns {Element|null} DOM元素
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * 获取多个DOM元素
     * @param {string} selector - CSS选择器
     * @returns {NodeList} DOM元素列表
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * 创建DOM元素
     * @param {string} tag - 标签名
     * @param {Object} options - 选项
     * @returns {Element} 创建的DOM元素
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) element.className = options.className;
        if (options.id) element.id = options.id;
        if (options.innerHTML) element.innerHTML = options.innerHTML;
        if (options.textContent) element.textContent = options.textContent;
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.styles) {
            Object.assign(element.style, options.styles);
        }
        
        return element;
    },

    /**
     * 检测是否为移动设备
     * @returns {boolean} 是否为移动设备
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * 检测屏幕宽度是否为移动端
     * @returns {boolean} 是否为移动端屏幕
     */
    isMobileScreen() {
        return window.innerWidth <= THEME_CONFIG.BREAKPOINTS.MOBILE;
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * 数据工具
 */
export const DataUtils = {
    /**
     * 深拷贝对象
     * @param {any} obj - 要拷贝的对象
     * @returns {any} 拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            Object.keys(obj).forEach(key => {
                clonedObj[key] = this.deepClone(obj[key]);
            });
            return clonedObj;
        }
    },

    /**
     * 生成UUID
     * @returns {string} UUID字符串
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 验证数据结构
     * @param {any} data - 要验证的数据
     * @param {Object} schema - 验证模式
     * @returns {boolean} 是否通过验证
     */
    validateSchema(data, schema) {
        if (!data || typeof data !== 'object') return false;
        
        for (const [key, validator] of Object.entries(schema)) {
            if (validator.required && !(key in data)) return false;
            if (key in data && validator.type && typeof data[key] !== validator.type) return false;
        }
        
        return true;
    },

    /**
     * 过滤和清理数据
     * @param {string} text - 要清理的文本
     * @returns {string} 清理后的文本
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        return text.trim().replace(/[<>]/g, '');
    }
};

/**
 * 存储工具
 */
export const StorageUtils = {
    /**
     * 安全地从localStorage获取数据
     * @param {string} key - 存储键
     * @param {any} defaultValue - 默认值
     * @returns {any} 存储的数据或默认值
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`读取存储数据失败 [${key}]:`, error);
            return defaultValue;
        }
    },

    /**
     * 安全地向localStorage存储数据
     * @param {string} key - 存储键
     * @param {any} value - 要存储的值
     * @returns {boolean} 是否存储成功
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`存储数据失败 [${key}]:`, error);
            return false;
        }
    },

    /**
     * 删除存储数据
     * @param {string} key - 存储键
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`删除存储数据失败 [${key}]:`, error);
        }
    },

    /**
     * 清空所有应用相关的存储数据
     */
    clearAppData() {
        Object.values(APP_CONFIG.STORAGE_KEYS).forEach(key => {
            this.remove(key);
        });
    }
};

/**
 * 文件工具
 */
export const FileUtils = {
    /**
     * 下载文件
     * @param {string} content - 文件内容
     * @param {string} filename - 文件名
     * @param {string} mimeType - MIME类型
     */
    downloadFile(content, filename, mimeType = 'application/json') {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('文件下载失败:', error);
            return false;
        }
    },

    /**
     * 读取文件内容
     * @param {File} file - 文件对象
     * @returns {Promise<string>} 文件内容
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('无效的文件'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }
};

/**
 * 性能监控工具
 */
export const PerformanceUtils = {
    /**
     * 测量函数执行时间
     * @param {Function} func - 要测量的函数
     * @param {string} label - 标签
     * @returns {any} 函数返回值
     */
    measureTime(func, label = 'Function') {
        const start = performance.now();
        const result = func();
        const end = performance.now();
        
        if (APP_CONFIG.DEV_CONFIG?.DEBUG) {
            console.log(`⏱️ ${label} 执行时间: ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
    },

    /**
     * 异步函数执行时间测量
     * @param {Function} asyncFunc - 异步函数
     * @param {string} label - 标签
     * @returns {Promise<any>} 函数返回值
     */
    async measureAsyncTime(asyncFunc, label = 'Async Function') {
        const start = performance.now();
        const result = await asyncFunc();
        const end = performance.now();
        
        if (APP_CONFIG.DEV_CONFIG?.DEBUG) {
            console.log(`⏱️ ${label} 执行时间: ${(end - start).toFixed(2)}ms`);
        }
        
        return result;
    }
};
