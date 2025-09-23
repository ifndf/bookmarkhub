@echo off
chcp 65001 >nul
:: BookmarkHub Docker 构建脚本 (Windows版本)
:: 适用于 QNAP NAS 和 Windows 环境

echo 🚀 开始构建 BookmarkHub Docker 镜像...

:: 设置变量
set IMAGE_NAME=bookmarkhub
set IMAGE_TAG=latest
set CONTAINER_NAME=bookmarkhub

:: 检查Docker是否可用
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安装或不可用
    pause
    exit /b 1
)

:: 停止并删除现有容器（如果存在）
echo 🔄 检查现有容器...
for /f %%i in ('docker ps -q -f name=%CONTAINER_NAME% 2^>nul') do (
    echo ⏹️  停止现有容器...
    docker stop %CONTAINER_NAME%
)

for /f %%i in ('docker ps -aq -f name=%CONTAINER_NAME% 2^>nul') do (
    echo 🗑️  删除现有容器...
    docker rm %CONTAINER_NAME%
)

:: 构建新镜像
echo 🔨 构建 Docker 镜像...
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

if errorlevel 1 (
    echo ❌ 镜像构建失败！
    pause
    exit /b 1
)

echo ✅ 镜像构建成功！

:: 创建日志目录
if not exist "logs" mkdir logs

:: 运行容器
echo 🚀 启动容器...
docker run -d ^
    --name %CONTAINER_NAME% ^
    --restart unless-stopped ^
    -p 18080:80 ^
    -v "%cd%/logs:/var/log/nginx" ^
    -e TZ=Asia/Shanghai ^
    %IMAGE_NAME%:%IMAGE_TAG%

if errorlevel 1 (
    echo ❌ 容器启动失败！
    pause
    exit /b 1
)

echo ✅ 容器启动成功！
echo.
echo 📱 访问地址：
echo    http://localhost:18080
echo    http://你的NAS的IP地址:18080
echo.
echo 🔧 管理命令：
echo    查看日志: docker logs %CONTAINER_NAME%
echo    停止容器: docker stop %CONTAINER_NAME%
echo    重启容器: docker restart %CONTAINER_NAME%
echo.
echo 📊 容器状态：
docker ps -f name=%CONTAINER_NAME%

pause
