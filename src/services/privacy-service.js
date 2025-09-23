/**
 * 隐私空间服务
 */

export class PrivacyService {
    constructor(storageManager) {
        this.storageManager = storageManager;
    }

    async authenticate(password) {
        // 简化实现
        return password === 'admin';
    }
}
