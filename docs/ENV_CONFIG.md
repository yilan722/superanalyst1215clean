# 环境变量配置说明

## 报告生成系统环境变量

### 必需的环境变量

#### Perplexity API配置
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions
SONAR_MODEL=sonar
```

#### Qwen API配置（新增）
```bash
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://api.nuwaapi.com/v1/chat/completions
QWEN_MODEL=gemini-3-pro-preview
```

### 可选的环境变量

#### 成本优化参数
```bash
MAX_SONAR_QUERIES=8                    # 每次分析最多的Sonar查询数（默认：8）
QUERY_PLANNER_MAX_TOKENS=500           # 查询规划阶段的token限制（默认：500）
DEEP_ANALYSIS_MAX_TOKENS=16000         # 深度分析阶段的token限制（默认：16000）
MAX_CONCURRENT_SEARCHES=5              # 并行搜索数量（默认：5）
```

#### API超时和重试设置
```bash
API_TIMEOUT=300                        # API超时时间（秒，默认：300）
MAX_RETRIES=3                          # 最大重试次数（默认：3）
```

#### 缓存设置
```bash
ENABLE_CACHE=true                      # 是否启用缓存（默认：true）
CACHE_EXPIRY_HOURS=6                   # 缓存过期时间（小时，默认：6）
```

### 配置说明

1. **PERPLEXITY_API_KEY**: Perplexity API密钥，用于Sonar实时搜索
2. **QWEN_API_KEY**: Qwen API密钥，用于深度推理和分析
3. **QWEN_API_URL**: Qwen API端点URL（默认：https://api.nuwaapi.com/v1/chat/completions）
4. **QWEN_MODEL**: Qwen模型名称（默认：gemini-3-pro-preview）
5. **SONAR_MODEL**: Perplexity Sonar模型（默认：sonar）

### 配置示例

在 `.env.local` 文件中添加：

```env
# Perplexity API配置
PERPLEXITY_API_KEY=pplx-your-key-here
PERPLEXITY_API_URL=https://api.perplexity.ai/chat/completions
SONAR_MODEL=sonar

# Qwen API配置
QWEN_API_KEY=sk-your-key-here
QWEN_API_URL=https://api.nuwaapi.com/v1/chat/completions
QWEN_MODEL=gemini-3-pro-preview

# 成本优化参数（可选）
MAX_SONAR_QUERIES=8
QUERY_PLANNER_MAX_TOKENS=500
DEEP_ANALYSIS_MAX_TOKENS=16000
MAX_CONCURRENT_SEARCHES=5

# API超时和重试（可选）
API_TIMEOUT=300
MAX_RETRIES=3

# 缓存设置（可选）
ENABLE_CACHE=true
CACHE_EXPIRY_HOURS=6
```

### 获取API密钥

- **Perplexity API**: 访问 https://www.perplexity.ai/ 注册并获取API密钥
- **Qwen API**: 访问相应的API服务商网站注册并获取API密钥

### 注意事项

- 所有API密钥都应该保密，不要提交到版本控制系统
- 在生产环境中，使用环境变量或密钥管理服务存储API密钥
- 建议设置合理的token限制以控制成本
- 配置文件统一使用 `app/services/report-generation-config.ts` 管理

