#!/bin/bash

# StockTwits 集成测试脚本

echo "🚀 开始 StockTwits 集成测试..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "📦 检查依赖..."

# 检查 puppeteer 是否安装
if ! npm list puppeteer &> /dev/null; then
    echo "📥 安装 puppeteer..."
    npm install puppeteer
fi

echo "🧪 运行独立爬虫测试..."

# 运行独立爬虫测试
cd scripts
node test-stocktwits.js

echo ""
echo "🌐 启动开发服务器进行 API 测试..."

# 回到项目根目录
cd ..

# 启动开发服务器（后台运行）
echo "启动 Next.js 开发服务器..."
npm run dev &
SERVER_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
sleep 10

# 测试 API 端点
echo ""
echo "🔍 测试 API 端点..."

echo "1. 测试 StockTwits API..."
curl -s "http://localhost:3000/api/stocktwits-most-active" | jq '.success, .data | length' 2>/dev/null || echo "API 测试失败"

echo ""
echo "2. 测试热门股票 API (使用 StockTwits)..."
curl -s "http://localhost:3000/api/hot-stocks" | jq '.success, .source, .data | length' 2>/dev/null || echo "API 测试失败"

echo ""
echo "3. 测试热门股票 API (使用默认数据)..."
curl -s "http://localhost:3000/api/hot-stocks?useStockTwits=false" | jq '.success, .source, .data | length' 2>/dev/null || echo "API 测试失败"

echo ""
echo "✅ 测试完成！"
echo ""
echo "🌐 访问测试页面: http://localhost:3000/test-stocktwits"
echo "📊 访问主页: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止开发服务器"

# 等待用户中断
trap "echo ''; echo '🛑 停止服务器...'; kill $SERVER_PID; exit 0" INT
wait $SERVER_PID
