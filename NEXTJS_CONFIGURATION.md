# Next.js 配置指南

## 当前配置状态

### ✅ 已完成的配置

1. **基础配置** (`next.config.js`)
   - Next.js 14.2.31
   - 图片优化配置
   - 压缩和 SWC 优化
   - 安全头配置

2. **路径别名** (`tsconfig.json`)
   ```json
   {
     "paths": {
       "@/*": ["./*"],
       "@/src/*": ["./src/*"],
       "@/lib/*": ["./lib/*"],
       "@/components/*": ["./components/*"],
       "@/app/*": ["./app/*"],
       "@/types/*": ["./types/*"]
     }
   }
   ```

3. **Webpack 配置**
   - 路径别名解析
   - Node.js 模块 fallback 配置
   - 优化构建性能

4. **API 路由配置**
   - 统一在 `src/api` 目录管理
   - 自动同步到 `app/api` 目录
   - 导入路径自动修复

### 🔧 配置详情

#### 1. 开发服务器
```bash
npm run dev
# 访问: http://localhost:3000
```

#### 2. 环境变量
- `.env.local` - 本地开发环境变量
- `.env.example` - 环境变量模板

#### 3. API 路由管理
```bash
# 同步 API 路由
npm run sync:api

# 或直接运行脚本
node scripts/sync-api-routes.js
```

#### 4. 路径别名使用
```typescript
// 推荐使用方式
import { createApiSupabaseClient } from '@/src/services/supabase-server'
import { StockData } from '@/src/types'
import { Button } from '@/components/ui/button'

// 而不是相对路径
import { createApiSupabaseClient } from '../../../src/services/supabase-server'
```

### 🚀 性能优化

1. **SWC 编译器**: 启用快速编译
2. **图片优化**: 配置了图片域名和优化选项
3. **压缩**: 启用 gzip 压缩
4. **Webpack 优化**: 配置了模块解析和 fallback

### 🔒 安全配置

1. **安全头**:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Referrer-Policy: origin-when-cross-origin

2. **CSP**: 临时禁用以解决 eval 问题

### 📁 项目结构

```
TopAnalyst/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由 (自动同步)
│   └── [locale]/          # 国际化页面
├── src/                   # 源代码
│   ├── api/               # API 路由 (主要开发目录)
│   ├── services/          # 服务层
│   └── types/             # TypeScript 类型
├── components/            # React 组件
├── lib/                   # 工具库
├── scripts/               # 构建脚本
├── next.config.js         # Next.js 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

### 🛠️ 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 同步 API 路由
npm run sync:api
```

### 🔍 故障排除

1. **导入路径错误**
   - 使用 `@/` 别名而不是相对路径
   - 运行 `npm run sync:api` 修复 API 路由导入

2. **模块未找到**
   - 检查 `tsconfig.json` 中的路径配置
   - 确保文件存在于正确位置

3. **API 路由 404**
   - 确保 API 路由在 `src/api` 中
   - 运行同步脚本更新 `app/api`

### 📝 注意事项

1. **开发时**: 在 `src/api` 中创建和修改 API 路由
2. **部署前**: 运行 `npm run sync:api` 同步路由
3. **导入**: 优先使用 `@/` 别名路径
4. **环境变量**: 确保 `.env.local` 配置正确

## 当前状态

✅ Next.js 14.2.31 正常运行  
✅ API 路由正常工作  
✅ 路径别名配置完成  
✅ 导入路径问题已修复  
✅ 开发服务器运行在 http://localhost:3000
