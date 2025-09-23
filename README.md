# BookmarkHub 📚

一款现代化的Web书签管理应用，支持分类管理、隐私空间、智能搜索等功能。

## 🚀 特色功能

- 📱 **响应式设计** - 完美支持桌面和移动端
- 🎨 **现代化UI** - 清爽卡片式设计
- 🔍 **智能搜索** - 支持AND/OR逻辑搜索
- 📂 **分类管理** - 自定义分类和颜色标记
- 🔒 **隐私空间** - 加密存储私密书签
- 💾 **数据备份** - 支持导入导出功能

## 🎬 快速开始

### 在线体验
直接访问：[vercel演示](https://bookmarkhub.vercel.app/)

### 本地运行
```bash
# 克隆项目
git clone https://github.com/ifndf/bookmarkhub.git

# 直接打开 index.html 或启动HTTP服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

### Docker部署

#### 方法1：一键部署（推荐）
```bash
# Linux/macOS/QNAP NAS
chmod +x build.sh
./build.sh

# Windows
build.bat
```

#### 方法2：手动部署
```bash
# 构建镜像
docker build -t bookmarkhub .

# 运行容器
docker run -d -p 18080:80 --name bookmarkhub bookmarkhub
```

#### QNAP NAS部署说明
1. 通过SSH连接到QNAP
2. 将项目文件上传到NAS
3. 运行 `./build.sh` 即可完成部署
4. 访问 `http://NAS-IP:18080` 使用应用

## 📖 使用说明

1. **添加书签** - 点击"+"按钮添加新书签
2. **分类管理** - 创建和管理书签分类
3. **隐私空间** - 设置密码保护敏感书签
4. **搜索功能** - 支持多关键词智能搜索
5. **数据备份** - 导出/导入数据实现跨设备同步

## ⚠️ 注意事项

- 数据存储在浏览器LocalStorage中，建议定期备份
- 隐私空间数据已加密，请牢记密码
- 推荐使用现代浏览器以获得最佳体验

### QNAP NAS 特别说明
- 默认端口为 `18080`，避免与其他服务冲突
- 容器会自动重启（`--restart unless-stopped`）
- 日志文件保存在 `./logs` 目录
- 支持Container Station图形化管理

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

⭐ 如果觉得有用，请给个Star！
