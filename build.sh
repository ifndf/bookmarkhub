#!/bin/bash

# BookmarkHub Docker 构建脚本
# 适用于 QNAP NAS

echo "🚀 开始构建 BookmarkHub Docker 镜像..."

# 设置变量
IMAGE_NAME="bookmarkhub"
IMAGE_TAG="latest"
CONTAINER_NAME="bookmarkhub"

# 检查Docker是否可用
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装或不可用"
    exit 1
fi

# 停止并删除现有容器（如果存在）
echo "🔄 检查现有容器..."
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "⏹️  停止现有容器..."
    docker stop $CONTAINER_NAME
fi

if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🗑️  删除现有容器..."
    docker rm $CONTAINER_NAME
fi

# 构建新镜像
echo "🔨 构建 Docker 镜像..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功！"
else
    echo "❌ 镜像构建失败！"
    exit 1
fi

# 创建日志目录
mkdir -p ./logs

# 运行容器
echo "🚀 启动容器..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 18080:80 \
    -v $(pwd)/logs:/var/log/nginx \
    -e TZ=Asia/Shanghai \
    $IMAGE_NAME:$IMAGE_TAG

if [ $? -eq 0 ]; then
    echo "✅ 容器启动成功！"
    echo ""
    echo "📱 访问地址："
    echo "   http://localhost:18080"
    echo "   http://$(hostname -I | awk '{print $1}'):18080"
    echo ""
    echo "🔧 管理命令："
    echo "   查看日志: docker logs $CONTAINER_NAME"
    echo "   停止容器: docker stop $CONTAINER_NAME"
    echo "   重启容器: docker restart $CONTAINER_NAME"
    echo ""
    echo "📊 容器状态："
    docker ps -f name=$CONTAINER_NAME
else
    echo "❌ 容器启动失败！"
    exit 1
fi
