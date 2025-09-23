/**
 * 分类业务服务
 */

import { Category, CategoryFactory } from '../models/category.js';

export class CategoryService {
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    getAllCategories() {
        return this.storageManager.loadCategories();
    }

    async addCategory(categoryData) {
        const category = CategoryFactory.create(categoryData);
        await this.storageManager.addCategory(category);
        return category;
    }

    async updateCategory(categoryId, updates) {
        return await this.storageManager.updateCategory(categoryId, updates);
    }

    async deleteCategory(categoryId) {
        return await this.storageManager.deleteCategory(categoryId);
    }
}
