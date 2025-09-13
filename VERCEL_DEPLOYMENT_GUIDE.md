# Vercel Deployment Guide for SuperAnalyst Pro

## 🚀 自动部署配置

### 1. GitHub 仓库
- **仓库地址**: https://github.com/yilan722/TopAnalyst
- **分支**: main
- **自动部署**: 已启用

### 2. Vercel 项目配置
- **项目名称**: top-analyst-5
- **URL**: https://vercel.com/yilans-projects/top-analyst-5
- **框架**: Next.js 14
- **Node.js 版本**: 18.x

### 3. 必需的环境变量

在 Vercel Dashboard 中配置以下环境变量：

#### 核心 API 密钥
```bash
# Perplexity API (必需)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Supabase (必需)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 可选功能
```bash
# PayPal 已移除，只使用 Stripe 支付

# Google Analytics (可选)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-HS935K4G8C

# 应用配置
NEXT_PUBLIC_BASE_URL=https://top-analyst-5.vercel.app
NODE_ENV=production
```

### 4. 构建配置

项目已配置 `vercel.json` 文件：
- **构建命令**: `npm run build`
- **输出目录**: `.next`
- **框架**: Next.js
- **API 超时**: 800秒 (用于报告生成)

### 5. 部署状态检查

#### 检查部署状态
1. 访问 Vercel Dashboard: https://vercel.com/yilans-projects/top-analyst-5
2. 查看 "Deployments" 标签页
3. 确认最新部署状态为 "Ready"

#### 功能验证清单
- [ ] 主页加载正常
- [ ] 股票搜索功能工作
- [ ] 报告生成功能正常
- [ ] Daily Alpha Brief 显示真实数据
- [ ] Today's Must-Read 功能正常
- [ ] LinkedIn 分享功能工作
- [ ] PDF 下载功能正常
- [ ] 用户认证功能正常

### 6. 性能优化

#### 已实现的优化
- ✅ 静态资源缓存
- ✅ API 路由优化
- ✅ 图片优化
- ✅ 代码分割
- ✅ 懒加载

#### 监控指标
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTFB**: < 600ms

### 7. 故障排除

#### 常见问题
1. **构建失败**: 检查环境变量配置
2. **API 超时**: 检查 Perplexity API 密钥
3. **数据库连接**: 检查 Supabase 配置
4. **静态资源**: 检查文件路径和权限

#### 日志查看
```bash
# 查看 Vercel 函数日志
vercel logs https://top-analyst-5.vercel.app

# 查看构建日志
vercel logs --build
```

### 8. 更新部署

每次推送到 `main` 分支都会自动触发部署：

```bash
# 本地开发
git add .
git commit -m "feat: 新功能描述"
git push origin main

# 自动部署到 Vercel
# 等待 2-3 分钟完成部署
```

### 9. 域名配置 (可选)

如果需要自定义域名：
1. 在 Vercel Dashboard 中添加域名
2. 配置 DNS 记录
3. 启用 HTTPS 证书

### 10. 监控和维护

#### 定期检查
- [ ] 每周检查部署状态
- [ ] 监控 API 使用量
- [ ] 检查错误日志
- [ ] 验证功能完整性

#### 备份策略
- [ ] 代码备份到 GitHub
- [ ] 数据库备份到 Supabase
- [ ] 环境变量备份到安全位置

---

## 🎯 部署成功标志

当看到以下内容时，表示部署成功：

1. **Vercel Dashboard** 显示 "Ready" 状态
2. **网站 URL** 可以正常访问
3. **所有功能** 正常工作
4. **真实数据** 正确显示

**部署 URL**: https://top-analyst-5.vercel.app

---

*最后更新: 2025-01-15*