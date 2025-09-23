/**
 * 全局事件管理
 * @author Travis
 * @version 2.0.0
 */

import { DomUtils } from '../../core/utils.js';

export class GlobalEvents {
    constructor(app) {
        this.app = app;
        this.eventListeners = [];
    }

    init() {
        this.bindKeyboardEvents();
        this.bindTouchEvents();
        this.bindWindowEvents();
        console.log('🎯 全局事件绑定完成');
    }

    bindKeyboardEvents() {
        const keydownHandler = (e) => {
            // Ctrl+K 快速搜索
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Escape 关闭模态框
            if (e.key === 'Escape') {
                this.closeModals();
            }
        };

        this.addEventListener(document, 'keydown', keydownHandler);
    }

    bindTouchEvents() {
        // 阻止移动端长按菜单
        const contextMenuHandler = (e) => {
            if (e.target.closest('.bookmark-card')) {
                e.preventDefault();
                return false;
            }
        };

        this.addEventListener(document, 'contextmenu', contextMenuHandler);
    }

    bindWindowEvents() {
        // 窗口大小变化
        const resizeHandler = DomUtils.debounce(() => {
            // 可以在这里处理响应式逻辑
            this.app.render();
        }, 250);

        this.addEventListener(window, 'resize', resizeHandler);

        // 页面卸载前清理
        const beforeUnloadHandler = () => {
            this.destroy();
        };

        this.addEventListener(window, 'beforeunload', beforeUnloadHandler);
    }

    focusSearch() {
        const searchInput = DomUtils.$('#searchInput') || DomUtils.$('#privacySearchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }

    closeModals() {
        const modals = DomUtils.$$('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }

    addEventListener(target, event, handler) {
        target.addEventListener(event, handler);
        this.eventListeners.push({ target, event, handler });
    }

    destroy() {
        this.eventListeners.forEach(({ target, event, handler }) => {
            target.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        console.log('🗑️ 全局事件已清理');
    }
}
