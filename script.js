// BookmarkHub - 书签管理应用
class BookmarkHub {
    constructor() {
        this.bookmarks = [];
        this.categories = [];
        this.currentFilter = 'all';
        this.currentBookmark = null;
        this.currentCategory = null;
        // 隐私空间相关
        this.privacyBookmarks = [];
        this.privacyCategories = [];
        this.privacyCurrentFilter = 'all';
        this.isPrivacyMode = false;
        this.privacyPassword = null;
        
        // 分页相关属性
        this.itemsPerPage = 30;
        this.currentPage = 1;
        this.privacyCurrentPage = 1;
        
        this.init();
    }
    
    // 初始化应用
    init() {
        console.log('🔧 开始初始化BookmarkHub');
        try {
            this.loadData();
            this.bindEvents();
            this.render();
            preventContextMenu(); // 添加全局上下文菜单阻止
            this.showToast('欢迎使用 BookmarkHub 书签管理！', 'info');
            console.log('✅ BookmarkHub初始化完成');
        } catch (error) {
            console.error('❌ 初始化过程中出错:', error);
        }
    }
    
    // 移除事件监听器
    removeEventListeners() {
        // 移除可能已存在的事件监听器
        const searchInput = document.getElementById('searchInput');
        const addBookmarkBtn = document.getElementById('addBookmarkBtn');
        const backupBtn = document.getElementById('backupBtn');
        const bookmarkUrl = document.getElementById('bookmarkUrl');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const closeModal = document.getElementById('closeModal');
        const closeCategoryModal = document.getElementById('closeCategoryModal');
        const bookmarkForm = document.getElementById('bookmarkForm');
        const categoryForm = document.getElementById('categoryForm');
        
        // 移除已存储的处理器
        if (this.searchInputHandler && searchInput) {
            searchInput.removeEventListener('input', this.searchInputHandler);
        }
        if (this.addBookmarkHandler && addBookmarkBtn) {
            addBookmarkBtn.removeEventListener('click', this.addBookmarkHandler);
        }
        if (this.backupHandler && backupBtn) {
            backupBtn.removeEventListener('click', this.backupHandler);
        }
        if (this.urlPreviewHandler && bookmarkUrl) {
            bookmarkUrl.removeEventListener('input', this.urlPreviewHandler);
        }
        if (this.addCategoryHandler && addCategoryBtn) {
            addCategoryBtn.removeEventListener('click', this.addCategoryHandler);
        }
        if (this.closeModalHandler && closeModal) {
            closeModal.removeEventListener('click', this.closeModalHandler);
        }
        if (this.closeCategoryModalHandler && closeCategoryModal) {
            closeCategoryModal.removeEventListener('click', this.closeCategoryModalHandler);
        }
        if (this.bookmarkSubmitHandler && bookmarkForm) {
            bookmarkForm.removeEventListener('submit', this.bookmarkSubmitHandler);
        }
        if (this.categorySubmitHandler && categoryForm) {
            categoryForm.removeEventListener('submit', this.categorySubmitHandler);
        }
        
        // 移除批量删除按钮事件
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        const privacyBatchDeleteBtn = document.getElementById('privacyBatchDeleteBtn');
        if (this.batchDeleteHandler && batchDeleteBtn) {
            batchDeleteBtn.removeEventListener('click', this.batchDeleteHandler);
        }
        if (this.privacyBatchDeleteHandler && privacyBatchDeleteBtn) {
            privacyBatchDeleteBtn.removeEventListener('click', this.privacyBatchDeleteHandler);
        }
    }
    
    // 绑定事件监听器
    bindEvents() {
        console.log('🔗 开始绑定事件监听器');
        try {
            // 先移除可能已存在的事件监听器
            this.removeEventListeners();
            
            // 搜索功能
            this.searchInputHandler = (e) => {
                this.handleSearch(e.target.value);
            };
            document.getElementById('searchInput').addEventListener('input', this.searchInputHandler);
        
        // 添加书签
        this.addBookmarkHandler = () => {
            this.showBookmarkModal();
        };
        document.getElementById('addBookmarkBtn').addEventListener('click', this.addBookmarkHandler);
        
        // 备份按钮
        this.backupHandler = () => {
            this.showBackupModal();
        };
        document.getElementById('backupBtn').addEventListener('click', this.backupHandler);
        
        // URL输入实时预览
        this.urlPreviewHandler = (e) => {
            const url = e.target.value.trim();
            if (url) {
                const normalizedUrl = this.normalizeUrl(url);
                if (normalizedUrl !== url) {
                    // 显示修正后的URL预览
                    e.target.title = `将保存为: ${normalizedUrl}`;
                } else {
                    e.target.title = '';
                }
            } else {
                e.target.title = '';
            }
        };
        document.getElementById('bookmarkUrl').addEventListener('input', this.urlPreviewHandler);
        
        // 添加分类
        this.addCategoryHandler = () => {
            this.showCategoryModal();
        };
        document.getElementById('addCategoryBtn').addEventListener('click', this.addCategoryHandler);
        
        // 批量删除按钮
        this.batchDeleteHandler = () => {
            this.showBatchDeleteConfirm();
        };
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', this.batchDeleteHandler);
        }
        
        // 隐私空间批量删除按钮
        this.privacyBatchDeleteHandler = () => {
            this.showPrivacyBatchDeleteConfirm();
        };
        const privacyBatchDeleteBtn = document.getElementById('privacyBatchDeleteBtn');
        if (privacyBatchDeleteBtn) {
            privacyBatchDeleteBtn.addEventListener('click', this.privacyBatchDeleteHandler);
        }
        
        // 模态框关闭
        this.closeModalHandler = () => {
            this.hideBookmarkModal();
        };
        document.getElementById('closeModal').addEventListener('click', this.closeModalHandler);
        
        this.closeCategoryModalHandler = () => {
            this.hideCategoryModal();
        };
        document.getElementById('closeCategoryModal').addEventListener('click', this.closeCategoryModalHandler);
        
        this.closeDeleteModalHandler = () => {
            this.hideDeleteModal();
        };
        document.getElementById('closeDeleteModal').addEventListener('click', this.closeDeleteModalHandler);
        
        // 表单提交
        const bookmarkForm = document.getElementById('bookmarkForm');
        const categoryForm = document.getElementById('categoryForm');
        
        if (bookmarkForm) {
            this.bookmarkSubmitHandler = (e) => {
                e.preventDefault();
                this.handleBookmarkSubmit();
            };
            bookmarkForm.addEventListener('submit', this.bookmarkSubmitHandler);
        }
        
        if (categoryForm) {
            this.categorySubmitHandler = (e) => {
                e.preventDefault();
                this.handleCategorySubmit();
            };
            categoryForm.addEventListener('submit', this.categorySubmitHandler);
        }
        
        // 取消按钮
        const cancelBtn = document.getElementById('cancelBtn');
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideBookmarkModal();
            });
        }
        
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => {
                this.hideCategoryModal();
            });
        }
        
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
        
        // 确认删除
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
        
        // 模态框背景点击关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput').focus();
            }
        });
        
        // 颜色选择器同步
        document.getElementById('categoryColor').addEventListener('change', (e) => {
            document.querySelector('.color-preview').style.backgroundColor = e.target.value;
        });
        
        // 窗口大小变化时重新渲染分类
        window.addEventListener('resize', () => {
            this.renderCategories();
        });
        
        // 图片输入预览功能
        document.getElementById('bookmarkImage').addEventListener('input', (e) => {
            this.handleImagePreview(e.target.value);
        });
        
        // 移除图片按钮
        document.getElementById('removeImageBtn').addEventListener('click', () => {
            this.removeImagePreview();
        });
        
        
        // 搜索帮助按钮
        document.getElementById('searchHelpBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSearchHelp();
        });
        
        // 点击其他地方关闭搜索帮助
        document.addEventListener('click', (e) => {
            const searchHelp = document.getElementById('searchHelp');
            const searchHelpBtn = document.getElementById('searchHelpBtn');
            if (!searchHelp.contains(e.target) && !searchHelpBtn.contains(e.target)) {
                searchHelp.classList.remove('show');
            }
        });
        
            // 分页控件事件
            this.bindPaginationEvents();
        
            // 隐私空间相关事件
            this.bindPrivacyEvents();
        } catch (error) {
            console.error('❌ 事件绑定过程中出错:', error);
        }
    }
    
    // 从本地存储加载数据
    loadData() {
        const savedBookmarks = localStorage.getItem('bookmarkhub_bookmarks');
        const savedCategories = localStorage.getItem('bookmarkhub_categories');
        
        if (savedBookmarks) {
            this.bookmarks = JSON.parse(savedBookmarks);
        }
        
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            // 默认分类
            this.categories = [
                { id: 'work', name: '工作', color: '#2196F3' },
                { id: 'study', name: '学习', color: '#4CAF50' },
                { id: 'entertainment', name: '娱乐', color: '#FF9800' }
            ];
            this.saveData();
        }
        
        // 修复数据：将没有对应分类的书签移动到未分类
        this.fixOrphanedBookmarks();
    }
    
    // 修复孤立书签（没有对应分类的书签）
    fixOrphanedBookmarks() {
        let fixedCount = 0;
        const categoryIds = new Set(this.categories.map(cat => cat.id));
        
        this.bookmarks.forEach(bookmark => {
            // 如果书签有categoryId但分类不存在，将其设为未分类
            if (bookmark.categoryId && !categoryIds.has(bookmark.categoryId)) {
                console.log(`🔧 修复孤立书签: "${bookmark.title}" (${bookmark.categoryId} -> null)`);
                bookmark.categoryId = null;
                fixedCount++;
            }
        });
        
        if (fixedCount > 0) {
            console.log(`✅ 修复了 ${fixedCount} 个孤立书签`);
            this.saveData(); // 保存修复后的数据
        }
    }
    
    // 修复孤立的隐私书签
    fixOrphanedPrivacyBookmarks() {
        let fixedCount = 0;
        const categoryIds = new Set(this.privacyCategories.map(cat => cat.id));
        
        this.privacyBookmarks.forEach(bookmark => {
            // 如果书签有categoryId但分类不存在，将其设为未分类
            if (bookmark.categoryId && !categoryIds.has(bookmark.categoryId)) {
                console.log(`🔧 修复孤立隐私书签: "${bookmark.title}" (${bookmark.categoryId} -> null)`);
                bookmark.categoryId = null;
                fixedCount++;
            }
        });
        
        if (fixedCount > 0) {
            console.log(`✅ 修复了 ${fixedCount} 个孤立隐私书签`);
            this.savePrivacyData(); // 保存修复后的隐私数据
        }
    }
    
    // 保存数据到本地存储
    saveData() {
        localStorage.setItem('bookmarkhub_bookmarks', JSON.stringify(this.bookmarks));
        localStorage.setItem('bookmarkhub_categories', JSON.stringify(this.categories));
    }
    
    // 渲染页面
    render() {
        this.renderCategories();
        this.renderBookmarks();
        this.updateCategoryOptions();
        this.updateBatchActions();
    }
    
    // 渲染分类筛选
    renderCategories() {
        const container = document.getElementById('categoryChips');
        const addButton = container.querySelector('.add-category');
        
        // 清除现有分类（保留全部和未分类）
        const existingChips = container.querySelectorAll('.chip:not([data-category="all"]):not([data-category="uncategorized"]):not(.add-category):not(.more-categories)');
        existingChips.forEach(chip => chip.remove());
        
        // 移除之前的"更多"按钮
        const existingMoreBtn = container.querySelector('.more-categories');
        if (existingMoreBtn) {
            existingMoreBtn.remove();
        }
        
        // 根据屏幕宽度决定显示的分类数量
        const isMobile = window.innerWidth <= 768;
        const maxVisibleCategories = isMobile ? 3 : 5; // 移动端显示3个，桌面端显示5个
        const visibleCategories = this.categories.slice(0, maxVisibleCategories);
        const hiddenCategories = this.categories.slice(maxVisibleCategories);
        
        // 添加可见的自定义分类
        visibleCategories.forEach(category => {
            const chip = this.createCategoryChip(category);
            container.insertBefore(chip, addButton);
        });
        
        // 如果有隐藏的分类，添加"更多"按钮
        if (hiddenCategories.length > 0) {
            const moreButton = document.createElement('button');
            moreButton.className = 'chip more-categories';
            moreButton.innerHTML = `更多 <span class="category-count">(${hiddenCategories.length})</span>`;
            moreButton.addEventListener('click', () => {
                this.showMoreCategoriesModal(hiddenCategories);
            });
            container.insertBefore(moreButton, addButton);
        }
        
        // 更新现有按钮的事件监听器
        container.querySelector('[data-category="all"]').addEventListener('click', () => {
            this.setFilter('all');
        });
        
        container.querySelector('[data-category="uncategorized"]').addEventListener('click', () => {
            this.setFilter('uncategorized');
        });
    }
    
    // 创建分类标签
    createCategoryChip(category) {
        const chip = document.createElement('button');
        chip.className = 'chip category-chip';
        chip.dataset.category = category.id;
        chip.style.borderColor = category.color;
        
        // 创建分类名称元素
        const nameSpan = document.createElement('span');
        nameSpan.className = 'category-name';
        nameSpan.textContent = category.name;
        
        // 创建删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'category-delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = '删除分类';
        
        chip.appendChild(nameSpan);
        chip.appendChild(deleteBtn);
        
        if (this.currentFilter === category.id) {
            chip.classList.add('active');
            chip.style.backgroundColor = category.color;
            chip.style.color = 'white';
        }
        
        // 点击整个分类标签切换筛选（除了删除按钮）
        chip.addEventListener('click', (e) => {
            // 如果点击的是删除按钮，不执行筛选
            if (e.target.closest('.category-delete-btn')) {
                return;
            }
            this.setFilter(category.id);
        });
        
        // 点击删除按钮
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.showDeleteCategoryConfirm(category);
        });
        
        return chip;
    }
    
    // 显示删除分类确认对话框
    showDeleteCategoryConfirm(category) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        // 检查该分类下是否有书签
        const bookmarksInCategory = (this.isPrivacyMode ? this.privacyBookmarks : this.bookmarks)
            .filter(bookmark => bookmark.categoryId === category.id);
        
        const hasBookmarks = bookmarksInCategory.length > 0;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>删除分类</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>确定要删除分类 <strong style="color: ${category.color}">${category.name}</strong> 吗？</p>
                    ${hasBookmarks ? `
                        <div class="warning-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>该分类下有 ${bookmarksInCategory.length} 个书签，删除后这些书签将被移到"未分类"。</span>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-delete-category">取消</button>
                    <button class="btn btn-danger confirm-delete-category">
                        删除分类
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 显示模态框
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // 绑定事件监听器
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.cancel-delete-category');
        const confirmBtn = modal.querySelector('.confirm-delete-category');
        
        // 关闭模态框
        const closeModal = () => {
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // 确认删除
        confirmBtn.addEventListener('click', () => {
            this.deleteCategory(category.id);
            closeModal();
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // 删除分类
    deleteCategory(categoryId) {
        const categories = this.isPrivacyMode ? this.privacyCategories : this.categories;
        const bookmarks = this.isPrivacyMode ? this.privacyBookmarks : this.bookmarks;
        
        // 将该分类下的书签移动到未分类
        bookmarks.forEach(bookmark => {
            if (bookmark.categoryId === categoryId) {
                bookmark.categoryId = null; // 设置为null表示未分类
            }
        });
        
        // 删除分类
        const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex > -1) {
            categories.splice(categoryIndex, 1);
        }
        
        // 如果当前筛选的就是被删除的分类，切换到全部
        const currentFilter = this.isPrivacyMode ? this.privacyCurrentFilter : this.currentFilter;
        if (currentFilter === categoryId) {
            if (this.isPrivacyMode) {
                this.privacyCurrentFilter = 'all';
            } else {
                this.currentFilter = 'all';
            }
        }
        
        // 保存数据并重新渲染
        if (this.isPrivacyMode) {
            this.savePrivacyData();
            this.renderPrivacySpace();
        } else {
            this.saveData();
            this.render();
        }
        
        this.showToast(`分类已删除`, 'success');
    }
    
    // 显示更多分类的模态框
    showMoreCategoriesModal(hiddenCategories) {
        // 创建临时模态框
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>选择分类</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="category-grid">
                        ${hiddenCategories.map(category => `
                            <button class="category-item ${this.currentFilter === category.id ? 'active' : ''}" 
                                    data-category="${category.id}" 
                                    style="border-color: ${category.color}; ${this.currentFilter === category.id ? `background-color: ${category.color}; color: white;` : ''}">
                                <span class="category-dot" style="background-color: ${category.color};"></span>
                                ${category.name}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        modal.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const categoryId = item.dataset.category;
                this.setFilter(categoryId);
                document.body.removeChild(modal);
            });
        });
    }
    
    // 渲染书签列表
    renderBookmarks() {
        const container = document.getElementById('bookmarksGrid');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('pagination');
        
        const filteredBookmarks = this.getFilteredBookmarks();
        const currentPage = this.isPrivacyMode ? this.privacyCurrentPage : this.currentPage;
        
        if (filteredBookmarks.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            pagination.style.display = 'none';
            return;
        }
        
        // 计算分页
        const totalPages = Math.ceil(filteredBookmarks.length / this.itemsPerPage);
        const startIndex = (currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageBookmarks = filteredBookmarks.slice(startIndex, endIndex);
        
        container.style.display = 'grid';
        emptyState.style.display = 'none';
        container.innerHTML = '';
        
        pageBookmarks.forEach(bookmark => {
            const card = this.createBookmarkCard(bookmark);
            container.appendChild(card);
        });
        
        // 更新分页控件
        this.updatePagination(currentPage, totalPages, filteredBookmarks.length);
    }
    
    // 更新分页控件
    updatePagination(currentPage, totalPages, totalItems) {
        const pagination = document.getElementById('pagination');
        const paginationInfo = document.getElementById('paginationInfo');
        const firstPageBtn = document.getElementById('firstPageBtn');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const lastPageBtn = document.getElementById('lastPageBtn');
        const pageJumpInput = document.getElementById('pageJumpInput');
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        paginationInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页（${totalItems} 个书签）`;
        
        // 更新按钮状态
        firstPageBtn.disabled = currentPage === 1;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        lastPageBtn.disabled = currentPage === totalPages;
        
        // 更新跳转输入框
        pageJumpInput.max = totalPages;
        pageJumpInput.placeholder = `1-${totalPages}`;
    }
    
    // 切换到指定页面
    goToPage(page) {
        const filteredBookmarks = this.getFilteredBookmarks();
        const totalPages = Math.ceil(filteredBookmarks.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) {
            return;
        }
        
        if (this.isPrivacyMode) {
            this.privacyCurrentPage = page;
        } else {
            this.currentPage = page;
        }
        
        this.renderBookmarks();
    }
    
    // 绑定分页控件事件
    bindPaginationEvents() {
        const firstPageBtn = document.getElementById('firstPageBtn');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const lastPageBtn = document.getElementById('lastPageBtn');
        const pageJumpBtn = document.getElementById('pageJumpBtn');
        const pageJumpInput = document.getElementById('pageJumpInput');
        
        // 首页
        firstPageBtn.addEventListener('click', () => {
            this.goToPage(1);
        });
        
        // 上一页
        prevPageBtn.addEventListener('click', () => {
            const currentPage = this.isPrivacyMode ? this.privacyCurrentPage : this.currentPage;
            this.goToPage(currentPage - 1);
        });
        
        // 下一页
        nextPageBtn.addEventListener('click', () => {
            const currentPage = this.isPrivacyMode ? this.privacyCurrentPage : this.currentPage;
            this.goToPage(currentPage + 1);
        });
        
        // 末页
        lastPageBtn.addEventListener('click', () => {
            const filteredBookmarks = this.getFilteredBookmarks();
            const totalPages = Math.ceil(filteredBookmarks.length / this.itemsPerPage);
            this.goToPage(totalPages);
        });
        
        // 页面跳转
        pageJumpBtn.addEventListener('click', () => {
            const page = parseInt(pageJumpInput.value);
            if (page) {
                this.goToPage(page);
                pageJumpInput.value = '';
            }
        });
        
        // 回车跳转
        pageJumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page) {
                    this.goToPage(page);
                    e.target.value = '';
                }
            }
        });
    }
    
    // 创建书签卡片
    createBookmarkCard(bookmark) {
        const card = document.createElement('div');
        card.className = bookmark.imageUrl ? 'bookmark-card has-image' : 'bookmark-card';
        card.dataset.id = bookmark.id;
        
        const categories = this.isPrivacyMode ? this.privacyCategories : this.categories;
        const category = categories.find(cat => cat.id === bookmark.categoryId);
        const categoryName = category ? category.name : '未分类';
        const categoryColor = category ? category.color : '#757575';
        
        // 获取网站图标
        const faviconUrl = this.getFaviconUrl(bookmark.url);
        
        let cardContent = '';
        
        // 如果有图片，使用背景图片；否则显示纯色占位符
        if (bookmark.imageUrl) {
            cardContent += `
                    <div class="bookmark-image" style="background-image: url('${bookmark.imageUrl}')"></div>
                `;
            } else {
                cardContent += `
                    <div class="bookmark-placeholder"></div>
            `;
        }
        
        cardContent += `
            <div class="bookmark-card-content">
                <div class="bookmark-header">
                    <div class="bookmark-favicon">
                        <img src="${faviconUrl}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <i class="fas fa-globe" style="display: none;"></i>
                    </div>
                    <div class="bookmark-content">
                        <h3 class="bookmark-title">${this.escapeHtml(bookmark.title)}</h3>
                            </div>
                </div>
                <div class="bookmark-actions">
                    <button class="bookmark-action edit" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="bookmark-action delete" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <span class="bookmark-category" style="background-color: ${categoryColor}20; color: ${categoryColor};">
                ${categoryName}
            </span>
        `;
        
        card.innerHTML = cardContent;
        
        // 定义最终返回的元素
        let finalElement = card;
        
        // 如果有描述，创建包装器
        if (bookmark.description) {
            const wrapper = document.createElement('div');
            wrapper.className = 'bookmark-card-wrapper';
            
            // 将卡片添加到包装器
            wrapper.appendChild(card);
            
            // 添加描述框
            const descBox = document.createElement('div');
            descBox.className = 'bookmark-description-box';
            descBox.innerHTML = `<div class="bookmark-description">${this.escapeHtml(bookmark.description)}</div>`;
            wrapper.appendChild(descBox);
            
            // 更新最终返回元素为包装器
            finalElement = wrapper;
        }
        
        // 移动端长按逻辑
        let longPressTimer = null;
        let isLongPressing = false;
        let hasMoved = false;
        
        // 检测是否为移动设备
        const isMobile = 'ontouchstart' in window;
        
        // 获取实际需要绑定事件的元素（总是绑定到card上，因为它包含按钮）
        const eventTarget = card;
        
        if (isMobile) {
            // 阻止默认的上下文菜单
            eventTarget.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }, true); // 使用捕获阶段
            
            // 阻止长按选择
            eventTarget.addEventListener('selectstart', (e) => {
                e.preventDefault();
                return false;
            });
            
            // 阻止拖拽
            eventTarget.addEventListener('dragstart', (e) => {
                e.preventDefault();
                return false;
            });
            
            eventTarget.addEventListener('touchstart', (e) => {
                isLongPressing = false;
                hasMoved = false;
                
                // 清除之前的定时器
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                }
                
                longPressTimer = setTimeout(() => {
                    isLongPressing = true;
                    card.classList.add('show-actions');
                    
                    // 删除旧的按钮元素
                    const oldActionsEl = card.querySelector('.bookmark-actions');
                    if (oldActionsEl) {
                        oldActionsEl.remove();
                    }
                    
                    // 创建全新的独立按钮容器
                    const newActionsEl = document.createElement('div');
                    newActionsEl.style.cssText = `
                        position: absolute !important;
                        top: 8px !important;
                        right: 8px !important;
                        z-index: 9999 !important;
                        background: rgba(0, 0, 0, 0.8) !important;
                        border-radius: 8px !important;
                        padding: 4px !important;
                        display: flex !important;
                        gap: 4px !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                    `;
                    
                    // 阻止容器的事件冒泡
                    newActionsEl.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    };
                    
                    // 创建编辑按钮
                    const editBtn = document.createElement('button');
                    editBtn.innerHTML = '✏️';
                    editBtn.style.cssText = `
                        background: rgba(255, 255, 255, 0.9) !important;
                        border: none !important;
                        border-radius: 4px !important;
                        padding: 8px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 32px !important;
                        height: 32px !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                    `;
                    editBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        // 延迟执行，确保事件处理完成
                        setTimeout(() => {
                            this.editBookmark(bookmark);
                        }, 10);
                        return false;
                    };
                    
                    // 创建删除按钮
                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '🗑️';
                    deleteBtn.style.cssText = `
                        background: rgba(255, 255, 255, 0.9) !important;
                        border: none !important;
                        border-radius: 4px !important;
                        padding: 8px !important;
                        cursor: pointer !important;
                        font-size: 14px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        width: 32px !important;
                        height: 32px !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                    `;
                    deleteBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        // 延迟执行，确保事件处理完成
                        setTimeout(() => {
                            this.deleteBookmark(bookmark);
                        }, 10);
                        return false;
                    };
                    
                    // 添加按钮到容器
                    newActionsEl.appendChild(editBtn);
                    newActionsEl.appendChild(deleteBtn);
                    
                    // 添加容器到卡片
                    card.appendChild(newActionsEl);
                    
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }, 600);
            }, { passive: true });
            
            eventTarget.addEventListener('touchmove', (e) => {
                hasMoved = true;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }, { passive: true });
            
            eventTarget.addEventListener('touchend', (e) => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                
                // 检查是否点击了按钮区域
                const clickedButton = e.target.tagName === 'BUTTON' || e.target.closest('button');
                const clickedActions = e.target.parentElement?.style?.zIndex === '9999';
                
                // 只有在没有长按、没有移动、没有点击按钮的情况下才触发点击
                if (!isLongPressing && !hasMoved && !clickedButton && !clickedActions) {
                    this.openBookmark(bookmark);
                }
                
                // 延迟重置状态，让长按按钮有时间显示
                setTimeout(() => {
                    isLongPressing = false;
                    hasMoved = false;
                }, 100);
            }, { passive: true });
            
            eventTarget.addEventListener('touchcancel', (e) => {
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
                // 重置状态
                setTimeout(() => {
                    isLongPressing = false;
                    hasMoved = false;
                }, 100);
            }, { passive: true });
            
        } else {
            // PC端点击事件
            eventTarget.addEventListener('click', (e) => {
            if (!e.target.closest('.bookmark-actions')) {
                this.openBookmark(bookmark);
            }
        });
        }
        
        // 点击其他地方隐藏操作按钮
        document.addEventListener('click', (e) => {
            if (!eventTarget.contains(e.target)) {
                eventTarget.classList.remove('show-actions');
            }
        });
        
        const editBtn = card.querySelector('.edit');
        const deleteBtn = card.querySelector('.delete');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editBookmark(bookmark);
        });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteBookmark(bookmark);
        });
        }
        
        
        return finalElement;
    }
    
    // 获取网站图标URL
    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch {
            return '';
        }
    }
    
    // 格式化日期
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return '今天';
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
    
    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 获取过滤后的书签
    getFilteredBookmarks() {
        let filtered = this.bookmarks;
        
        // 按分类过滤
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'uncategorized') {
                filtered = filtered.filter(bookmark => !bookmark.categoryId);
            } else {
                filtered = filtered.filter(bookmark => bookmark.categoryId === this.currentFilter);
            }
        }
        
        // 按搜索关键词过滤 - 支持高级搜索语法
        const searchQuery = document.getElementById('searchInput').value.trim();
        if (searchQuery) {
            filtered = filtered.filter(bookmark => this.matchesAdvancedSearch(bookmark, searchQuery));
        }
        
        // 按创建时间排序（最新的在前）
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    
    // 切换搜索帮助显示
    toggleSearchHelp() {
        const searchHelp = document.getElementById('searchHelp');
        searchHelp.classList.toggle('show');
    }
    
    // 高级搜索匹配函数
    matchesAdvancedSearch(bookmark, searchQuery) {
        // 将书签的所有可搜索内容合并为一个字符串
        const searchableContent = [
            bookmark.title,
            bookmark.url,
            bookmark.description || ''
        ].join(' ').toLowerCase();
        
        // 解析搜索查询
        const searchTerms = this.parseSearchQuery(searchQuery.toLowerCase());
        
        // 检查每个搜索项是否匹配
        return searchTerms.every(term => {
            if (term.type === 'and') {
                // AND逻辑：所有关键词都必须存在
                return term.keywords.every(keyword => searchableContent.includes(keyword));
            } else if (term.type === 'or') {
                // OR逻辑：至少一个关键词存在
                return term.keywords.some(keyword => searchableContent.includes(keyword));
            }
            return false;
        });
    }
    
    // 解析搜索查询语法
    parseSearchQuery(query) {
        const terms = [];
        
        // 按空格分割，但保留|分隔的OR组
        const parts = query.split(' ').filter(part => part.trim());
        
        for (const part of parts) {
            if (part.includes('|')) {
                // OR逻辑：用|分隔的关键词
                const orKeywords = part.split('|').map(k => k.trim()).filter(k => k);
                if (orKeywords.length > 0) {
                    terms.push({
                        type: 'or',
                        keywords: orKeywords
                    });
                }
            } else {
                // AND逻辑：单个关键词
                terms.push({
                    type: 'and',
                    keywords: [part.trim()]
                });
            }
        }
        
        return terms;
    }
    
    // 绑定隐私空间事件
    bindPrivacyEvents() {
        // 隐私空间入口按钮
        const privacySpaceBtn = document.getElementById('privacySpaceBtn');
        if (privacySpaceBtn) {
            privacySpaceBtn.addEventListener('click', () => {
                this.showPrivacyPasswordModal();
            });
        }
        
        // 隐私空间密码表单
        document.getElementById('privacyPasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePrivacyPasswordSubmit();
        });
        
        // 密码显示/隐藏切换
        document.getElementById('privacyPasswordToggle').addEventListener('click', () => {
            this.togglePasswordVisibility('privacyPassword', 'privacyPasswordToggle');
        });
        
        // 关闭隐私密码模态框
        document.getElementById('closePrivacyPasswordModal').addEventListener('click', () => {
            this.hidePrivacyPasswordModal();
        });
        
        document.getElementById('cancelPrivacyPasswordBtn').addEventListener('click', () => {
            this.hidePrivacyPasswordModal();
        });
        
        // 退出隐私空间
        document.getElementById('exitPrivacySpaceBtn').addEventListener('click', () => {
            this.exitPrivacySpace();
        });
        
        // 隐私设置模态框事件
        this.bindPrivacySettingsEvents();
        
        // 隐私空间搜索
        document.getElementById('privacySearchInput').addEventListener('input', (e) => {
            if (this.isPrivacyMode) {
                this.handlePrivacySearch(e.target.value);
            }
        });
        
        // 隐私空间搜索帮助
        document.getElementById('privacySearchHelpBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePrivacySearchHelp();
        });
        
        // 添加隐私书签
        document.getElementById('addPrivacyBookmarkBtn').addEventListener('click', () => {
            if (this.isPrivacyMode) {
                this.showBookmarkModal();
            }
        });
        
        // 添加隐私分类
        document.getElementById('addPrivacyCategoryBtn').addEventListener('click', () => {
            if (this.isPrivacyMode) {
                this.showCategoryModal();
            }
        });
    }
    
    // 显示隐私空间密码模态框
    showPrivacyPasswordModal() {
        const modal = document.getElementById('privacyPasswordModal');
        const setupDiv = document.getElementById('privacySetup');
        const passwordInput = document.getElementById('privacyPassword');
        const confirmInput = document.getElementById('privacyPasswordConfirm');
        const btnText = document.getElementById('privacyPasswordBtnText');
        const errorDiv = document.getElementById('privacyPasswordError');
        
        // 清空表单
        passwordInput.value = '';
        confirmInput.value = '';
        errorDiv.style.display = 'none';
        
        // 检查是否首次设置密码
        const savedPassword = localStorage.getItem('bookmarkhub_privacy_password');
        if (!savedPassword) {
            // 首次设置密码
            setupDiv.style.display = 'block';
            passwordInput.placeholder = '设置隐私空间密码（至少4位）';
            btnText.textContent = '创建';
        } else {
            // 验证密码
            setupDiv.style.display = 'none';
            passwordInput.placeholder = '请输入隐私空间密码';
            btnText.textContent = '进入';
        }
        
        modal.classList.add('show');
        passwordInput.focus();
    }
    
    // 隐藏隐私空间密码模态框
    hidePrivacyPasswordModal() {
        const modal = document.getElementById('privacyPasswordModal');
        modal.classList.remove('show');
    }
    
    // 处理隐私空间密码提交
    handlePrivacyPasswordSubmit() {
        const password = document.getElementById('privacyPassword').value;
        const confirmPassword = document.getElementById('privacyPasswordConfirm').value;
        const setupDiv = document.getElementById('privacySetup');
        const errorDiv = document.getElementById('privacyPasswordError');
        const errorText = document.getElementById('privacyPasswordErrorText');
        
        if (!password || password.length < 4) {
            this.showPasswordError('密码至少需要4位字符');
            return;
        }
        
        const savedPassword = localStorage.getItem('bookmarkhub_privacy_password');
        
        if (!savedPassword) {
            // 首次设置密码
            if (setupDiv.style.display !== 'none') {
                if (!confirmPassword) {
                    this.showPasswordError('请确认密码');
                    return;
                }
                if (password !== confirmPassword) {
                    this.showPasswordError('两次输入的密码不一致');
                    return;
                }
                
                // 保存密码（简单加密）
                const encryptedPassword = btoa(password);
                localStorage.setItem('bookmarkhub_privacy_password', encryptedPassword);
                this.showToast('隐私空间密码设置成功！', 'success');
            }
        } else {
            // 验证密码 - 支持新旧两种验证方式
            if (!this.verifyPrivacyPassword(password)) {
                // 尝试旧的验证方式
                try {
            const decryptedPassword = atob(savedPassword);
            if (password !== decryptedPassword) {
                this.showPasswordError('密码错误，请重试');
                return;
                    }
                    // 如果旧密码验证成功，更新为新的哈希格式
                    const passwordHash = btoa(password + 'salt_key_2024');
                    localStorage.setItem('bookmarkhub_privacy_password', passwordHash);
                } catch (error) {
                    this.showPasswordError('密码错误，请重试');
                    return;
                }
            }
        }
        
        // 密码验证成功，进入隐私空间
        this.privacyPassword = password;
        this.enterPrivacySpace();
        this.hidePrivacyPasswordModal();
    }
    
    // 显示密码错误
    showPasswordError(message) {
        const errorDiv = document.getElementById('privacyPasswordError');
        const errorText = document.getElementById('privacyPasswordErrorText');
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
    }
    
    // 切换密码可见性
    togglePasswordVisibility(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
    
    // 进入隐私空间
    enterPrivacySpace() {
        this.isPrivacyMode = true;
        this.loadPrivacyData();
        
        // 检查是否有临时导入的数据需要处理
        this.checkAndProcessTempImportedData();
        
        // 隐藏主界面，显示隐私空间
        document.querySelector('.app').style.display = 'none';
        document.getElementById('privacySpace').style.display = 'block';
        
        // 重新绑定隐私空间的事件（确保元素已显示）
        this.bindPrivacySpaceEvents();
        
        // 渲染隐私空间内容
        this.renderPrivacySpace();
        this.showToast('欢迎进入隐私空间 🔒', 'info');
    }
    
    // 退出隐私空间
    exitPrivacySpace() {
        this.isPrivacyMode = false;
        this.privacyPassword = null;
        
        // 显示主界面，隐藏隐私空间
        document.getElementById('privacySpace').style.display = 'none';
        document.querySelector('.app').style.display = 'block';
        
        this.showToast('已退出隐私空间', 'info');
    }
    
    // 加载隐私空间数据
    loadPrivacyData() {
        if (!this.privacyPassword) return;
        
        // 优先尝试加载安全加密的数据
        if (this.loadPrivacyDataSecure()) {
            // 修复加载后的隐私数据一致性
            this.fixOrphanedPrivacyBookmarks();
            return;
        }
        
        // 兼容旧版本数据格式
        const savedPrivacyBookmarks = localStorage.getItem('bookmarkhub_privacy_bookmarks');
        const savedPrivacyCategories = localStorage.getItem('bookmarkhub_privacy_categories');
        
        if (savedPrivacyBookmarks) {
            this.privacyBookmarks = JSON.parse(savedPrivacyBookmarks);
        }
        
        if (savedPrivacyCategories) {
            this.privacyCategories = JSON.parse(savedPrivacyCategories);
        }
        
        // 修复加载后的隐私数据一致性
        this.fixOrphanedPrivacyBookmarks();
        
        // 如果加载了旧数据，立即转换为新的安全格式
        if (savedPrivacyBookmarks || savedPrivacyCategories) {
            this.savePrivacyDataSecure();
        }
    }
    
    // 保存隐私空间数据
    savePrivacyData() {
        // 使用新的安全保存方法
        this.savePrivacyDataSecure();
        
        // 为了兼容性，暂时保留旧方法
        if (!this.isPrivacyMode) return;
        localStorage.setItem('bookmarkhub_privacy_bookmarks', JSON.stringify(this.privacyBookmarks));
        localStorage.setItem('bookmarkhub_privacy_categories', JSON.stringify(this.privacyCategories));
    }
    
    // 渲染隐私空间
    renderPrivacySpace() {
        this.renderPrivacyCategories();
        this.renderPrivacyBookmarks();
        this.updateCategoryOptions(); // 使用统一的分类选项更新函数
        this.updateBatchActions();
    }
    
    // 渲染隐私分类
    renderPrivacyCategories() {
        const container = document.getElementById('privacyCategoryChips');
        const addButton = container.querySelector('.add-category');
        
        // 清除现有分类（保留全部和未分类）
        const existingChips = container.querySelectorAll('.chip:not([data-category="all"]):not([data-category="uncategorized"]):not(.add-category):not(.more-categories)');
        existingChips.forEach(chip => chip.remove());
        
        // 移除之前的"更多"按钮
        const existingMoreBtn = container.querySelector('.more-categories');
        if (existingMoreBtn) {
            existingMoreBtn.remove();
        }
        
        // 根据屏幕宽度决定显示的分类数量
        const isMobile = window.innerWidth <= 768;
        const maxVisibleCategories = isMobile ? 3 : 5;
        const visibleCategories = this.privacyCategories.slice(0, maxVisibleCategories);
        const hiddenCategories = this.privacyCategories.slice(maxVisibleCategories);
        
        // 添加可见的自定义分类
        visibleCategories.forEach(category => {
            const chip = this.createPrivacyCategoryChip(category);
            container.insertBefore(chip, addButton);
        });
        
        // 如果有隐藏的分类，添加"更多"按钮
        if (hiddenCategories.length > 0) {
            const moreButton = document.createElement('button');
            moreButton.className = 'chip more-categories';
            moreButton.innerHTML = `更多 <span class="category-count">(${hiddenCategories.length})</span>`;
            moreButton.addEventListener('click', () => {
                this.showMorePrivacyCategoriesModal(hiddenCategories);
            });
            container.insertBefore(moreButton, addButton);
        }
        
        // 更新现有按钮的事件监听器
        container.querySelector('[data-category="all"]').addEventListener('click', () => {
            this.setPrivacyFilter('all');
        });
        
        container.querySelector('[data-category="uncategorized"]').addEventListener('click', () => {
            this.setPrivacyFilter('uncategorized');
        });
    }
    
    // 创建隐私分类标签
    createPrivacyCategoryChip(category) {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.dataset.category = category.id;
        chip.textContent = category.name;
        chip.style.borderColor = category.color;
        
        if (this.privacyCurrentFilter === category.id) {
            chip.classList.add('active');
            chip.style.backgroundColor = category.color;
            chip.style.color = 'white';
        }
        
        chip.addEventListener('click', () => {
            this.setPrivacyFilter(category.id);
        });
        
        return chip;
    }
    
    // 设置隐私空间过滤器
    setPrivacyFilter(filter) {
        this.privacyCurrentFilter = filter;
        this.renderPrivacyCategories();
        this.renderPrivacyBookmarks();
        
        // 更新批量操作按钮
        this.updateBatchActions();
    }
    
    // 渲染隐私书签
    renderPrivacyBookmarks() {
        const container = document.getElementById('privacyBookmarksGrid');
        const emptyState = document.getElementById('privacyEmptyState');
        container.innerHTML = '';
        
        const filteredBookmarks = this.getFilteredPrivacyBookmarks();
        
        if (filteredBookmarks.length === 0) {
            emptyState.style.display = 'flex';
            return;
        } else {
            emptyState.style.display = 'none';
        }
        
        filteredBookmarks.forEach(bookmark => {
            const card = this.createBookmarkCard(bookmark);
            container.appendChild(card);
        });
    }
    
    // 获取过滤后的隐私书签
    getFilteredPrivacyBookmarks() {
        let filtered = this.privacyBookmarks;
        
        // 按分类过滤
        if (this.privacyCurrentFilter !== 'all') {
            if (this.privacyCurrentFilter === 'uncategorized') {
                filtered = filtered.filter(bookmark => !bookmark.categoryId);
            } else {
                filtered = filtered.filter(bookmark => bookmark.categoryId === this.privacyCurrentFilter);
            }
        }
        
        // 按搜索关键词过滤 - 支持高级搜索语法
        const searchQuery = document.getElementById('privacySearchInput').value.trim();
        if (searchQuery) {
            filtered = filtered.filter(bookmark => this.matchesAdvancedSearch(bookmark, searchQuery));
        }
        
        // 按创建时间排序（最新的在前）
        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    // 处理隐私空间搜索
    handlePrivacySearch(query) {
        this.renderPrivacyBookmarks();
    }
    
    // 切换隐私搜索帮助显示
    togglePrivacySearchHelp() {
        const searchHelp = document.getElementById('privacySearchHelp');
        searchHelp.classList.toggle('show');
    }
    
    // 绑定隐私空间内的事件（在进入隐私空间后调用）
    bindPrivacySpaceEvents() {
        
        // 隐私空间搜索
        const privacySearchInput = document.getElementById('privacySearchInput');
        if (privacySearchInput) {
            // 移除之前的监听器
            privacySearchInput.removeEventListener('input', this.privacySearchHandler);
            // 绑定新的监听器
            this.privacySearchHandler = (e) => {
                if (this.isPrivacyMode) {
                    this.handlePrivacySearch(e.target.value);
                }
            };
            privacySearchInput.addEventListener('input', this.privacySearchHandler);
        }
        
        // 隐私空间搜索帮助
        const privacySearchHelpBtn = document.getElementById('privacySearchHelpBtn');
        if (privacySearchHelpBtn) {
            privacySearchHelpBtn.removeEventListener('click', this.privacySearchHelpHandler);
            this.privacySearchHelpHandler = (e) => {
                e.stopPropagation();
                this.togglePrivacySearchHelp();
            };
            privacySearchHelpBtn.addEventListener('click', this.privacySearchHelpHandler);
        }
        
        // 添加隐私书签
        const addPrivacyBookmarkBtn = document.getElementById('addPrivacyBookmarkBtn');
        if (addPrivacyBookmarkBtn) {
            addPrivacyBookmarkBtn.removeEventListener('click', this.addPrivacyBookmarkHandler);
            this.addPrivacyBookmarkHandler = () => {
                if (this.isPrivacyMode) {
                    this.showBookmarkModal();
                }
            };
            addPrivacyBookmarkBtn.addEventListener('click', this.addPrivacyBookmarkHandler);
        }
        
        // 添加隐私分类
        const addPrivacyCategoryBtn = document.getElementById('addPrivacyCategoryBtn');
        if (addPrivacyCategoryBtn) {
            addPrivacyCategoryBtn.removeEventListener('click', this.addPrivacyCategoryHandler);
            this.addPrivacyCategoryHandler = () => {
                if (this.isPrivacyMode) {
                    this.showCategoryModal();
                }
            };
            addPrivacyCategoryBtn.addEventListener('click', this.addPrivacyCategoryHandler);
        }
        
        // 隐私空间备份按钮
        const privacyBackupBtn = document.getElementById('privacyBackupBtn');
        if (privacyBackupBtn) {
            privacyBackupBtn.removeEventListener('click', this.privacyBackupHandler);
            this.privacyBackupHandler = () => {
                this.showBackupModal();
            };
            privacyBackupBtn.addEventListener('click', this.privacyBackupHandler);
        }
        
        // 隐私空间设置按钮
        const privacySettingsBtn = document.getElementById('privacySettingsBtn');
        if (privacySettingsBtn) {
            privacySettingsBtn.removeEventListener('click', this.privacySettingsHandler);
            this.privacySettingsHandler = () => {
                this.showPrivacySettingsModal();
            };
            privacySettingsBtn.addEventListener('click', this.privacySettingsHandler);
        }
        
        // 退出隐私空间
        const exitPrivacySpaceBtn = document.getElementById('exitPrivacySpaceBtn');
        if (exitPrivacySpaceBtn) {
            exitPrivacySpaceBtn.removeEventListener('click', this.exitPrivacySpaceHandler);
            this.exitPrivacySpaceHandler = () => {
                this.exitPrivacySpace();
            };
            exitPrivacySpaceBtn.addEventListener('click', this.exitPrivacySpaceHandler);
        }
        
        // 点击其他地方关闭隐私搜索帮助
        document.addEventListener('click', (e) => {
            const searchHelp = document.getElementById('privacySearchHelp');
            const searchHelpBtn = document.getElementById('privacySearchHelpBtn');
            if (searchHelp && searchHelpBtn && 
                !searchHelp.contains(e.target) && !searchHelpBtn.contains(e.target)) {
                searchHelp.classList.remove('show');
            }
        });
    }
    
    
    // 设置过滤器
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 重置到第一页
        this.currentPage = 1;
        
        // 更新分类按钮状态
        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.remove('active');
            chip.style.backgroundColor = '';
            chip.style.color = '';
        });
        
        const activeChip = document.querySelector(`[data-category="${filter}"]`);
        if (activeChip) {
            activeChip.classList.add('active');
            if (filter !== 'all' && filter !== 'uncategorized') {
                const category = this.categories.find(cat => cat.id === filter);
                if (category) {
                    activeChip.style.backgroundColor = category.color;
                    activeChip.style.color = 'white';
                }
            }
        }
        
        // 显示/隐藏批量删除按钮
        this.updateBatchActions();
        
        this.renderBookmarks();
    }
    
    // 更新批量操作按钮显示状态
    updateBatchActions() {
        const batchActions = document.getElementById('batchActions');
        const privacyBatchActions = document.getElementById('privacyBatchActions');
        
        if (this.isPrivacyMode) {
            // 隐私空间
            if (privacyBatchActions) {
                const shouldShow = this.privacyCurrentFilter !== 'all' && 
                                 this.getFilteredPrivacyBookmarks().length > 0;
                privacyBatchActions.style.display = shouldShow ? 'flex' : 'none';
            }
        } else {
            // 普通模式
            if (batchActions) {
                const shouldShow = this.currentFilter !== 'all' && 
                                 this.getFilteredBookmarks().length > 0;
                batchActions.style.display = shouldShow ? 'flex' : 'none';
                
            }
        }
    }
    
    // 显示批量删除确认对话框
    showBatchDeleteConfirm() {
        const categoryName = this.getCategoryName(this.currentFilter);
        const bookmarksCount = this.getFilteredBookmarks().length;
        
        if (bookmarksCount === 0) {
            this.showToast('当前分类下没有书签', 'info');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>批量删除确认</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="warning-content">
                        <i class="fas fa-exclamation-triangle" style="color: var(--error); font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>您确定要<strong style="color: var(--error);">彻底删除</strong>分类 <strong>"${categoryName}"</strong> 下的所有 <strong>${bookmarksCount}</strong> 个书签吗？</p>
                        <p style="color: var(--on-surface-variant); font-size: 0.9rem; margin: 0.5rem 0;">
                            这些书签将从所有位置完全移除，包括"全部"标签页。
                        </p>
                        <p style="color: var(--error); font-size: 0.9rem; margin-top: 1rem;">
                            <i class="fas fa-exclamation-triangle"></i> 此操作不可撤销！
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-batch-delete">取消</button>
                    <button class="btn btn-danger confirm-batch-delete">删除所有书签</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // 绑定事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.cancel-batch-delete').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.confirm-batch-delete').addEventListener('click', () => {
            this.batchDeleteBookmarks();
            document.body.removeChild(modal);
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // 显示隐私空间批量删除确认对话框
    showPrivacyBatchDeleteConfirm() {
        const categoryName = this.getPrivacyCategoryName(this.privacyCurrentFilter);
        const bookmarksCount = this.getFilteredPrivacyBookmarks().length;
        
        if (bookmarksCount === 0) {
            this.showToast('当前分类下没有隐私书签', 'info');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>批量删除确认</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="warning-content">
                        <i class="fas fa-exclamation-triangle" style="color: var(--error); font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>您确定要<strong style="color: var(--error);">彻底删除</strong>隐私分类 <strong>"${categoryName}"</strong> 下的所有 <strong>${bookmarksCount}</strong> 个书签吗？</p>
                        <p style="color: var(--on-surface-variant); font-size: 0.9rem; margin: 0.5rem 0;">
                            这些隐私书签将从所有位置完全移除，包括隐私空间的"全部"标签页。
                        </p>
                        <p style="color: var(--error); font-size: 0.9rem; margin-top: 1rem;">
                            <i class="fas fa-exclamation-triangle"></i> 此操作不可撤销！
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-batch-delete">取消</button>
                    <button class="btn btn-danger confirm-batch-delete">删除所有书签</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.add('show');
        
        // 绑定事件
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.cancel-batch-delete').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.confirm-batch-delete').addEventListener('click', () => {
            this.batchDeletePrivacyBookmarks();
            document.body.removeChild(modal);
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    // 执行批量删除书签
    batchDeleteBookmarks() {
        const bookmarksToDelete = this.getFilteredBookmarks();
        const categoryName = this.getCategoryName(this.currentFilter);
        const deleteCount = bookmarksToDelete.length;
        
        // 获取要删除的书签ID列表
        const bookmarkIdsToDelete = bookmarksToDelete.map(bookmark => bookmark.id);
        
        // 真正删除书签（从所有书签中移除）
        this.bookmarks = this.bookmarks.filter(bookmark => !bookmarkIdsToDelete.includes(bookmark.id));
        
        // 保存数据
        this.saveData();
        
        // 先清空书签容器，确保旧的DOM元素被移除
        const container = document.getElementById('bookmarksGrid');
        if (container) {
            container.innerHTML = '';
        }
        
        // 切换回全部视图并强制重新渲染
        this.setFilter('all');
        
        // 确保界面完全更新
        setTimeout(() => {
            this.render(); // 使用完整的render方法而不只是renderBookmarks
        }, 50);
        
        this.showToast(`已彻底删除分类"${categoryName}"下的 ${deleteCount} 个书签`, 'success');
    }
    
    // 执行批量删除隐私书签
    batchDeletePrivacyBookmarks() {
        const bookmarksToDelete = this.getFilteredPrivacyBookmarks();
        const categoryName = this.getPrivacyCategoryName(this.privacyCurrentFilter);
        const deleteCount = bookmarksToDelete.length;
        
        // 获取要删除的隐私书签ID列表
        const bookmarkIdsToDelete = bookmarksToDelete.map(bookmark => bookmark.id);
        
        // 真正删除隐私书签（从所有隐私书签中移除）
        this.privacyBookmarks = this.privacyBookmarks.filter(bookmark => !bookmarkIdsToDelete.includes(bookmark.id));
        
        // 保存数据
        this.savePrivacyData();
        
        // 先清空隐私书签容器，确保旧的DOM元素被移除
        const container = document.getElementById('bookmarksGrid');
        if (container) {
            container.innerHTML = '';
        }
        
        // 切换回全部视图并强制重新渲染
        this.setPrivacyFilter('all');
        
        // 确保界面完全更新
        setTimeout(() => {
            this.renderPrivacySpace(); // 使用完整的隐私空间渲染方法
        }, 50);
        
        this.showToast(`已彻底删除隐私分类"${categoryName}"下的 ${deleteCount} 个书签`, 'success');
    }
    
    // 获取分类名称
    getCategoryName(categoryId) {
        if (categoryId === 'uncategorized') {
            return '未分类';
        }
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : '未知分类';
    }
    
    // 获取隐私分类名称
    getPrivacyCategoryName(categoryId) {
        if (categoryId === 'uncategorized') {
            return '未分类';
        }
        const category = this.privacyCategories.find(cat => cat.id === categoryId);
        return category ? category.name : '未知分类';
    }
    
    // 处理搜索
    handleSearch(query) {
        // 重置到第一页
        this.currentPage = 1;
        this.renderBookmarks();
        
        // 更新批量操作按钮（搜索后可能影响显示）
        this.updateBatchActions();
    }
    
    // 显示书签模态框
    showBookmarkModal(bookmark = null) {
        this.currentBookmark = bookmark;
        const modal = document.getElementById('bookmarkModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('bookmarkForm');
        
        // 确保模态框在正确的位置 - 移动到body下
        if (modal.parentElement.style.display === 'none') {
            document.body.appendChild(modal);
        }
        
        if (bookmark) {
            title.textContent = '编辑书签';
            document.getElementById('bookmarkUrl').value = bookmark.url;
            document.getElementById('bookmarkTitle').value = bookmark.title;
            document.getElementById('bookmarkDescription').value = bookmark.description || '';
            document.getElementById('bookmarkImage').value = bookmark.imageUrl || '';
            document.getElementById('bookmarkCategory').value = bookmark.categoryId || '';
            
            
            // 如果有图片，显示预览
            if (bookmark.imageUrl) {
                this.handleImagePreview(bookmark.imageUrl);
            }
        } else {
            title.textContent = this.isPrivacyMode ? '添加隐私书签' : '添加书签';
            form.reset();
            this.removeImagePreview();
        }
        
        modal.classList.add('show');
        document.getElementById('bookmarkUrl').focus();
    }
    
    // 隐藏书签模态框
    hideBookmarkModal() {
        const modal = document.getElementById('bookmarkModal');
        modal.classList.remove('show');
        // 重置内联样式
        modal.style.display = '';
        modal.style.opacity = '';
        modal.style.visibility = '';
        
        // 重置模态框内容样式
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = '';
            modalContent.style.background = '';
            modalContent.style.color = '';
            modalContent.style.display = '';
            modalContent.style.opacity = '';
            modalContent.style.visibility = '';
        }
        
        this.currentBookmark = null;
    }
    
    // 显示分类模态框
    showCategoryModal() {
        const modal = document.getElementById('categoryModal');
        
        // 确保模态框在正确的位置 - 移动到body下
        if (modal.parentElement.style.display === 'none') {
            document.body.appendChild(modal);
        }
        
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryColor').value = '#2196F3';
        document.querySelector('.color-preview').style.backgroundColor = '#2196F3';
        modal.classList.add('show');
        document.getElementById('categoryName').focus();
    }
    
    // 隐藏分类模态框
    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('show');
        // 重置内联样式
        modal.style.display = '';
        modal.style.opacity = '';
        modal.style.visibility = '';
        
        // 重置模态框内容样式
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = '';
            modalContent.style.background = '';
            modalContent.style.color = '';
            modalContent.style.display = '';
            modalContent.style.opacity = '';
            modalContent.style.visibility = '';
        }
    }
    
    // 显示删除确认模态框
    showDeleteModal(bookmark) {
        this.currentBookmark = bookmark;
        const modal = document.getElementById('deleteModal');
        
        // 确保模态框在正确的位置 - 移动到body下
        if (modal.parentElement.style.display === 'none') {
            console.log('🔄 删除确认模态框父容器被隐藏，移动模态框到body');
            document.body.appendChild(modal);
        }
        
        const message = document.getElementById('deleteMessage');
        message.textContent = `确定要删除「${bookmark.title}」吗？此操作无法撤销。`;
        modal.classList.add('show');
    }
    
    // 隐藏删除确认模态框
    hideDeleteModal() {
        document.getElementById('deleteModal').classList.remove('show');
        this.currentBookmark = null;
    }
    
    // 隐藏所有模态框
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        this.currentBookmark = null;
    }
    
    // 处理书签表单提交
    handleBookmarkSubmit() {
        let url = document.getElementById('bookmarkUrl').value.trim();
        const title = document.getElementById('bookmarkTitle').value.trim();
        const description = document.getElementById('bookmarkDescription').value.trim();
        const imageUrl = document.getElementById('bookmarkImage').value.trim();
        const categoryId = document.getElementById('bookmarkCategory').value;
        
        if (!url || !title) {
            this.showToast('请填写必填字段', 'error');
            return;
        }
        
        // 智能修正URL格式
        url = this.normalizeUrl(url);
        
        // 验证修正后的URL格式
        if (!this.isValidUrl(url)) {
            this.showToast('请输入有效的网址（如：baidu.com 或 https://www.baidu.com）', 'error');
            return;
        }
        
        // 验证图片URL（如果提供）
        if (imageUrl && !this.isValidImageUrl(imageUrl)) {
            this.showToast('请输入有效的图片链接', 'error');
            return;
        }
        
        if (this.currentBookmark) {
            // 编辑现有书签
            this.currentBookmark.url = url;
            this.currentBookmark.title = title;
            this.currentBookmark.description = description;
            this.currentBookmark.imageUrl = imageUrl || null;
            this.currentBookmark.categoryId = categoryId || null;
            this.currentBookmark.updatedAt = Date.now();
            
            this.showToast(this.isPrivacyMode ? '隐私书签已更新' : '书签已更新', 'success');
        } else {
            // 添加新书签
            const bookmark = {
                id: this.generateId(),
                url,
                title,
                description,
                imageUrl: imageUrl || null,
                categoryId: categoryId || null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                visitCount: 0
            };
            
            if (this.isPrivacyMode) {
                this.privacyBookmarks.push(bookmark);
            } else {
                this.bookmarks.push(bookmark);
            }
            this.showToast(this.isPrivacyMode ? '隐私书签已添加' : '书签已添加', 'success');
        }
        
        if (this.isPrivacyMode) {
            this.savePrivacyData();
            this.renderPrivacySpace();
        } else {
            this.saveData();
            this.render();
        }
        this.hideBookmarkModal();
    }
    
    // 处理分类表单提交
    handleCategorySubmit() {
        const name = document.getElementById('categoryName').value.trim();
        const color = document.getElementById('categoryColor').value;
        
        if (!name) {
            this.showToast('请输入分类名称', 'error');
            return;
        }
        
        // 检查分类名称是否已存在
        const categories = this.isPrivacyMode ? this.privacyCategories : this.categories;
        if (categories.some(cat => cat.name === name)) {
            this.showToast('分类名称已存在', 'error');
            return;
        }
        
        const category = {
            id: this.generateId(),
            name,
            color
        };
        
        if (this.isPrivacyMode) {
            this.privacyCategories.push(category);
            this.savePrivacyData();
            this.renderPrivacySpace();
        } else {
            this.categories.push(category);
            this.saveData();
            this.render();
        }
        this.hideCategoryModal();
        this.showToast(this.isPrivacyMode ? '隐私分类已添加' : '分类已添加', 'success');
    }
    
    // 打开书签
    openBookmark(bookmark) {
        // 增加访问计数
        bookmark.visitCount = (bookmark.visitCount || 0) + 1;
        bookmark.lastVisited = Date.now();
        this.saveData();
        
        // 在新标签页打开
        window.open(bookmark.url, '_blank');
        this.showToast('正在打开书签...', 'info');
    }
    
    // 编辑书签
    editBookmark(bookmark) {
        this.showBookmarkModal(bookmark);
    }
    
    // 删除书签
    deleteBookmark(bookmark) {
        this.showDeleteModal(bookmark);
    }
    
    // 确认删除
    confirmDelete() {
        if (this.currentBookmark) {
            const bookmarks = this.isPrivacyMode ? this.privacyBookmarks : this.bookmarks;
            const index = bookmarks.findIndex(b => b.id === this.currentBookmark.id);
            if (index > -1) {
                bookmarks.splice(index, 1);
                if (this.isPrivacyMode) {
                    this.savePrivacyData();
                    this.renderPrivacySpace();
                } else {
                    this.saveData();
                    this.render();
                }
                this.showToast(this.isPrivacyMode ? '隐私书签已删除' : '书签已删除', 'success');
            }
        }
        this.hideDeleteModal();
    }
    
    // 更新分类选择器选项
    updateCategoryOptions() {
        const select = document.getElementById('bookmarkCategory');
        const currentValue = select.value;
        
        // 清除现有选项（保留未分类）
        select.innerHTML = '<option value="">未分类</option>';
        
        // 根据当前模式选择分类数据
        const categories = this.isPrivacyMode ? this.privacyCategories : this.categories;
        
        // 添加自定义分类选项
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
        
        // 恢复之前的选择
        select.value = currentValue;
    }
    
    // 验证并修正URL格式
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // 智能修正URL格式
    normalizeUrl(url) {
        if (!url) return '';
        
        // 去除首尾空格
        url = url.trim();
        
        // 如果已经有协议，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // 如果是常见的域名格式，自动添加https://
        if (url.includes('.') && !url.includes(' ')) {
            return 'https://' + url;
        }
        
        return url;
    }
    
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 处理图片预览
    handleImagePreview(imageUrl) {
        const previewContainer = document.getElementById('imagePreviewContainer');
        const previewImg = document.getElementById('imagePreview');
        
        if (!imageUrl || !this.isValidImageUrl(imageUrl)) {
            previewContainer.style.display = 'none';
            return;
        }
        
        // 显示加载状态
        previewImg.src = '';
        previewContainer.style.display = 'block';
        
        // 加载图片
        const img = new Image();
        img.onload = () => {
            previewImg.src = imageUrl;
        };
        img.onerror = () => {
            previewContainer.style.display = 'none';
            this.showToast('图片加载失败，请检查链接是否正确', 'error');
        };
        img.src = imageUrl;
    }
    
    // 移除图片预览
    removeImagePreview() {
        document.getElementById('bookmarkImage').value = '';
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }
    
    // 验证图片URL
    isValidImageUrl(url) {
        if (!url) return false;
        
        // 基本URL验证
        try {
            new URL(url);
        } catch {
            return false;
        }
        
        // 检查图片文件扩展名
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i;
        return imageExtensions.test(url);
    }
    
    
    // 显示Toast通知
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');
        
        // 设置图标
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        icon.className = `toast-icon ${icons[type] || icons.info}`;
        messageEl.textContent = message;
        
        // 设置样式类
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // 加密工具函数
    encrypt(text, password) {
        // 简单的XOR加密（生产环境建议使用更强的加密算法）
        // 先将文本转换为UTF-8编码的base64，然后再加密
        const utf8Text = unescape(encodeURIComponent(text));
        const key = this.generateKeyFromPassword(password);
        let encrypted = '';
        for (let i = 0; i < utf8Text.length; i++) {
            encrypted += String.fromCharCode(utf8Text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        // 将二进制数据转换为十六进制字符串，避免btoa的Latin1限制
        return this.binaryToHex(encrypted);
    }
    
    // 解密工具函数
    decrypt(encryptedText, password) {
        try {
            const key = this.generateKeyFromPassword(password);
            let encrypted;
            let isHexFormat = true;
            
            // 尝试判断是新格式（十六进制）还是旧格式（base64）
            try {
                encrypted = this.hexToBinary(encryptedText);
            } catch (hexError) {
                // 如果十六进制解析失败，尝试base64格式（向后兼容）
                try {
                    encrypted = atob(encryptedText);
                    isHexFormat = false;
                } catch (base64Error) {
                    throw new Error('无法解析加密数据格式');
                }
            }
            
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            
            // 如果是新格式，需要进行UTF-8解码
            if (isHexFormat) {
                return decodeURIComponent(escape(decrypted));
            } else {
                // 旧格式直接返回
                return decrypted;
            }
        } catch (error) {
            console.error('解密错误:', error);
            throw new Error('解密失败: ' + error.message);
        }
    }
    
    // 从密码生成密钥
    generateKeyFromPassword(password) {
        let key = password;
        while (key.length < 32) {
            key += password;
        }
        return key.substring(0, 32);
    }
    
    // 将二进制字符串转换为十六进制
    binaryToHex(binary) {
        let hex = '';
        for (let i = 0; i < binary.length; i++) {
            const byte = binary.charCodeAt(i);
            hex += byte.toString(16).padStart(2, '0');
        }
        return hex;
    }
    
    // 将十六进制字符串转换为二进制
    hexToBinary(hex) {
        let binary = '';
        for (let i = 0; i < hex.length; i += 2) {
            const byte = parseInt(hex.substr(i, 2), 16);
            binary += String.fromCharCode(byte);
        }
        return binary;
    }
    
    // 安全保存隐私数据
    savePrivacyDataSecure() {
        if (!this.privacyPassword) return;
        
        try {
            const privacyData = {
                bookmarks: this.privacyBookmarks || [],
                categories: this.privacyCategories || [],
                timestamp: Date.now()
            };
            
            const encryptedData = this.encrypt(JSON.stringify(privacyData), this.privacyPassword);
            localStorage.setItem('bookmarkhub_privacy_data_secure', encryptedData);
            
            // 保存密码哈希用于验证
            const passwordHash = btoa(this.privacyPassword + 'salt_key_2024');
            localStorage.setItem('bookmarkhub_privacy_password', passwordHash);
        } catch (error) {
            console.error('隐私数据保存失败:', error);
        }
    }
    
    // 安全加载隐私数据
    loadPrivacyDataSecure() {
        if (!this.privacyPassword) return false;
        
        try {
            const encryptedData = localStorage.getItem('bookmarkhub_privacy_data_secure');
            if (!encryptedData) return false;
            
            const decryptedData = this.decrypt(encryptedData, this.privacyPassword);
            const privacyData = JSON.parse(decryptedData);
            
            this.privacyBookmarks = privacyData.bookmarks || [];
            this.privacyCategories = privacyData.categories || [];
            return true;
        } catch (error) {
            console.error('隐私数据加载失败:', error);
            return false;
        }
    }
    
    // 验证隐私密码
    verifyPrivacyPassword(password) {
        const savedHash = localStorage.getItem('bookmarkhub_privacy_password');
        if (!savedHash) return false;
        
        const passwordHash = btoa(password + 'salt_key_2024');
        return passwordHash === savedHash;
    }
    
    // 导出所有数据（包括隐私数据）
    exportAllData(includePrivacy = false, privacyPassword = null) {
        console.log('exportAllData被调用，包含隐私数据:', includePrivacy, '密码长度:', privacyPassword ? privacyPassword.length : 0);
        
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            bookmarks: this.bookmarks,
            categories: this.categories
        };
        
        console.log('基础数据准备完成 - 书签:', data.bookmarks.length, '分类:', data.categories.length);
        
        // 如果需要包含隐私数据
        if (includePrivacy) {
            console.log('开始处理隐私数据');
            
            // 检查是否设置了隐私空间密码
            const savedPassword = localStorage.getItem('bookmarkhub_privacy_password');
            if (!savedPassword) {
                this.showToast('未设置隐私空间密码，无法导出隐私数据', 'error');
                return;
            }
            
            if (!privacyPassword) {
                this.showToast('请输入隐私空间密码', 'error');
                return;
            }
            
            if (!this.verifyPrivacyPassword(privacyPassword)) {
                this.showToast('隐私空间密码错误', 'error');
                return;
            }
            
            console.log('密码验证通过，开始加载隐私数据');
            
            // 密码验证成功，先尝试加载隐私数据
            const tempPrivacyPassword = this.privacyPassword;
            this.privacyPassword = privacyPassword;
            this.loadPrivacyData();
            
            const privacyData = {
                bookmarks: this.privacyBookmarks || [],
                categories: this.privacyCategories || []
            };
            
            console.log('隐私数据加载完成 - 书签:', privacyData.bookmarks.length, '分类:', privacyData.categories.length);
            
            // 恢复原来的密码状态
            this.privacyPassword = tempPrivacyPassword;
            
            // 检查是否有隐私数据
            if (privacyData.bookmarks.length === 0 && privacyData.categories.length === 0) {
                this.showToast('隐私空间暂无数据，已导出普通数据', 'warning');
                // 继续导出普通数据，不包含隐私数据
            } else {
                console.log('开始加密隐私数据');
                data.privacyData = this.encrypt(JSON.stringify(privacyData), privacyPassword);
                console.log('隐私数据加密完成，长度:', data.privacyData.length);
            }
        }
        
        console.log('准备下载文件');
        const jsonString = JSON.stringify(data, null, 2);
        const filename = `bookmarkhub-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        // 统一使用标准的文件下载方式（移除移动端特殊处理）
        console.log('导出备份文件，使用标准方式');
        try {
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                if (document.body.contains(a)) {
                    document.body.removeChild(a);
                }
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.log('文件下载失败:', error);
            this.showToast('下载失败，请重试', 'error');
            return;
        }
        
        const message = includePrivacy ? '完整数据备份已导出（含隐私数据）' : '数据备份已导出';
        this.showToast(message, 'success');
        console.log('导出完成:', message);
    }
    
    // 导出数据（仅普通数据）
    exportData() {
        this.exportAllData(false);
    }
    
    // 导入数据
    importData(file, privacyPassword = null) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!data.bookmarks || !data.categories) {
                    this.showToast('无效的备份文件：缺少必要数据', 'error');
                    return;
                }
                
                // 导入普通数据
                    this.bookmarks = data.bookmarks;
                    this.categories = data.categories;
                    
                    // 修复导入后的数据一致性问题
                    this.fixOrphanedBookmarks();
                    
                    this.saveData();
                
                // 如果有隐私数据且提供了密码
                if (data.privacyData && privacyPassword) {
                    try {
                        const decryptedPrivacyData = this.decrypt(data.privacyData, privacyPassword);
                        const privacyData = JSON.parse(decryptedPrivacyData);
                        
                        // 先保存解密后的数据，但不立即加密保存
                        const importedBookmarks = privacyData.bookmarks || [];
                        const importedCategories = privacyData.categories || [];
                        
                        // 检查是否已有隐私空间密码
                        const existingPasswordHash = localStorage.getItem('bookmarkhub_privacy_password');
                        if (!existingPasswordHash) {
                            // 如果没有现有密码，则设置为导入时使用的密码
                            this.privacyBookmarks = importedBookmarks;
                            this.privacyCategories = importedCategories;
                            this.fixOrphanedPrivacyBookmarks();
                            this.privacyPassword = privacyPassword;
                            this.savePrivacyDataSecure();
                            
                            const passwordHash = btoa(privacyPassword + 'salt_key_2024');
                            localStorage.setItem('bookmarkhub_privacy_password', passwordHash);
                            this.showToast('数据和隐私数据已成功导入，隐私空间密码已设置', 'success');
                        } else {
                            // 如果已有密码，智能处理导入
                            this.handlePrivacyDataImport(importedBookmarks, importedCategories, privacyPassword);
                        }
                    } catch (error) {
                        this.showToast('隐私数据解密失败，仅导入普通数据', 'warning');
                    }
                } else {
                    if (data.privacyData && !privacyPassword) {
                        this.showToast('备份包含隐私数据但未提供密码，仅导入普通数据', 'warning');
                    } else {
                        this.showToast('数据已成功导入', 'success');
                }
                }
                
                this.render();
            } catch (error) {
                this.showToast('导入失败：文件格式错误', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showToast('文件读取失败', 'error');
        };
        
        reader.readAsText(file);
    }
    
    // 显示备份导入导出界面
    showBackupModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>数据备份与恢复</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="backup-section">
                        <h3><i class="fas fa-download"></i> 导出备份</h3>
                        <div class="backup-options">
                            <button class="btn btn-primary export-normal" id="exportNormalBtn">
                                <i class="fas fa-file-export"></i>
                                导出普通数据
                            </button>
                            <button class="btn btn-secondary export-all" id="exportAllBtn">
                                <i class="fas fa-shield-alt"></i>
                                导出全部数据（含隐私）
                            </button>
                        </div>
                        <div class="privacy-password-input" id="exportPrivacyPassword" style="display: none;">
                            <label>隐私空间密码：</label>
                            <input type="password" id="exportPasswordInput" placeholder="输入隐私空间密码">
                        </div>
                    </div>
                    
                    <div class="backup-section">
                        <h3><i class="fas fa-upload"></i> 导入恢复</h3>
                        <div class="import-area">
                            <input type="file" id="importFileInput" accept=".json" style="display: none;">
                            <button class="btn btn-outline" id="selectFileBtn">
                                <i class="fas fa-file-import"></i>
                                选择备份文件
                            </button>
                            <div class="file-info" id="fileInfo" style="display: none;">
                                <span id="fileName"></span>
                                <button class="btn btn-danger btn-small" id="clearFileBtn">清除</button>
                            </div>
                        </div>
                        <div class="privacy-password-input" id="importPrivacyPassword" style="display: none;">
                            <label>隐私空间密码（如果备份包含隐私数据）：</label>
                            <input type="password" id="importPasswordInput" placeholder="输入隐私空间密码">
                        </div>
                        <button class="btn btn-primary" id="importBtn" disabled>
                            <i class="fas fa-upload"></i>
                            开始导入
                        </button>
                    </div>
                    
                    <div class="backup-info">
                        <h4><i class="fas fa-info-circle"></i> 备份说明</h4>
                        <ul>
                            <li>普通数据包含所有书签和分类信息</li>
                            <li>隐私数据经过加密保护，需要密码才能访问</li>
                            <li>建议定期备份重要数据</li>
                            <li>导入数据会覆盖现有数据，请谨慎操作</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        this.bindBackupModalEvents(modal);
    }
    
    // 绑定备份模态框事件
    bindBackupModalEvents(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const exportNormalBtn = modal.querySelector('#exportNormalBtn');
        const exportAllBtn = modal.querySelector('#exportAllBtn');
        const selectFileBtn = modal.querySelector('#selectFileBtn');
        const importFileInput = modal.querySelector('#importFileInput');
        const importBtn = modal.querySelector('#importBtn');
        const clearFileBtn = modal.querySelector('#clearFileBtn');
        
        // 关闭模态框
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // 导出普通数据
        exportNormalBtn.addEventListener('click', () => {
            this.exportData();
        });
        
        // 导出全部数据
        exportAllBtn.addEventListener('click', () => {
            console.log('导出全部数据按钮被点击');
            const passwordDiv = modal.querySelector('#exportPrivacyPassword');
            if (passwordDiv.style.display === 'none') {
                console.log('显示密码输入框');
                passwordDiv.style.display = 'block';
                exportAllBtn.innerHTML = '<i class="fas fa-shield-alt"></i> 确认导出';
            } else {
                const password = modal.querySelector('#exportPasswordInput').value;
                console.log('准备导出，密码长度:', password.length);
                
                if (!password) {
                    this.showToast('请输入隐私空间密码', 'error');
                    return;
                }
                
                // 检查是否设置了隐私空间密码
                const savedPassword = localStorage.getItem('bookmarkhub_privacy_password');
                if (!savedPassword) {
                    this.showToast('未设置隐私空间密码，无法导出隐私数据', 'error');
                    return;
                }
                
                console.log('开始验证密码');
                if (!this.verifyPrivacyPassword(password)) {
                    console.log('密码验证失败');
                    this.showToast('隐私空间密码错误', 'error');
                    return;
                }
                
                console.log('密码验证成功，开始导出');
                this.exportAllData(true, password);
                modal.remove();
            }
        });
        
        // 选择文件
        selectFileBtn.addEventListener('click', () => {
            importFileInput.click();
        });
        
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                modal.querySelector('#fileName').textContent = file.name;
                modal.querySelector('#fileInfo').style.display = 'flex';
                modal.querySelector('#importPrivacyPassword').style.display = 'block';
                importBtn.disabled = false;
            }
        });
        
        // 清除文件
        clearFileBtn.addEventListener('click', () => {
            importFileInput.value = '';
            modal.querySelector('#fileInfo').style.display = 'none';
            modal.querySelector('#importPrivacyPassword').style.display = 'none';
            importBtn.disabled = true;
        });
        
        // 导入数据
        importBtn.addEventListener('click', () => {
            const file = importFileInput.files[0];
            const password = modal.querySelector('#importPasswordInput').value;
            
            if (!file) {
                this.showToast('请选择备份文件', 'error');
                return;
            }
            
            // 确认导入
            if (confirm('导入数据将覆盖现有数据，确定继续吗？')) {
                this.importData(file, password);
                modal.remove();
            }
        });
    }
    
    // ==================== 隐私设置相关方法 ====================
    
    // 绑定隐私设置模态框事件
    bindPrivacySettingsEvents() {
        // 隐私设置模态框关闭按钮
        const closePrivacySettingsModal = document.getElementById('closePrivacySettingsModal');
        if (closePrivacySettingsModal) {
            closePrivacySettingsModal.addEventListener('click', () => {
                this.hidePrivacySettingsModal();
            });
        }
        
        // 更改密码按钮
        const changePrivacyPasswordBtn = document.getElementById('changePrivacyPasswordBtn');
        if (changePrivacyPasswordBtn) {
            changePrivacyPasswordBtn.addEventListener('click', () => {
                this.showChangePasswordModal();
            });
        }
        
        // 更改密码表单
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChangePassword();
            });
        }
        
        // 密码显示/隐藏切换
        const currentPasswordToggle = document.getElementById('currentPasswordToggle');
        if (currentPasswordToggle) {
            currentPasswordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility('currentPassword', 'currentPasswordToggle');
            });
        }
        
        const newPasswordToggle = document.getElementById('newPasswordToggle');
        if (newPasswordToggle) {
            newPasswordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility('newPassword', 'newPasswordToggle');
            });
        }
        
        const confirmNewPasswordToggle = document.getElementById('confirmNewPasswordToggle');
        if (confirmNewPasswordToggle) {
            confirmNewPasswordToggle.addEventListener('click', () => {
                this.togglePasswordVisibility('confirmNewPassword', 'confirmNewPasswordToggle');
            });
        }
        
        // 关闭更改密码模态框
        const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
        if (closeChangePasswordModal) {
            closeChangePasswordModal.addEventListener('click', () => {
                this.hideChangePasswordModal();
            });
        }
        
        const cancelChangePasswordBtn = document.getElementById('cancelChangePasswordBtn');
        if (cancelChangePasswordBtn) {
            cancelChangePasswordBtn.addEventListener('click', () => {
                this.hideChangePasswordModal();
            });
        }
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const privacySettingsModal = document.getElementById('privacySettingsModal');
            const changePasswordModal = document.getElementById('changePasswordModal');
            
            if (e.target === privacySettingsModal) {
                this.hidePrivacySettingsModal();
            }
            
            if (e.target === changePasswordModal) {
                this.hideChangePasswordModal();
            }
        });
    }
    
    // 显示隐私设置模态框
    showPrivacySettingsModal() {
        const modal = document.getElementById('privacySettingsModal');
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
        }
    }
    
    // 隐藏隐私设置模态框
    hidePrivacySettingsModal() {
        const modal = document.getElementById('privacySettingsModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }
    
    // 显示更改密码模态框
    showChangePasswordModal() {
        // 先隐藏设置模态框
        this.hidePrivacySettingsModal();
        
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            // 清空表单
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
            
            // 隐藏错误信息
            const errorDiv = document.getElementById('changePasswordError');
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
            
            modal.classList.add('show');
            modal.style.display = 'flex';
            
            // 聚焦到当前密码输入框
            setTimeout(() => {
                document.getElementById('currentPassword').focus();
            }, 100);
        }
    }
    
    // 隐藏更改密码模态框
    hideChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }
    
    // 处理密码更改
    handleChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // 验证输入
        if (!currentPassword) {
            this.showChangePasswordError('请输入当前密码');
            return;
        }
        
        if (!newPassword || newPassword.length < 4) {
            this.showChangePasswordError('新密码至少需要4位字符');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            this.showChangePasswordError('两次输入的新密码不一致');
            return;
        }
        
        if (currentPassword === newPassword) {
            this.showChangePasswordError('新密码不能与当前密码相同');
            return;
        }
        
        // 验证当前密码
        if (!this.verifyPrivacyPassword(currentPassword)) {
            this.showChangePasswordError('当前密码错误');
            return;
        }
        
        try {
            // 重新加密所有隐私数据
            this.reencryptPrivacyData(currentPassword, newPassword);
            
            // 更新密码哈希
            const passwordHash = btoa(newPassword + 'salt_key_2024');
            localStorage.setItem('bookmarkhub_privacy_password', passwordHash);
            
            // 更新当前密码
            this.privacyPassword = newPassword;
            
            // 成功提示
            this.showToast('隐私空间密码更改成功！', 'success');
            this.hideChangePasswordModal();
            
        } catch (error) {
            console.error('密码更改失败:', error);
            this.showChangePasswordError('密码更改失败，请重试');
        }
    }
    
    // 重新加密隐私数据
    reencryptPrivacyData(oldPassword, newPassword) {
        try {
            // 加载并解密隐私书签
            const encryptedBookmarks = localStorage.getItem('bookmarkhub_privacy_bookmarks_encrypted');
            if (encryptedBookmarks) {
                const decryptedBookmarks = this.decrypt(encryptedBookmarks, oldPassword);
                const reencryptedBookmarks = this.encrypt(decryptedBookmarks, newPassword);
                localStorage.setItem('bookmarkhub_privacy_bookmarks_encrypted', reencryptedBookmarks);
            }
            
            // 加载并解密隐私分类
            const encryptedCategories = localStorage.getItem('bookmarkhub_privacy_categories_encrypted');
            if (encryptedCategories) {
                const decryptedCategories = this.decrypt(encryptedCategories, oldPassword);
                const reencryptedCategories = this.encrypt(decryptedCategories, newPassword);
                localStorage.setItem('bookmarkhub_privacy_categories_encrypted', reencryptedCategories);
            }
            
            console.log('✅ 隐私数据重新加密完成');
        } catch (error) {
            console.error('❌ 重新加密失败:', error);
            throw new Error('数据重新加密失败');
        }
    }
    
    // 显示密码更改错误信息
    showChangePasswordError(message) {
        const errorDiv = document.getElementById('changePasswordError');
        const errorText = document.getElementById('changePasswordErrorText');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.style.display = 'flex';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    // 获取当前隐私空间密码（如果用户已登录隐私空间）
    getCurrentPrivacyPassword() {
        // 如果用户当前在隐私空间，返回当前使用的密码
        if (this.isPrivacyMode && this.privacyPassword) {
            return this.privacyPassword;
        }
        return null;
    }
    
    
    // 智能处理隐私数据导入
    handlePrivacyDataImport(importedBookmarks, importedCategories, importPassword) {
        // 如果用户当前在隐私空间，直接合并数据
        if (this.isPrivacyMode && this.privacyPassword) {
            this.smartMergePrivacyData(importedBookmarks, importedCategories);
            this.showToast('隐私数据已成功导入并合并', 'success');
            return;
        }
        
        // 默认保持当前密码，延迟导入
        this.tempImportedPrivacyData = {
            bookmarks: importedBookmarks,
            categories: importedCategories,
            timestamp: Date.now()
        };
        this.showToast('隐私数据已导入，进入隐私空间时将自动合并', 'success');
    }
    
    // 智能合并隐私数据
    smartMergePrivacyData(importedBookmarks, importedCategories) {
        // 合并分类（避免重复）
        const existingCategoryNames = new Set(this.privacyCategories.map(c => c.name));
        const newCategories = importedCategories.filter(c => !existingCategoryNames.has(c.name));
        this.privacyCategories.push(...newCategories);
        
        // 合并书签（避免重复URL）
        const existingUrls = new Set(this.privacyBookmarks.map(b => b.url));
        const newBookmarks = importedBookmarks.filter(b => !existingUrls.has(b.url));
        this.privacyBookmarks.push(...newBookmarks);
        
        // 修复数据一致性并保存
        this.fixOrphanedPrivacyBookmarks();
        this.savePrivacyDataSecure();
        
        // 刷新界面
        if (this.isPrivacyMode) {
            this.renderPrivacySpace();
        }
        
        console.log(`✅ 智能合并: 新增 ${newCategories.length} 个分类, ${newBookmarks.length} 个书签`);
    }
    
    // 检查并处理临时导入的数据
    checkAndProcessTempImportedData() {
        if (this.tempImportedPrivacyData) {
            const tempData = this.tempImportedPrivacyData;
            
            // 自动合并数据，不再询问
            this.smartMergePrivacyData(tempData.bookmarks, tempData.categories);
            this.showToast('✨ 之前导入的隐私数据已自动合并', 'success');
            
            // 清除临时数据
            delete this.tempImportedPrivacyData;
        }
    }
}

// 初始化应用
// 临时测试函数 - 验证未分类逻辑
window.testUncategorizedLogic = function() {
    console.log('🧪 测试未分类逻辑:');
    const hub = window.bookmarkHub;
    
    // 详细检查所有书签的categoryId状态
    console.log('📊 所有书签的categoryId状态:');
    hub.bookmarks.forEach((bookmark, index) => {
        console.log(`${index + 1}. "${bookmark.title}": categoryId = ${bookmark.categoryId} (类型: ${typeof bookmark.categoryId})`);
    });
    
    // 检查未分类筛选逻辑
    console.log('\n🔍 未分类筛选测试:');
    const uncategorizedBookmarks = hub.bookmarks.filter(bookmark => !bookmark.categoryId);
    console.log('- 符合!bookmark.categoryId条件的书签数量:', uncategorizedBookmarks.length);
    uncategorizedBookmarks.forEach((bookmark, index) => {
        console.log(`  ${index + 1}. "${bookmark.title}": categoryId = ${bookmark.categoryId}`);
    });
    
    // 检查null值筛选
    const nullCategoryBookmarks = hub.bookmarks.filter(bookmark => bookmark.categoryId === null);
    console.log('- 符合categoryId === null条件的书签数量:', nullCategoryBookmarks.length);
    
    // 检查undefined值筛选  
    const undefinedCategoryBookmarks = hub.bookmarks.filter(bookmark => bookmark.categoryId === undefined);
    console.log('- 符合categoryId === undefined条件的书签数量:', undefinedCategoryBookmarks.length);
    
    // 检查空字符串值筛选
    const emptyCategoryBookmarks = hub.bookmarks.filter(bookmark => bookmark.categoryId === '');
    console.log('- 符合categoryId === ""条件的书签数量:', emptyCategoryBookmarks.length);
    
    // 创建一个测试书签到未分类
    const testBookmark = {
        id: 'test_uncategorized_' + Date.now(),
        title: '测试未分类书签',
        url: 'https://test-uncategorized.com',
        categoryId: null, // 未分类
        createdAt: Date.now()
    };
    
    hub.bookmarks.push(testBookmark);
    console.log('\n➕ 添加测试书签到未分类');
    
    // 切换到未分类视图
    hub.setFilter('uncategorized');
    console.log('🔄 切换到未分类视图');
    
    // 检查筛选结果
    const filtered = hub.getFilteredBookmarks();
    console.log('- 当前筛选:', hub.currentFilter);
    console.log('- 未分类书签数量:', filtered.length);
    console.log('- 包含测试书签:', filtered.some(b => b.id === testBookmark.id));
    
    // 检查批量删除按钮
    setTimeout(() => {
        const batchBtn = document.getElementById('batchDeleteBtn');
        const batchActions = document.getElementById('batchActions');
        console.log('- 批量删除按钮存在:', !!batchBtn);
        console.log('- 批量操作容器显示:', batchActions?.style.display);
    }, 100);
};

// 检查分类删除后的书签状态
window.checkCategoryDeletion = function() {
    console.log('🔍 检查分类删除后的书签状态:');
    const hub = window.bookmarkHub;
    
    // 创建测试分类和书签
    const testCategory = {
        id: 'test_category_' + Date.now(),
        name: '测试分类删除',
        color: '#ff0000',
        createdAt: Date.now()
    };
    
    const testBookmark = {
        id: 'test_bookmark_' + Date.now(),
        title: '测试分类删除书签',
        url: 'https://test-category-delete.com',
        categoryId: testCategory.id, // 分配到测试分类
        createdAt: Date.now()
    };
    
    // 添加分类和书签
    hub.categories.push(testCategory);
    hub.bookmarks.push(testBookmark);
    
    console.log('➕ 创建测试分类和书签');
    console.log('- 测试分类ID:', testCategory.id);
    console.log('- 测试书签的categoryId:', testBookmark.categoryId);
    
    // 保存并重新渲染
    hub.saveData();
    hub.render();
    
    console.log('💾 数据已保存，界面已更新');
    console.log('📝 现在请手动删除"测试分类删除"分类，然后运行 checkAfterDeletion()');
    
    // 保存测试书签ID供后续检查
    window.testBookmarkId = testBookmark.id;
};

window.checkAfterDeletion = function() {
    console.log('🔍 检查分类删除后的状态:');
    const hub = window.bookmarkHub;
    
    if (!window.testBookmarkId) {
        console.log('❌ 请先运行 checkCategoryDeletion()');
        return;
    }
    
    const testBookmark = hub.bookmarks.find(b => b.id === window.testBookmarkId);
    if (!testBookmark) {
        console.log('❌ 测试书签不存在，可能已被删除');
        return;
    }
    
    console.log('📊 测试书签状态:');
    console.log('- 书签标题:', testBookmark.title);
    console.log('- categoryId值:', testBookmark.categoryId);
    console.log('- categoryId类型:', typeof testBookmark.categoryId);
    console.log('- 是否为null:', testBookmark.categoryId === null);
    console.log('- 是否为undefined:', testBookmark.categoryId === undefined);
    console.log('- !categoryId结果:', !testBookmark.categoryId);
    
    // 测试筛选
    hub.setFilter('uncategorized');
    const filtered = hub.getFilteredBookmarks();
    console.log('\n🔍 未分类筛选结果:');
    console.log('- 未分类书签总数:', filtered.length);
    console.log('- 包含测试书签:', filtered.some(b => b.id === window.testBookmarkId));
};

// 测试导入后的数据修复
window.testImportDataFix = function() {
    console.log('🧪 测试导入数据修复功能:');
    const hub = window.bookmarkHub;
    
    // 模拟导入有问题的数据
    const problematicData = {
        bookmarks: [
            {
                id: 'test_import_1',
                title: '导入测试书签1',
                url: 'https://test1.com',
                categoryId: 'nonexistent_category_1', // 不存在的分类
                createdAt: Date.now()
            },
            {
                id: 'test_import_2', 
                title: '导入测试书签2',
                url: 'https://test2.com',
                categoryId: 'nonexistent_category_2', // 不存在的分类
                createdAt: Date.now()
            },
            {
                id: 'test_import_3',
                title: '导入测试书签3',
                url: 'https://test3.com',
                categoryId: null, // 正常的未分类
                createdAt: Date.now()
            }
        ],
        categories: [
            {
                id: 'valid_category',
                name: '有效分类',
                color: '#00FF00',
                createdAt: Date.now()
            }
            // 注意：不包含 nonexistent_category_1 和 nonexistent_category_2
        ]
    };
    
    console.log('📥 模拟导入有问题的数据:');
    console.log('- 书签数量:', problematicData.bookmarks.length);
    console.log('- 分类数量:', problematicData.categories.length);
    console.log('- 孤立书签:', problematicData.bookmarks.filter(b => 
        b.categoryId && !problematicData.categories.some(c => c.id === b.categoryId)
    ).length);
    
    // 备份当前数据
    const backupBookmarks = [...hub.bookmarks];
    const backupCategories = [...hub.categories];
    
    // 模拟导入过程
    hub.bookmarks = problematicData.bookmarks;
    hub.categories = problematicData.categories;
    
    console.log('\n🔧 执行数据修复:');
    hub.fixOrphanedBookmarks();
    
    // 检查修复结果
    const uncategorizedAfterFix = hub.bookmarks.filter(b => !b.categoryId);
    console.log('\n📊 修复后的结果:');
    console.log('- 未分类书签数量:', uncategorizedAfterFix.length);
    uncategorizedAfterFix.forEach((bookmark, index) => {
        console.log(`  ${index + 1}. "${bookmark.title}": categoryId = ${bookmark.categoryId}`);
    });
    
    // 恢复原始数据
    hub.bookmarks = backupBookmarks;
    hub.categories = backupCategories;
    hub.saveData();
    hub.render();
    
    console.log('\n✅ 测试完成，数据已恢复');
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM加载完成，开始初始化应用');
    try {
        window.bookmarkHub = new BookmarkHub();
        console.log('✅ BookmarkHub初始化成功');
        console.log('💡 可用的测试函数:');
        console.log('  - testUncategorizedLogic() - 测试未分类逻辑');
        console.log('  - testImportDataFix() - 测试导入数据修复');
        console.log('  - checkCategoryDeletion() - 测试分类删除');
    } catch (error) {
        console.error('❌ BookmarkHub初始化失败:', error);
    }
});

// 添加50个测试书签来验证分页功能（仅在首次访问时）

if (!localStorage.getItem('bookmarkhub_bookmarks')) {
    const sampleBookmarks = [];
    
    // 预定义的网站数据
    const websites = [
        { title: 'GitHub', url: 'https://github.com', description: '全球最大的代码托管平台', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', category: 'work' },
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web开发者的最佳学习资源', imageUrl: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png', category: 'study' },
        { title: 'Stack Overflow', url: 'https://stackoverflow.com', description: '程序员问答社区', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stackoverflow.svg', category: 'work' },
        { title: 'Vue.js', url: 'https://vuejs.org', description: '渐进式JavaScript框架', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', category: 'study' },
        { title: 'React', url: 'https://reactjs.org', description: 'Facebook开发的UI库', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', category: 'study' },
        { title: 'Node.js', url: 'https://nodejs.org', description: 'JavaScript运行时环境', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', category: 'work' },
        { title: 'TypeScript', url: 'https://www.typescriptlang.org', description: 'JavaScript的超集', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', category: 'study' },
        { title: 'Webpack', url: 'https://webpack.js.org', description: '模块打包工具', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg', category: 'work' },
        { title: 'Vite', url: 'https://vitejs.dev', description: '下一代前端构建工具', imageUrl: 'https://vitejs.dev/logo.svg', category: 'work' },
        { title: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '实用优先的CSS框架', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg', category: 'study' },
        { title: 'Bootstrap', url: 'https://getbootstrap.com', description: '响应式CSS框架', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg', category: 'study' },
        { title: 'Sass', url: 'https://sass-lang.com', description: 'CSS预处理器', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg', category: 'work' },
        { title: 'Less', url: 'https://lesscss.org', description: 'CSS预处理器', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/less/less-plain-wordmark.svg', category: 'work' },
        { title: 'Babel', url: 'https://babeljs.io', description: 'JavaScript编译器', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/babel/babel-original.svg', category: 'work' },
        { title: 'ESLint', url: 'https://eslint.org', description: 'JavaScript代码检查工具', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg', category: 'work' },
        { title: 'Prettier', url: 'https://prettier.io', description: '代码格式化工具', imageUrl: 'https://prettier.io/icon.png', category: 'work' },
        { title: 'Jest', url: 'https://jestjs.io', description: 'JavaScript测试框架', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg', category: 'work' },
        { title: 'Cypress', url: 'https://www.cypress.io', description: '端到端测试框架', imageUrl: 'https://asset.brandfetch.io/idIq_kF0rb/idv3zwmSiY.jpeg', category: 'work' },
        { title: 'Docker', url: 'https://www.docker.com', description: '容器化平台', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', category: 'work' },
        { title: 'Kubernetes', url: 'https://kubernetes.io', description: '容器编排系统', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg', category: 'work' },
        { title: 'AWS', url: 'https://aws.amazon.com', description: '亚马逊云服务', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', category: 'work' },
        { title: 'Google Cloud', url: 'https://cloud.google.com', description: '谷歌云平台', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg', category: 'work' },
        { title: 'Azure', url: 'https://azure.microsoft.com', description: '微软云平台', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg', category: 'work' },
        { title: 'Firebase', url: 'https://firebase.google.com', description: '谷歌应用开发平台', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg', category: 'work' },
        { title: 'Vercel', url: 'https://vercel.com', description: '前端部署平台', imageUrl: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png', category: 'work' },
        { title: 'Netlify', url: 'https://www.netlify.com', description: '静态网站托管平台', imageUrl: 'https://www.netlify.com/v3/img/components/logomark.png', category: 'work' },
        { title: 'MongoDB', url: 'https://www.mongodb.com', description: 'NoSQL数据库', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', category: 'work' },
        { title: 'PostgreSQL', url: 'https://www.postgresql.org', description: '开源关系型数据库', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', category: 'work' },
        { title: 'Redis', url: 'https://redis.io', description: '内存数据库', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg', category: 'work' },
        { title: 'GraphQL', url: 'https://graphql.org', description: 'API查询语言', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg', category: 'study' },
        { title: 'Figma', url: 'https://www.figma.com', description: '在线UI设计工具', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', category: 'work' },
        { title: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html', description: 'UI/UX设计工具', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xd/xd-plain.svg', category: 'work' },
        { title: 'Sketch', url: 'https://www.sketch.com', description: 'Mac平台设计工具', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg', category: 'work' },
        { title: 'Dribbble', url: 'https://dribbble.com', description: '设计师作品展示平台', imageUrl: 'https://cdn.dribbble.com/assets/dribbble-ball-mark-2bd45f09c2fb58dbbfb44766d5d1d07c5a12972d602ef8b32204d28fa3dda554.svg', category: 'entertainment' },
        { title: 'Behance', url: 'https://www.behance.net', description: 'Adobe创意作品平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/behance.svg', category: 'entertainment' },
        { title: 'Unsplash', url: 'https://unsplash.com', description: '免费高质量图片', imageUrl: 'https://unsplash.com/apple-touch-icon.png', category: 'entertainment' },
        { title: 'Pexels', url: 'https://www.pexels.com', description: '免费图片和视频', imageUrl: 'https://images.pexels.com/lib/api/pexels-white.png', category: 'entertainment' },
        { title: 'YouTube', url: 'https://youtube.com', description: '视频分享平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/youtube.svg', category: 'entertainment' },
        { title: 'Netflix', url: 'https://www.netflix.com', description: '流媒体视频平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/netflix.svg', category: 'entertainment' },
        { title: 'Spotify', url: 'https://www.spotify.com', description: '音乐流媒体平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/spotify.svg', category: 'entertainment' },
        { title: 'TikTok', url: 'https://www.tiktok.com', description: '短视频分享平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tiktok.svg', category: 'entertainment' },
        { title: 'Instagram', url: 'https://www.instagram.com', description: '图片社交平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg', category: 'entertainment' },
        { title: 'Twitter', url: 'https://twitter.com', description: '微博社交平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg', category: 'entertainment' },
        { title: 'LinkedIn', url: 'https://www.linkedin.com', description: '职业社交网络', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg', category: 'work' },
        { title: 'Discord', url: 'https://discord.com', description: '游戏社交平台', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/discord.svg', category: 'entertainment' },
        { title: 'Slack', url: 'https://slack.com', description: '团队协作平台', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg', category: 'work' },
        { title: 'Notion', url: 'https://www.notion.so', description: '全能工作空间', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/notion.svg', category: 'work' },
        { title: 'Trello', url: 'https://trello.com', description: '项目管理工具', imageUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/trello/trello-plain.svg', category: 'work' },
        { title: 'Asana', url: 'https://asana.com', description: '团队项目管理', imageUrl: 'https://luna1.co/eb0187.png', category: 'work' },
        { title: 'Jira', url: 'https://www.atlassian.com/software/jira', description: '敏捷项目管理', imageUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', category: 'work' }
    ];
    
    // 生成50个书签
    for (let i = 0; i < 50; i++) {
        const website = websites[i % websites.length];
        const bookmark = {
            id: `sample${i + 1}`,
            title: `${website.title}${i > websites.length - 1 ? ` (${Math.floor(i / websites.length) + 1})` : ''}`,
            url: website.url,
            description: website.description,
            imageUrl: website.imageUrl || null,
            categoryId: website.category,
            createdAt: Date.now() - (i * 3600000), // 每个书签间隔1小时
            updatedAt: Date.now() - (i * 3600000),
            visitCount: Math.floor(Math.random() * 20) + 1
        };
        sampleBookmarks.push(bookmark);
    }
    
    localStorage.setItem('bookmarkhub_bookmarks', JSON.stringify(sampleBookmarks));
    
    // 创建对应的示例分类
    const sampleCategories = [
        {
            id: 'work',
            name: '工作',
            color: '#2196F3',
            createdAt: Date.now() - 86400000 // 1天前
        },
        {
            id: 'study',
            name: '学习',
            color: '#4CAF50',
            createdAt: Date.now() - 86400000
        },
        {
            id: 'entertainment',
            name: '娱乐',
            color: '#FF9800',
            createdAt: Date.now() - 86400000
        }
    ];
    
    localStorage.setItem('bookmarkhub_categories', JSON.stringify(sampleCategories));
}


// 测试移动端检测和导出功能
window.testMobileExport = function() {
    const bookmarkHub = window.bookmarkHub;
    if (!bookmarkHub) {
        console.log('BookmarkHub未初始化');
        return;
    }
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    console.log('=== 移动端检测测试 ===');
    console.log('用户代理:', userAgent);
    console.log('检测为移动设备:', isMobile);
    console.log('窗口尺寸:', window.innerWidth + 'x' + window.innerHeight);
    
    // 测试备份功能（现在统一使用文件下载）
    console.log('测试备份功能：现在所有设备都使用标准文件下载方式');
    console.log('移动端复制面板已移除，改为直接下载文件');
};

// 全局阻止上下文菜单的独立函数
function preventContextMenu() {
        console.log('🛡️ 设置全局上下文菜单阻止');
        
        // 阻止整个文档的上下文菜单
        document.addEventListener('contextmenu', (e) => {
            // 检查是否在书签卡片内
            if (e.target.closest('.bookmark-card') || e.target.closest('.bookmark-card-wrapper')) {
                console.log('🚫 全局阻止书签卡片上下文菜单', e.target);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true); // 使用捕获阶段
        
        // 阻止选择开始
        document.addEventListener('selectstart', (e) => {
            if (e.target.closest('.bookmark-card') || e.target.closest('.bookmark-card-wrapper')) {
                console.log('🚫 全局阻止书签卡片选择', e.target);
                e.preventDefault();
                return false;
            }
        }, true);
        
        // 阻止拖拽开始
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.bookmark-card') || e.target.closest('.bookmark-card-wrapper')) {
                console.log('🚫 全局阻止书签卡片拖拽', e.target);
                e.preventDefault();
                return false;
            }
        }, true);
        
        // 移动端特殊处理
        if ('ontouchstart' in window) {
            // 在整个文档级别阻止书签卡片的长按菜单
            document.addEventListener('touchstart', (e) => {
                if (e.target.closest('.bookmark-card') || e.target.closest('.bookmark-card-wrapper')) {
                    console.log('🛡️ 全局移动端触摸检测', e.target.tagName, e.target.className);
                    
                    // 立即设置一个标记
                    e.target.setAttribute('data-bookmark-touch', 'true');
                    
                    // 500ms后移除标记
                    setTimeout(() => {
                        if (e.target && e.target.removeAttribute) {
                            e.target.removeAttribute('data-bookmark-touch');
                        }
                    }, 1000);
                }
            }, { passive: true });
            
            // 更强力的上下文菜单阻止
            document.addEventListener('contextmenu', (e) => {
                if (e.target.hasAttribute && e.target.hasAttribute('data-bookmark-touch')) {
                    console.log('🚫 移动端全局强制阻止长按菜单');
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                }
            }, true);
        }
}

// 这部分代码已经在上面的DOMContentLoaded中处理了，删除重复初始化

