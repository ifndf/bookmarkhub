/**
 * 分类数据模型
 * @author Travis
 * @version 2.0.0
 */

import { DataUtils } from '../core/utils.js';
import { APP_CONFIG } from '../core/config.js';

/**
 * 分类类
 */
export class Category {
    /**
     * 创建分类实例
     * @param {Object} data - 分类数据
     */
    constructor(data = {}) {
        this.id = data.id || DataUtils.generateId();
        this.name = DataUtils.sanitizeText(data.name || '');
        this.color = data.color || APP_CONFIG.DEFAULT_CATEGORIES[0].color;
        this.icon = data.icon || null;
        this.description = DataUtils.sanitizeText(data.description || '');
        this.order = typeof data.order === 'number' ? data.order : 0;
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.isSystem = Boolean(data.isSystem); // 是否为系统分类
        this.isPrivate = Boolean(data.isPrivate); // 是否为隐私分类
        this.bookmarkCount = data.bookmarkCount || 0; // 书签数量（缓存）
    }

    /**
     * 验证分类数据
     * @returns {Object} 验证结果
     */
    validate() {
        const errors = [];

        if (!this.name.trim()) {
            errors.push('分类名称不能为空');
        }

        if (this.name.trim().length > 20) {
            errors.push('分类名称不能超过20个字符');
        }

        if (!this.isValidColor(this.color)) {
            errors.push('请选择有效的颜色');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证颜色格式
     * @param {string} color - 颜色值
     * @returns {boolean} 是否有效
     */
    isValidColor(color) {
        if (!color || typeof color !== 'string') return false;
        
        // 支持十六进制颜色
        const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexPattern.test(color);
    }

    /**
     * 更新分类信息
     * @param {Object} updates - 更新数据
     */
    update(updates) {
        const allowedFields = [
            'name', 'color', 'icon', 'description', 'order'
        ];

        allowedFields.forEach(field => {
            if (field in updates) {
                if (field === 'name' || field === 'description') {
                    this[field] = DataUtils.sanitizeText(updates[field]);
                } else if (field === 'order') {
                    this[field] = typeof updates[field] === 'number' ? updates[field] : this[field];
                } else {
                    this[field] = updates[field];
                }
            }
        });

        this.updatedAt = Date.now();
    }

    /**
     * 更新书签数量
     * @param {number} count - 书签数量
     */
    updateBookmarkCount(count) {
        this.bookmarkCount = Math.max(0, count);
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
            this.name.toLowerCase(),
            this.description.toLowerCase()
        ];

        return searchFields.some(field => field.includes(searchText));
    }

    /**
     * 转换为普通对象
     * @returns {Object} 普通对象
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            icon: this.icon,
            description: this.description,
            order: this.order,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            isSystem: this.isSystem,
            isPrivate: this.isPrivate,
            bookmarkCount: this.bookmarkCount
        };
    }

    /**
     * 获取显示样式
     * @returns {Object} CSS样式对象
     */
    getStyles() {
        return {
            backgroundColor: this.color,
            color: this.getContrastColor()
        };
    }

    /**
     * 获取对比色（用于文字显示）
     * @returns {string} 对比色
     */
    getContrastColor() {
        // 将十六进制颜色转换为RGB
        const hex = this.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 计算亮度
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // 根据亮度选择对比色
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    /**
     * 从普通对象创建分类实例
     * @param {Object} data - 数据对象
     * @returns {Category} 分类实例
     */
    static fromObject(data) {
        return new Category(data);
    }

    /**
     * 批量创建分类实例
     * @param {Array} dataArray - 数据数组
     * @returns {Array<Category>} 分类实例数组
     */
    static fromArray(dataArray) {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.map(data => new Category(data));
    }

    /**
     * 验证分类数据模式
     * @param {Object} data - 要验证的数据
     * @returns {boolean} 是否有效
     */
    static validateSchema(data) {
        const schema = {
            name: { required: true, type: 'string' },
            color: { required: true, type: 'string' },
            icon: { required: false, type: 'string' },
            description: { required: false, type: 'string' },
            order: { required: false, type: 'number' },
            createdAt: { required: false, type: 'number' },
            updatedAt: { required: false, type: 'number' },
            isSystem: { required: false, type: 'boolean' },
            isPrivate: { required: false, type: 'boolean' },
            bookmarkCount: { required: false, type: 'number' }
        };

        return DataUtils.validateSchema(data, schema);
    }

    /**
     * 创建默认分类
     * @returns {Array<Category>} 默认分类数组
     */
    static createDefaults() {
        return APP_CONFIG.DEFAULT_CATEGORIES.map(data => new Category({
            ...data,
            isSystem: true
        }));
    }

    /**
     * 获取预设颜色
     * @returns {Array<string>} 颜色数组
     */
    static getPresetColors() {
        return [
            '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336',
            '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5',
            '#009688', '#8BC34A', '#CDDC39', '#FFC107', '#FF5722'
        ];
    }
}

/**
 * 分类工厂类
 */
export class CategoryFactory {
    /**
     * 创建新分类
     * @param {Object} data - 分类数据
     * @returns {Category} 分类实例
     */
    static create(data) {
        const category = new Category(data);
        const validation = category.validate();
        
        if (!validation.isValid) {
            throw new Error(`分类数据无效: ${validation.errors.join(', ')}`);
        }
        
        return category;
    }

    /**
     * 创建系统分类
     * @param {string} name - 分类名称
     * @param {string} color - 颜色
     * @returns {Category} 分类实例
     */
    static createSystem(name, color) {
        return new Category({
            name,
            color,
            isSystem: true
        });
    }

    /**
     * 创建隐私分类
     * @param {string} name - 分类名称
     * @param {string} color - 颜色
     * @returns {Category} 分类实例
     */
    static createPrivacy(name, color) {
        return new Category({
            name,
            color,
            isPrivate: true
        });
    }

    /**
     * 批量创建分类
     * @param {Array} dataArray - 数据数组
     * @returns {Array<Category>} 分类实例数组
     */
    static createBatch(dataArray) {
        const categories = [];
        const errors = [];

        dataArray.forEach((data, index) => {
            try {
                categories.push(this.create(data));
            } catch (error) {
                errors.push({ index, error: error.message });
            }
        });

        if (errors.length > 0) {
            console.warn('批量创建分类时发生错误:', errors);
        }

        return categories;
    }

    /**
     * 按顺序排序分类
     * @param {Array<Category>} categories - 分类数组
     * @returns {Array<Category>} 排序后的分类数组
     */
    static sortByOrder(categories) {
        return categories.sort((a, b) => {
            // 系统分类优先
            if (a.isSystem && !b.isSystem) return -1;
            if (!a.isSystem && b.isSystem) return 1;
            
            // 按order排序
            if (a.order !== b.order) return a.order - b.order;
            
            // 按创建时间排序
            return a.createdAt - b.createdAt;
        });
    }
}
