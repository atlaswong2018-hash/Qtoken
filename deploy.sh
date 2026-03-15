#!/bin/bash

# Qtoken AI社区平台部署脚本

echo "🚀 开始部署 Qtoken AI社区平台..."

# 检查环境变量
if [ ! -f .env ]; then
  echo "❌ 错误: 未找到 .env 文件"
  echo "请先复制 .env.example 到 .env 并填写配置信息"
  echo "cp .env.example .env"
  exit 1
fi

echo "✅ 环境变量文件已检查"

# 构建项目
echo "🏗️ 正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

echo "✅ 项目构建成功"

# 检查构建输出
if [ ! -d .next ]; then
  echo "❌ 错误: 未找到构建输出目录"
  exit 1
fi

echo "📦 部署选项:"
echo "1. Vercel (推荐)"
echo "2. Netlify"
echo "3. Railway"
echo "4. Render"
echo ""
echo "请选择部署平台或手动部署:"

read -p "选择部署平台 (1-4): " choice

case $choice in
  1)
    echo "🚀 部署到 Vercel..."
    if command -v vercel &> /dev/null; then
      echo "安装 Vercel CLI..."
      npm install -g vercel
      echo "登录并部署..."
      vercel login
      vercel --prod
    else
      echo "请先安装 Vercel CLI: npm install -g vercel"
    fi
    ;;
  2)
    echo "🚀 部署到 Netlify..."
    if command -v netlify &> /dev/null; then
      echo "安装 Netlify CLI..."
      npm install -g netlify-cli
      echo "部署..."
      netlify deploy --prod
    else
      echo "请先安装 Netlify CLI: npm install -g netlify-cli"
    fi
    ;;
  3)
    echo "🚀 部署到 Railway..."
    echo "请访问 https://railway.app 并连接你的 GitHub 仓库"
    ;;
  4)
    echo "🚀 部署到 Render..."
    echo "请访问 https://render.com 并连接你的 GitHub 仓库"
    ;;
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac

echo "✅ 部署准备完成！"
