/**
 * Toast 通知组件
 * @author Travis
 * @version 2.0.0
 */

import { APP_CONFIG } from '../../core/config.js';
import { DomUtils } from '../../core/utils.js';

export class Toast {
    constructor() {
        this.container = null;
        this.currentToast = null;
        this.hideTimer = null;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = DomUtils.createElement('div', {
            className: 'toast-container',
            styles: {
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: '1100',
                pointerEvents: 'none'
            }
        });
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = APP_CONFIG.UI.TOAST_DURATION) {
        // 清除现有的toast
        this.hide();

        // 创建新的toast
        this.currentToast = DomUtils.createElement('div', {
            className: `toast toast-${type}`,
            innerHTML: `
                <div class="toast-content">
                    <i class="toast-icon ${this.getIcon(type)}"></i>
                    <span class="toast-message">${message}</span>
                </div>
            `
        });

        this.container.appendChild(this.currentToast);
        
        // 触发显示动画
        setTimeout(() => {
            this.currentToast.classList.add('show');
        }, 10);

        // 设置自动隐藏
        this.hideTimer = setTimeout(() => {
            this.hide();
        }, duration);
    }

    hide() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }

        if (this.currentToast) {
            this.currentToast.classList.remove('show');
            setTimeout(() => {
                if (this.currentToast && this.currentToast.parentNode) {
                    this.currentToast.parentNode.removeChild(this.currentToast);
                }
                this.currentToast = null;
            }, 300);
        }
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    destroy() {
        this.hide();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
