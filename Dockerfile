# 使用官方Nginx镜像作为基础镜像
FROM nginx:alpine

# 设置维护者信息
LABEL maintainer="BookmarkHub"
LABEL description="BookmarkHub - 书签管理应用"

# 创建应用目录
WORKDIR /usr/share/nginx/html

# 复制应用文件到容器
COPY index.html .
COPY script.js .
COPY styles.css .
COPY PRD.md .
COPY README.md .

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 创建日志目录
RUN mkdir -p /var/log/nginx

# 设置正确的文件权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
