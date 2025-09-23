/**
 * 书签数据模型
 * @author Travis
 * @version 2.0.0
 */

import { DataUtils, UrlUtils } from '../core/utils.js';

/**
 * 书签类
 */
export class Bookmark {
    /**
     * 创建书签实例
     * @param {Object} data - 书签数据
     */
    constructor(data = {}) {
        this.id = data.id || DataUtils.generateId();
        this.title = DataUtils.sanitizeText(data.title || '');
        this.url = UrlUtils.normalizeUrl(data.url || '');
        this.description = DataUtils.sanitizeText(data.description || '');
        this.categoryId = data.categoryId || null;
        this.favicon = data.favicon || UrlUtils.getFaviconUrl(this.url);
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.visitCount = data.visitCount || 0;
        this.lastVisited = data.lastVisited || null;
        this.tags = Array.isArray(data.tags) ? data.tags : [];
        this.isPrivate = Boolean(data.isPrivate);
    }

    /**
     * 验证书签数据
     * @returns {Object} 验证结果
     */
    validate() {
        const errors = [];

        if (!this.title.trim()) {
            errors.push('书签标题不能为空');
        }

        if (!this.url.trim()) {
            errors.push('书签网址不能为空');
        } else if (!UrlUtils.isValidUrl(this.url)) {
            errors.push('请输入有效的网址格式');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 更新书签信息
     * @param {Object} updates - 更新数据
     */
    update(updates) {
        const allowedFields = [
            'title', 'url', 'description', 'categoryId', 
            'favicon', 'tags', 'isPrivate'
        ];

        allowedFields.forEach(field => {
            if (field in updates) {
                if (field === 'title' || field === 'description') {
                    this[field] = DataUtils.sanitizeText(updates[field]);
                } else if (field === 'url') {
                    this[field] = UrlUtils.normalizeUrl(updates[field]);
                    // 更新URL时也更新favicon
                    this.favicon = UrlUtils.getFaviconUrl(this[field]);
                } else if (field === 'tags') {
                    this[field] = Array.isArray(updates[field]) ? updates[field] : [];
                } else {
                    this[field] = updates[field];
                }
            }
        });

        this.updatedAt = Date.now();
    }

    /**
     * 记录访问
     */
    recordVisit() {
        this.visitCount++;
        this.lastVisited = Date.now();
        this.updatedAt = Date.now();
    }

    /**
     * 搜索匹配
     * @param {string} query - 搜索关键词
     * @returns {boolean} 是否匹配
     */
    matches(query) {
        if (!query) return true;

        const searchText = query.toLowerCase();
        const searchFields = [
            this.title.toLowerCase(),
            this.url.toLowerCase(),
            this.description.toLowerCase(),
            ...this.tags.map(tag => tag.toLowerCase())
        ];

        // 支持多关键词搜索（空格分隔）
        const keywords = searchText.split(/\s+/).filter(keyword => keyword.length > 0);
        
        return keywords.every(keyword => 
            searchFields.some(field => field.includes(keyword))
        );
    }

    /**
     * 转换为普通对象
     * @returns {Object} 普通对象
     */
    toObject() {
        return {
            id: this.id,
            title: this.title,
            url: this.url,
            description: this.description,
            categoryId: this.categoryId,
            favicon: this.favicon,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            visitCount: this.visitCount,
            lastVisited: this.lastVisited,
            tags: this.tags,
            isPrivate: this.isPrivate
        };
    }

    /**
     * 从普通对象创建书签实例
     * @param {Object} data - 数据对象
     * @returns {Bookmark} 书签实例
     */
    static fromObject(data) {
        return new Bookmark(data);
    }

    /**
     * 批量创建书签实例
     * @param {Array} dataArray - 数据数组
     * @returns {Array<Bookmark>} 书签实例数组
     */
    static fromArray(dataArray) {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.map(data => new Bookmark(data));
    }

    /**
     * 验证书签数据模式
     * @param {Object} data - 要验证的数据
     * @returns {boolean} 是否有效
     */
    static validateSchema(data) {
        const schema = {
            title: { required: true, type: 'string' },
            url: { required: true, type: 'string' },
            description: { required: false, type: 'string' },
            categoryId: { required: false, type: 'string' },
            favicon: { required: false, type: 'string' },
            createdAt: { required: false, type: 'number' },
            updatedAt: { required: false, type: 'number' },
            visitCount: { required: false, type: 'number' },
            lastVisited: { required: false, type: 'number' },
            tags: { required: false, type: 'object' },
            isPrivate: { required: false, type: 'boolean' }
        };

        return DataUtils.validateSchema(data, schema);
    }
}

/**
 * 书签工厂类
 */
export class BookmarkFactory {
    /**
     * 创建新书签
     * @param {Object} data - 书签数据
     * @returns {Bookmark} 书签实例
     */
    static create(data) {
        const bookmark = new Bookmark(data);
        const validation = bookmark.validate();
        
        if (!validation.isValid) {
            throw new Error(`书签数据无效: ${validation.errors.join(', ')}`);
        }
        
        return bookmark;
    }

    /**
     * 从URL创建书签（自动获取标题）
     * @param {string} url - 网址
     * @returns {Promise<Bookmark>} 书签实例
     */
    static async createFromUrl(url) {
        const normalizedUrl = UrlUtils.normalizeUrl(url);
        
        // 基础数据
        const bookmarkData = {
            url: normalizedUrl,
            title: UrlUtils.extractDomain(normalizedUrl) // 默认使用域名作为标题
        };

        // 尝试获取网页标题（如果可能）
        try {
            // 这里可以添加获取网页标题的逻辑
            // 由于跨域限制，这部分功能可能需要后端支持
        } catch (error) {
            console.warn('无法获取网页标题:', error);
        }

        return new Bookmark(bookmarkData);
    }

    /**
     * 批量创建书签
     * @param {Array} dataArray - 数据数组
     * @returns {Array<Bookmark>} 书签实例数组
     */
    static createBatch(dataArray) {
        const bookmarks = [];
        const errors = [];

        dataArray.forEach((data, index) => {
            try {
                bookmarks.push(this.create(data));
            } catch (error) {
                errors.push({ index, error: error.message });
            }
        });

        if (errors.length > 0) {
            console.warn('批量创建书签时发生错误:', errors);
        }

        return bookmarks;
    }
}
