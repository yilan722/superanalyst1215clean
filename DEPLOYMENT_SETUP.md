# 自动部署配置说明

## 🚀 部署流程

### 1. GitHub仓库配置
- **仓库地址**: https://github.com/yilan722/TopAnalyst
- **主分支**: `main`
- **自动触发**: 每次推送到main分支时自动部署

### 2. Vercel项目配置
- **项目地址**: https://vercel.com/yilans-projects/top-analyst-5
- **自动部署**: 已连接到GitHub仓库
- **部署状态**: 每次GitHub推送后自动构建和部署

## 🔧 配置步骤

### GitHub仓库设置
1. ✅ 代码已推送到GitHub
2. ✅ 创建了GitHub Actions工作流
3. ✅ 配置了自动部署触发器

### Vercel项目设置
1. ✅ 项目已连接到GitHub仓库
2. ✅ 配置了环境变量
3. ✅ 设置了构建和部署参数

## 📋 环境变量配置

在Vercel项目设置中需要配置以下环境变量：

### 必需的环境变量
```bash
# Perplexity API
PERPLEXITY_API_KEY=your_perplexity_api_key

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 应用配置
NEXT_PUBLIC_BASE_URL=https://top-analyst-5.vercel.app
NODE_ENV=production
```

### 可选的环境变量
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-HS935K4G8C

# 其他API密钥
TUSHARE_TOKEN=your_tushare_token
OPUS4_API_KEY=your_opus4_api_key
```

## 🚀 部署流程

### 自动部署
1. **代码推送**: 推送到GitHub main分支
2. **自动构建**: Vercel检测到推送，开始构建
3. **环境检查**: 验证环境变量和依赖
4. **构建应用**: 运行 `npm run build`
5. **部署上线**: 自动部署到生产环境

### 手动部署
如果需要手动触发部署：
1. 访问Vercel控制台
2. 进入项目设置
3. 点击"Redeploy"按钮

## 📊 部署状态监控

### GitHub Actions
- 查看工作流状态: https://github.com/yilan722/TopAnalyst/actions
- 监控构建日志和错误

### Vercel部署
- 查看部署状态: https://vercel.com/yilans-projects/top-analyst-5
- 监控部署日志和性能

## 🔍 故障排除

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确配置
   - 查看构建日志中的错误信息
   - 确保所有依赖都已正确安装

2. **API调用失败**
   - 验证API密钥是否有效
   - 检查API端点是否正确
   - 查看网络请求日志

3. **部署超时**
   - 检查Vercel函数超时设置
   - 优化API响应时间
   - 考虑使用缓存策略

### 调试步骤

1. **本地测试**
   ```bash
   npm run build
   npm run start
   ```

2. **检查日志**
   - Vercel函数日志
   - 浏览器控制台错误
   - 网络请求状态

3. **环境变量验证**
   - 确认所有必需的环境变量都已设置
   - 验证API密钥的有效性

## 📈 性能优化

### 构建优化
- 使用Next.js的自动代码分割
- 优化图片和静态资源
- 启用压缩和缓存

### 运行时优化
- 使用Vercel Edge Functions
- 实现适当的缓存策略
- 监控API响应时间

## 🎯 部署检查清单

- [x] 代码已推送到GitHub
- [x] Vercel项目已连接
- [x] 环境变量已配置
- [x] 构建配置已优化
- [x] 部署工作流已设置
- [x] 监控和日志已配置

## 🔄 持续集成

### 自动部署流程
1. 开发者在本地进行开发
2. 提交代码到GitHub
3. GitHub Actions自动运行测试
4. Vercel自动检测并开始部署
5. 部署完成后自动上线

### 回滚策略
如果部署出现问题：
1. 在Vercel控制台选择之前的稳定版本
2. 点击"Promote to Production"
3. 或者从GitHub回滚到之前的提交

## 📞 支持

如果遇到部署问题：
1. 查看GitHub Actions日志
2. 检查Vercel部署日志
3. 验证环境变量配置
4. 联系技术支持

---

**部署状态**: ✅ 已配置完成
**最后更新**: 2025-01-16
**版本**: v1.0.0
