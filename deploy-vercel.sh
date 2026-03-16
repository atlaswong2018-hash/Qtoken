#!/bin/bash

# AI 社区交流平台 - Vercel 部署脚本

echo "=========================================="
echo "  AI 社区交流平台 - Vercel 部署工具"
echo "=========================================="
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未检测到 Vercel CLI"
    echo "请先安装 Vercel CLI："
    echo "  npm i -g vercel"
    echo ""
    exit 1
fi

echo "✅ 检测到 Vercel CLI"
echo ""

# 询问用户选择部署方式
echo "请选择部署方式："
echo ""
echo "1) 使用 Vercel 网页部署（推荐）"
echo "2) 使用 Vercel CLI 部署"
echo ""
read -p "请输入选项 (1-2): " choice

case $choice in
    1)
        echo "=========================================="
        echo "方法 1：使用 Vercel 网页部署"
        echo "=========================================="
        echo ""
        echo "📝 部署步骤："
        echo ""
        echo "1. 访问 Vercel: https://vercel.com"
        echo "2. 使用 GitHub 账号登录"
        echo "3. 点击 'New Project'"
        echo "4. 搜索并导入仓库：atlaswong2018-hash/Qtoken"
        echo "5. 配置环境变量（必需）："
        echo "   - DATABASE_URL"
        echo "   - NEXTAUTH_SECRET"
        echo "6. 点击 'Deploy'"
        echo "7. 等待 1-3 分钟"
        echo "8. 访问部署后的 URL"
        echo ""
        echo "💡 提示：首次部署会自动配置环境变量"
        echo ""
        read -p "按 Enter 键打开 Vercel..." choice

        if [[ "$OSTYPE" == "Darwin" ]]; then
            open https://vercel.com/new
        elif [[ "$OSTYPE" == "Linux" ]]; then
            xdg-open https://vercel.com/new 2>/dev/null || \
            echo "请手动打开: https://vercel.com/new"
        else
            echo "请手动打开: https://vercel.com/new"
        fi
        ;;

    2)
        echo "=========================================="
        echo "方法 2：使用 Vercel CLI 部署"
        echo "=========================================="
        echo ""

        # 检查登录状态
        if ! vercel whoami &>/dev/null; then
            echo "❌ 未登录到 Vercel"
            echo "请先登录：vercel login"
            exit 1
        fi

        echo "✅ 已登录到 Vercel"
        echo ""

        # 询问部署目标
        echo "请选择部署目标："
        echo ""
        echo "1) 生产环境"
        echo "2) 预览环境"
        echo ""
        read -p "请输入选项 (1-2): " target

        case $target in
            1)
                echo "🚀 正在部署到生产环境..."
                vercel --prod
                ;;
            2)
                echo "🔍 正在部署到预览环境..."
                vercel
                ;;
            *)
                echo "❌ 无效选项，默认部署到预览环境"
                vercel
                ;;
        esac
        ;;

    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "📝 下一步："
echo "1. 配置环境变量（在 Vercel 项目设置中）"
echo "2. 运行数据库迁移（如果使用新数据库）"
echo "3. 访问你的应用 URL"
echo "4. 测试所有功能"
echo ""
echo "💡 提示："
echo "- 确保环境变量格式正确"
echo "- 数据库连接字符串格式：postgresql://user:password@host:5432/database"
echo "- NEXTAUTH_SECRET 至少需要 32 个字符"
echo ""
