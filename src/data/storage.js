/**
 * 数据存储管理模块
 * @author Travis
 * @version 2.0.0
 */

import { APP_CONFIG } from '../core/config.js';
import { StorageUtils, DataUtils } from '../core/utils.js';
import { Bookmark } from '../models/bookmark.js';
import { Category } from '../models/category.js';

/**
 * 存储管理器类
 */
export class StorageManager {
    constructor() {
        this.listeners = new Map(); // 事件监听器
    }

    /**
     * 添加数据变化监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * 移除数据变化监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {any} data - 事件数据
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件监听器执行错误 [${event}]:`, error);
                }
            });
        }
    }

    /**
     * 初始化存储数据
     */
    init() {
        // 如果没有数据，创建默认数据
        if (!this.hasData()) {
            this.createDefaultData();
        }
        
        // 数据迁移和修复
        this.migrateData();
        this.repairData();
        
        console.log('📦 存储管理器初始化完成');
    }

    /**
     * 检查是否有存储数据
     * @returns {boolean} 是否有数据
     */
    hasData() {
        return StorageUtils.get(APP_CONFIG.STORAGE_KEYS.BOOKMARKS) !== null ||
               StorageUtils.get(APP_CONFIG.STORAGE_KEYS.CATEGORIES) !== null;
    }

    /**
     * 创建默认数据
     */
    createDefaultData() {
        const defaultCategories = Category.createDefaults();
        this.saveCategories(defaultCategories);
        this.saveBookmarks([]);
        
        console.log('📝 创建默认数据完成');
    }

    /**
     * 数据迁移
     */
    migrateData() {
        // 这里可以添加版本升级时的数据迁移逻辑
        const version = StorageUtils.get('app_version', '1.0.0');
        
        if (version !== APP_CONFIG.VERSION) {
            console.log(`🔄 数据迁移: ${version} -> ${APP_CONFIG.VERSION}`);
            
            // 执行迁移逻辑
            this.performMigration(version, APP_CONFIG.VERSION);
            
            // 更新版本号
            StorageUtils.set('app_version', APP_CONFIG.VERSION);
        }
    }

    /**
     * 执行数据迁移
     * @param {string} fromVersion - 源版本
     * @param {string} toVersion - 目标版本
     */
    performMigration(fromVersion, toVersion) {
        // 根据版本执行不同的迁移逻辑
        // 这里可以添加具体的迁移代码
    }

    /**
     * 修复数据完整性
     */
    repairData() {
        try {
            const bookmarks = this.loadBookmarks();
            const categories = this.loadCategories();
            
            // 修复孤立的书签
            const validCategoryIds = new Set(['', null, ...categories.map(c => c.id)]);
            let repairCount = 0;
            
            bookmarks.forEach(bookmark => {
                if (bookmark.categoryId && !validCategoryIds.has(bookmark.categoryId)) {
                    bookmark.categoryId = null;
                    repairCount++;
                }
            });
            
            if (repairCount > 0) {
                this.saveBookmarks(bookmarks);
                console.log(`🔧 修复了 ${repairCount} 个孤立书签`);
            }
            
            // 更新分类的书签数量
            this.updateCategoryBookmarkCounts(categories, bookmarks);
            
        } catch (error) {
            console.error('数据修复失败:', error);
        }
    }

    /**
     * 更新分类的书签数量
     * @param {Array<Category>} categories - 分类数组
     * @param {Array<Bookmark>} bookmarks - 书签数组
     */
    updateCategoryBookmarkCounts(categories, bookmarks) {
        const countMap = new Map();
        
        // 统计每个分类的书签数量
        bookmarks.forEach(bookmark => {
            const categoryId = bookmark.categoryId || 'uncategorized';
            countMap.set(categoryId, (countMap.get(categoryId) || 0) + 1);
        });
        
        // 更新分类的书签数量
        categories.forEach(category => {
            const count = countMap.get(category.id) || 0;
            if (category.bookmarkCount !== count) {
                category.updateBookmarkCount(count);
            }
        });
        
        this.saveCategories(categories);
    }

    // ==================== 书签数据操作 ====================

    /**
     * 加载书签数据
     * @param {boolean} isPrivate - 是否为隐私书签
     * @returns {Array<Bookmark>} 书签数组
     */
    loadBookmarks(isPrivate = false) {
        const storageKey = isPrivate 
            ? APP_CONFIG.STORAGE_KEYS.PRIVACY_BOOKMARKS 
            : APP_CONFIG.STORAGE_KEYS.BOOKMARKS;
            
        const data = StorageUtils.get(storageKey, []);
        return Bookmark.fromArray(data);
    }

    /**
     * 保存书签数据
     * @param {Array<Bookmark>} bookmarks - 书签数组
     * @param {boolean} isPrivate - 是否为隐私书签
     * @returns {boolean} 是否保存成功
     */
    saveBookmarks(bookmarks, isPrivate = false) {
        const storageKey = isPrivate 
            ? APP_CONFIG.STORAGE_KEYS.PRIVACY_BOOKMARKS 
            : APP_CONFIG.STORAGE_KEYS.BOOKMARKS;
            
        const data = bookmarks.map(bookmark => bookmark.toObject());
        const success = StorageUtils.set(storageKey, data);
        
        if (success) {
            this.emit(isPrivate ? 'privacyBookmarksChanged' : 'bookmarksChanged', bookmarks);
        }
        
        return success;
    }

    /**
     * 添加书签
     * @param {Bookmark} bookmark - 书签实例
     * @param {boolean} isPrivate - 是否为隐私书签
     * @returns {boolean} 是否添加成功
     */
    addBookmark(bookmark, isPrivate = false) {
        const bookmarks = this.loadBookmarks(isPrivate);
        
        // 检查是否已存在相同URL的书签
        const existingIndex = bookmarks.findIndex(b => b.url === bookmark.url);
        if (existingIndex > -1) {
            throw new Error('该网址的书签已存在');
        }
        
        bookmarks.push(bookmark);
        return this.saveBookmarks(bookmarks, isPrivate);
    }

    /**
     * 更新书签
     * @param {string} bookmarkId - 书签ID
     * @param {Object} updates - 更新数据
     * @param {boolean} isPrivate - 是否为隐私书签
     * @returns {boolean} 是否更新成功
     */
    updateBookmark(bookmarkId, updates, isPrivate = false) {
        const bookmarks = this.loadBookmarks(isPrivate);
        const index = bookmarks.findIndex(b => b.id === bookmarkId);
        
        if (index === -1) {
            throw new Error('书签不存在');
        }
        
        bookmarks[index].update(updates);
        return this.saveBookmarks(bookmarks, isPrivate);
    }

    /**
     * 删除书签
     * @param {string} bookmarkId - 书签ID
     * @param {boolean} isPrivate - 是否为隐私书签
     * @returns {boolean} 是否删除成功
     */
    deleteBookmark(bookmarkId, isPrivate = false) {
        const bookmarks = this.loadBookmarks(isPrivate);
        const index = bookmarks.findIndex(b => b.id === bookmarkId);
        
        if (index === -1) {
            throw new Error('书签不存在');
        }
        
        bookmarks.splice(index, 1);
        return this.saveBookmarks(bookmarks, isPrivate);
    }

    /**
     * 记录书签访问
     * @param {string} bookmarkId - 书签ID
     * @param {boolean} isPrivate - 是否为隐私书签
     * @returns {boolean} 是否记录成功
     */
    recordBookmarkVisit(bookmarkId, isPrivate = false) {
        const bookmarks = this.loadBookmarks(isPrivate);
        const bookmark = bookmarks.find(b => b.id === bookmarkId);
        
        if (bookmark) {
            bookmark.recordVisit();
            return this.saveBookmarks(bookmarks, isPrivate);
        }
        
        return false;
    }

    // ==================== 分类数据操作 ====================

    /**
     * 加载分类数据
     * @param {boolean} isPrivate - 是否为隐私分类
     * @returns {Array<Category>} 分类数组
     */
    loadCategories(isPrivate = false) {
        const storageKey = isPrivate 
            ? APP_CONFIG.STORAGE_KEYS.PRIVACY_CATEGORIES 
            : APP_CONFIG.STORAGE_KEYS.CATEGORIES;
            
        const data = StorageUtils.get(storageKey, []);
        return Category.fromArray(data);
    }

    /**
     * 保存分类数据
     * @param {Array<Category>} categories - 分类数组
     * @param {boolean} isPrivate - 是否为隐私分类
     * @returns {boolean} 是否保存成功
     */
    saveCategories(categories, isPrivate = false) {
        const storageKey = isPrivate 
            ? APP_CONFIG.STORAGE_KEYS.PRIVACY_CATEGORIES 
            : APP_CONFIG.STORAGE_KEYS.CATEGORIES;
            
        const data = categories.map(category => category.toObject());
        const success = StorageUtils.set(storageKey, data);
        
        if (success) {
            this.emit(isPrivate ? 'privacyCategoriesChanged' : 'categoriesChanged', categories);
        }
        
        return success;
    }

    /**
     * 添加分类
     * @param {Category} category - 分类实例
     * @param {boolean} isPrivate - 是否为隐私分类
     * @returns {boolean} 是否添加成功
     */
    addCategory(category, isPrivate = false) {
        const categories = this.loadCategories(isPrivate);
        
        // 检查是否已存在相同名称的分类
        const existingIndex = categories.findIndex(c => c.name === category.name);
        if (existingIndex > -1) {
            throw new Error('该名称的分类已存在');
        }
        
        categories.push(category);
        return this.saveCategories(categories, isPrivate);
    }

    /**
     * 更新分类
     * @param {string} categoryId - 分类ID
     * @param {Object} updates - 更新数据
     * @param {boolean} isPrivate - 是否为隐私分类
     * @returns {boolean} 是否更新成功
     */
    updateCategory(categoryId, updates, isPrivate = false) {
        const categories = this.loadCategories(isPrivate);
        const index = categories.findIndex(c => c.id === categoryId);
        
        if (index === -1) {
            throw new Error('分类不存在');
        }
        
        categories[index].update(updates);
        return this.saveCategories(categories, isPrivate);
    }

    /**
     * 删除分类
     * @param {string} categoryId - 分类ID
     * @param {boolean} isPrivate - 是否为隐私分类
     * @returns {boolean} 是否删除成功
     */
    deleteCategory(categoryId, isPrivate = false) {
        const categories = this.loadCategories(isPrivate);
        const index = categories.findIndex(c => c.id === categoryId);
        
        if (index === -1) {
            throw new Error('分类不存在');
        }
        
        // 不能删除系统分类
        if (categories[index].isSystem) {
            throw new Error('系统分类不能删除');
        }
        
        // 将该分类下的书签移动到未分类
        const bookmarks = this.loadBookmarks(isPrivate);
        let updatedBookmarks = false;
        
        bookmarks.forEach(bookmark => {
            if (bookmark.categoryId === categoryId) {
                bookmark.categoryId = null;
                updatedBookmarks = true;
            }
        });
        
        if (updatedBookmarks) {
            this.saveBookmarks(bookmarks, isPrivate);
        }
        
        categories.splice(index, 1);
        return this.saveCategories(categories, isPrivate);
    }

    // ==================== 批量操作 ====================

    /**
     * 清空分类下的所有书签
     * @param {string} categoryId - 分类ID
     * @param {boolean} isPrivate - 是否为隐私数据
     * @returns {number} 删除的书签数量
     */
    clearCategoryBookmarks(categoryId, isPrivate = false) {
        const bookmarks = this.loadBookmarks(isPrivate);
        const filteredBookmarks = bookmarks.filter(bookmark => {
            if (categoryId === 'all') return false;
            if (categoryId === 'uncategorized') return bookmark.categoryId !== null;
            return bookmark.categoryId !== categoryId;
        });
        
        const deletedCount = bookmarks.length - filteredBookmarks.length;
        this.saveBookmarks(filteredBookmarks, isPrivate);
        
        return deletedCount;
    }

    /**
     * 获取存储统计信息
     * @returns {Object} 统计信息
     */
    getStorageStats() {
        const bookmarks = this.loadBookmarks();
        const categories = this.loadCategories();
        const privacyBookmarks = this.loadBookmarks(true);
        const privacyCategories = this.loadCategories(true);
        
        return {
            bookmarks: bookmarks.length,
            categories: categories.length,
            privacyBookmarks: privacyBookmarks.length,
            privacyCategories: privacyCategories.length,
            totalSize: this.calculateStorageSize(),
            lastUpdate: Math.max(
                ...bookmarks.map(b => b.updatedAt),
                ...categories.map(c => c.updatedAt)
            )
        };
    }

    /**
     * 计算存储大小
     * @returns {number} 存储大小（字节）
     */
    calculateStorageSize() {
        let totalSize = 0;
        
        Object.values(APP_CONFIG.STORAGE_KEYS).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
            }
        });
        
        return totalSize;
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        StorageUtils.clearAppData();
        this.emit('dataCleared');
        console.log('🗑️ 所有数据已清空');
    }
}

// 创建单例实例
export const storageManager = new StorageManager();
