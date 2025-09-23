/**
 * 搜索服务
 */

export class SearchService {
    constructor() {
        this.bookmarkService = null;
        this.categoryService = null;
    }

    setBookmarkService(service) {
        this.bookmarkService = service;
    }

    setCategoryService(service) {
        this.categoryService = service;
    }

    searchBookmarks(query) {
        if (!this.bookmarkService) return [];
        return this.bookmarkService.searchBookmarks(query);
    }
}
