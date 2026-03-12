#!/bin/bash
# Daily Diary Reader 启动脚本

echo "🐳 Daily Diary Reader 启动中..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 日志目录
DIARY_DIR="/home/wonder/.openclaw/workspace/daily-diary"

if [ ! -d "$DIARY_DIR" ]; then
    echo "⚠️  日记目录不存在：$DIARY_DIR"
fi

echo "📁 日志目录：$DIARY_DIR"
echo ""

# 询问运行模式
echo "选择运行模式："
echo "1. Docker (推荐)"
echo "2. Docker Compose"
echo "3. 直接运行（需先 npm install）"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        echo "🐳 使用 Docker 启动..."
        cd "$(dirname "$0")"

        # 构建镜像
        if docker images | grep -q daily-diary; then
            echo "✅ 镜像已存在"
        else
            echo "🔨 构建镜像中..."
            docker build -t daily-diary .
            echo "✅ 镜像构建完成"
        fi

        # 停止旧容器
        if docker ps -a | grep -q daily-diary; then
            echo "🛑 停止旧容器..."
            docker stop daily-diary
            docker rm daily-diary
        fi

        # 启动新容器
        echo "🚀 启动容器中..."
        docker run -d \
            --name daily-diary \
            -p 3000:3000 \
            -v "$DIARY_DIR:/app/data" \
            --restart unless-stopped \
            daily-diary

        echo ""
        echo "✅ Daily Diary Reader 已启动！"
        echo "🌐 访问地址：http://localhost:3000"
        echo ""
        echo "查看日志：docker logs -f daily-diary"
        echo "停止容器：docker stop daily-diary"
        echo "删除容器：docker rm daily-diary"
        ;;

    2)
        echo "🐳 使用 Docker Compose 启动..."
        cd "$(dirname "$0")"

        # 停止旧服务
        if docker-compose ps | grep -q daily-diary; then
            echo "🛑 停止旧服务..."
            docker-compose down
        fi

        # 启动新服务
        echo "🚀 启动服务中..."
        docker-compose up -d

        echo ""
        echo "✅ Daily Diary Reader 已启动！"
        echo "🌐 访问地址：http://localhost:3000"
        echo ""
        echo "查看日志：docker-compose logs -f"
        echo "停止服务：docker-compose down"
        ;;

    3)
        echo "📦 直接运行（无容器）..."
        cd "$(dirname "$0")"

        # 安装依赖
        if [ ! -d "node_modules" ]; then
            echo "📦 安装依赖中..."
            npm install
        fi

        # 启动服务
        echo "🚀 启动服务中..."
        node server.js

        echo ""
        echo "✅ Daily Diary Reader 已启动！"
        echo "🌐 访问地址：http://localhost:3000"
        echo ""
        echo "按 Ctrl+C 停止服务"
        ;;

    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
