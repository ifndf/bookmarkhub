/**
 * BookmarkHub 应用主入口
 * @author Travis
 * @version 2.0.0
 */

import { APP_CONFIG } from './config.js';
import { storageManager } from '../data/storage.js';
import { BookmarkService } from '../services/bookmark-service.js';
import { CategoryService } from '../services/category-service.js';
import { SearchService } from '../services/search-service.js';
import { PrivacyService } from '../services/privacy-service.js';
import { MainView } from '../ui/views/main-view.js';
import { PrivacyView } from '../ui/views/privacy-view.js';
import { GlobalEvents } from '../ui/events/global-events.js';
import { Toast } from '../ui/components/toast.js';

/**
 * BookmarkHub 主应用类
 */
export class BookmarkHub {
    constructor() {
        // 应用状态
        this.isInitialized = false;
        this.isPrivacyMode = false;
        
        // 服务实例
        this.bookmarkService = null;
        this.categoryService = null;
        this.searchService = null;
        this.privacyService = null;
        
        // UI实例
        this.mainView = null;
        this.privacyView = null;
        this.globalEvents = null;
        this.toast = null;
        
        // 分页状态
        this.currentPage = 1;
        this.privacyCurrentPage = 1;
        
        console.log(`🚀 BookmarkHub v${APP_CONFIG.VERSION} 正在初始化...`);
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.time('应用初始化');
            
            // 1. 初始化存储管理器
            storageManager.init();
            
            // 2. 初始化服务层
            await this.initServices();
            
            // 3. 初始化UI层
            await this.initUI();
            
            // 4. 绑定全局事件
            this.initGlobalEvents();
            
            // 5. 渲染初始界面
            await this.render();
            
            // 6. 设置应用状态
            this.isInitialized = true;
            
            console.timeEnd('应用初始化');
            console.log('✅ BookmarkHub 初始化完成');
            
            // 显示欢迎消息
            this.toast.show('欢迎使用 BookmarkHub 书签管理！', 'info');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            this.handleInitError(error);
        }
    }

    /**
     * 初始化服务层
     */
    async initServices() {
        this.bookmarkService = new BookmarkService(storageManager);
        this.categoryService = new CategoryService(storageManager);
        this.searchService = new SearchService();
        this.privacyService = new PrivacyService(storageManager);
        
        // 服务间依赖注入
        this.searchService.setBookmarkService(this.bookmarkService);
        this.searchService.setCategoryService(this.categoryService);
        
        console.log('📋 服务层初始化完成');
    }

    /**
     * 初始化UI层
     */
    async initUI() {
        // 初始化Toast组件
        this.toast = new Toast();
        
        // 初始化主视图
        this.mainView = new MainView({
            bookmarkService: this.bookmarkService,
            categoryService: this.categoryService,
            searchService: this.searchService,
            toast: this.toast
        });
        
        // 初始化隐私空间视图
        this.privacyView = new PrivacyView({
            privacyService: this.privacyService,
            toast: this.toast
        });
        
        console.log('🎨 UI层初始化完成');
    }

    /**
     * 初始化全局事件
     */
    initGlobalEvents() {
        this.globalEvents = new GlobalEvents(this);
        this.globalEvents.init();
        
        // 监听存储变化
        storageManager.addEventListener('bookmarksChanged', () => {
            if (!this.isPrivacyMode) {
                this.mainView.refreshBookmarks();
            }
        });
        
        storageManager.addEventListener('categoriesChanged', () => {
            if (!this.isPrivacyMode) {
                this.mainView.refreshCategories();
            }
        });
        
        storageManager.addEventListener('privacyBookmarksChanged', () => {
            if (this.isPrivacyMode) {
                this.privacyView.refreshBookmarks();
            }
        });
        
        storageManager.addEventListener('privacyCategoriesChanged', () => {
            if (this.isPrivacyMode) {
                this.privacyView.refreshCategories();
            }
        });
        
        console.log('🔗 全局事件初始化完成');
    }

    /**
     * 渲染应用界面
     */
    async render() {
        if (this.isPrivacyMode) {
            await this.privacyView.render();
        } else {
            await this.mainView.render();
        }
    }

    /**
     * 切换到隐私空间
     * @param {string} password - 隐私空间密码
     */
    async enterPrivacyMode(password) {
        try {
            const success = await this.privacyService.authenticate(password);
            if (success) {
                this.isPrivacyMode = true;
                this.privacyCurrentPage = 1;
                await this.render();
                this.toast.show('已进入隐私空间', 'success');
                return true;
            } else {
                this.toast.show('密码错误，请重试', 'error');
                return false;
            }
        } catch (error) {
            console.error('进入隐私空间失败:', error);
            this.toast.show('进入隐私空间失败', 'error');
            return false;
        }
    }

    /**
     * 退出隐私空间
     */
    async exitPrivacyMode() {
        this.isPrivacyMode = false;
        this.currentPage = 1;
        await this.render();
        this.toast.show('已退出隐私空间', 'info');
    }

    /**
     * 获取当前书签服务
     * @returns {BookmarkService|PrivacyService} 书签服务
     */
    getCurrentBookmarkService() {
        return this.isPrivacyMode ? this.privacyService : this.bookmarkService;
    }

    /**
     * 获取当前分类服务
     * @returns {CategoryService|PrivacyService} 分类服务
     */
    getCurrentCategoryService() {
        return this.isPrivacyMode ? this.privacyService : this.categoryService;
    }

    /**
     * 获取当前页码
     * @returns {number} 当前页码
     */
    getCurrentPage() {
        return this.isPrivacyMode ? this.privacyCurrentPage : this.currentPage;
    }

    /**
     * 设置当前页码
     * @param {number} page - 页码
     */
    setCurrentPage(page) {
        if (this.isPrivacyMode) {
            this.privacyCurrentPage = page;
        } else {
            this.currentPage = page;
        }
    }

    /**
     * 处理初始化错误
     * @param {Error} error - 错误对象
     */
    handleInitError(error) {
        // 创建简单的错误提示界面
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: #f5f5f5;
                font-family: Arial, sans-serif;
                color: #333;
            ">
                <div style="
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    max-width: 500px;
                ">
                    <h2 style="color: #f44336; margin-bottom: 1rem;">
                        ❌ 应用初始化失败
                    </h2>
                    <p style="margin-bottom: 1rem; line-height: 1.6;">
                        BookmarkHub 无法正常启动，这可能是由于浏览器兼容性或存储权限问题导致的。
                    </p>
                    <details style="margin-bottom: 1rem; text-align: left;">
                        <summary style="cursor: pointer; color: #666;">查看错误详情</summary>
                        <pre style="
                            background: #f5f5f5;
                            padding: 1rem;
                            border-radius: 4px;
                            margin-top: 0.5rem;
                            font-size: 12px;
                            overflow: auto;
                        ">${error.stack || error.message}</pre>
                    </details>
                    <button onclick="location.reload()" style="
                        background: #2196f3;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        重新加载
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 销毁应用实例
     */
    destroy() {
        if (this.globalEvents) {
            this.globalEvents.destroy();
        }
        
        if (this.mainView) {
            this.mainView.destroy();
        }
        
        if (this.privacyView) {
            this.privacyView.destroy();
        }
        
        console.log('🗑️ BookmarkHub 应用已销毁');
    }

    /**
     * 获取应用信息
     * @returns {Object} 应用信息
     */
    getAppInfo() {
        return {
            name: APP_CONFIG.APP_NAME,
            version: APP_CONFIG.VERSION,
            isInitialized: this.isInitialized,
            isPrivacyMode: this.isPrivacyMode,
            storageStats: storageManager.getStorageStats()
        };
    }
}

// 创建全局应用实例
let appInstance = null;

/**
 * 获取应用实例
 * @returns {BookmarkHub} 应用实例
 */
export function getApp() {
    if (!appInstance) {
        appInstance = new BookmarkHub();
    }
    return appInstance;
}

/**
 * 初始化应用
 * @returns {Promise<BookmarkHub>} 应用实例
 */
export async function initApp() {
    const app = getApp();
    if (!app.isInitialized) {
        await app.init();
    }
    return app;
}

// 导出默认实例
export default getApp();
