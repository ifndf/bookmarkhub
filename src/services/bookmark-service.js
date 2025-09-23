/**
 * 书签业务服务
 * @author Travis
 * @version 2.0.0
 */

import { Bookmark, BookmarkFactory } from '../models/bookmark.js';
import { APP_CONFIG } from '../core/config.js';
import { PerformanceUtils } from '../core/utils.js';

export class BookmarkService {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.cache = new Map();
        this.lastCacheUpdate = 0;
    }

    /**
     * 获取所有书签
     * @param {boolean} forceRefresh - 是否强制刷新缓存
     * @returns {Array<Bookmark>} 书签数组
     */
    getAllBookmarks(forceRefresh = false) {
        return PerformanceUtils.measureTime(() => {
            if (forceRefresh || this.shouldRefreshCache()) {
                const bookmarks = this.storageManager.loadBookmarks();
                this.cache.set('bookmarks', bookmarks);
                this.lastCacheUpdate = Date.now();
                return bookmarks;
            }
            return this.cache.get('bookmarks') || this.storageManager.loadBookmarks();
        }, '获取所有书签');
    }

    /**
     * 按分类获取书签
     * @param {string} categoryId - 分类ID
     * @returns {Array<Bookmark>} 书签数组
     */
    getBookmarksByCategory(categoryId) {
        const allBookmarks = this.getAllBookmarks();
        
        if (categoryId === 'all') return allBookmarks;
        if (categoryId === 'uncategorized') {
            return allBookmarks.filter(bookmark => !bookmark.categoryId);
        }
        
        return allBookmarks.filter(bookmark => bookmark.categoryId === categoryId);
    }

    /**
     * 搜索书签
     * @param {string} query - 搜索关键词
     * @returns {Array<Bookmark>} 匹配的书签数组
     */
    searchBookmarks(query) {
        const allBookmarks = this.getAllBookmarks();
        return allBookmarks.filter(bookmark => bookmark.matches(query));
    }

    /**
     * 添加书签
     * @param {Object} bookmarkData - 书签数据
     * @returns {Promise<Bookmark>} 添加的书签
     */
    async addBookmark(bookmarkData) {
        try {
            const bookmark = BookmarkFactory.create(bookmarkData);
            await this.storageManager.addBookmark(bookmark);
            this.invalidateCache();
            return bookmark;
        } catch (error) {
            console.error('添加书签失败:', error);
            throw error;
        }
    }

    /**
     * 更新书签
     * @param {string} bookmarkId - 书签ID
     * @param {Object} updates - 更新数据
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateBookmark(bookmarkId, updates) {
        try {
            const success = await this.storageManager.updateBookmark(bookmarkId, updates);
            if (success) this.invalidateCache();
            return success;
        } catch (error) {
            console.error('更新书签失败:', error);
            throw error;
        }
    }

    /**
     * 删除书签
     * @param {string} bookmarkId - 书签ID
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteBookmark(bookmarkId) {
        try {
            const success = await this.storageManager.deleteBookmark(bookmarkId);
            if (success) this.invalidateCache();
            return success;
        } catch (error) {
            console.error('删除书签失败:', error);
            throw error;
        }
    }

    /**
     * 记录书签访问
     * @param {string} bookmarkId - 书签ID
     */
    async recordVisit(bookmarkId) {
        try {
            await this.storageManager.recordBookmarkVisit(bookmarkId);
            this.invalidateCache();
        } catch (error) {
            console.error('记录访问失败:', error);
        }
    }

    /**
     * 分页获取书签
     * @param {number} page - 页码
     * @param {number} pageSize - 每页大小
     * @param {string} categoryId - 分类ID
     * @returns {Object} 分页结果
     */
    getPaginatedBookmarks(page = 1, pageSize = APP_CONFIG.PAGINATION.ITEMS_PER_PAGE, categoryId = 'all') {
        const bookmarks = this.getBookmarksByCategory(categoryId);
        const totalItems = bookmarks.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        return {
            items: bookmarks.slice(startIndex, endIndex),
            pagination: {
                currentPage: page,
                pageSize,
                totalItems,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    /**
     * 获取书签统计
     * @returns {Object} 统计信息
     */
    getStats() {
        const bookmarks = this.getAllBookmarks();
        return {
            total: bookmarks.length,
            withCategory: bookmarks.filter(b => b.categoryId).length,
            uncategorized: bookmarks.filter(b => !b.categoryId).length,
            totalVisits: bookmarks.reduce((sum, b) => sum + b.visitCount, 0)
        };
    }

    /**
     * 检查是否需要刷新缓存
     * @returns {boolean} 是否需要刷新
     */
    shouldRefreshCache() {
        return Date.now() - this.lastCacheUpdate > 30000; // 30秒缓存
    }

    /**
     * 清除缓存
     */
    invalidateCache() {
        this.cache.clear();
        this.lastCacheUpdate = 0;
    }
}
