# Vercel 部署指南

## 环境变量配置

在 Vercel Dashboard 中设置以下环境变量：

### 必需的环境变量

1. **SECRET_KEY**
   - 用于 JWT 令牌签名
   - 示例：`your-super-secret-key-min-32-chars-long`
   - 生成方法：`openssl rand -hex 32`

2. **GEMINI_API_KEY**
   - Google Gemini API 密钥
   - 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取

3. **POSTGRES_URL** (或 DATABASE_URL)
   - Supabase PostgreSQL 连接字符串
   - 格式：`postgresql://user:password@host:port/database`

## 部署步骤

### 1. 连接 GitHub 仓库到 Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择 "Import Git Repository"
4. 选择 `AI-BD-Tracker` 仓库

### 2. 配置环境变量

在 Vercel 项目设置中：
1. 进入 "Settings" → "Environment Variables"
2. 添加所有必需的环境变量
3. 确保为 "Production" 和 "Preview" 环境都设置

### 3. 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到 Preview
vercel

# 部署到 Production
vercel --prod
```

### 4. 验证部署

部署完成后：
1. 访问部署的 URL
2. 测试注册功能
3. 测试登录功能
4. 检查 API 端点是否正常

## 常见问题排查

### "Unexpected token 'A', 'A server e'... is not valid JSON"

**症状**: 前端调用 API 时返回此错误

**原因**: Vercel 返回了 HTML 错误页面而不是 JSON

**解决方案**:

1. **检查环境变量是否设置**
   ```
   在 Vercel Dashboard → Settings → Environment Variables
   确保设置了:
   - SECRET_KEY
   - GEMINI_API_KEY  
   - POSTGRES_URL (或 DATABASE_URL)
   ```

2. **检查构建日志**
   ```
   Vercel Dashboard → Deployments → 点击最新部署 → View Build Logs
   查找是否有 Python 依赖安装错误
   ```

3. **检查函数日志**
   ```bash
   vercel logs <your-deployment-url>
   ```

4. **强制重新部署**
   ```bash
   # 添加 [force deploy] 到提交信息
   git commit -m "fix: [force deploy]"
   git push
   ```

### 注册/登录失败

**症状**: 点击 "Sign Up" 或 "Login" 后报错

**可能原因**:
1. 缺少环境变量
2. 数据库连接失败
3. 依赖包版本不兼容

**解决方案**:

1. **检查环境变量**
   ```bash
   # 在 Vercel Dashboard 检查
   Settings → Environment Variables
   ```

2. **检查构建日志**
   ```bash
   # 查看部署日志
   vercel logs <deployment-url>
   ```

3. **检查依赖**
   - 确保 `requirements.txt` 包含所有必需依赖
   - 特别注意：`bcrypt`, `PyJWT`, `email-validator`

### API 端点 404

**症状**: `/api/v1/*` 返回 404

**解决方案**:
1. 检查 `vercel.json` 配置
2. 确保 `api/index.py` 存在
3. 检查路由配置

### 数据库错误

**症状**: 数据库连接失败

**解决方案**:
1. 检查 `POSTGRES_URL` 或 `DATABASE_URL` 环境变量
2. 确保 Supabase 数据库已创建
3. 运行数据库迁移

## 数据库迁移

部署后首次运行，需要创建数据库表：

```python
# 在 Vercel Serverless Function 中
# 首次访问时会自动创建表
# 确保 models.py 和 database.py 配置正确
```

## 测试 API

使用 curl 测试部署后的 API：

```bash
# 测试注册
curl -X POST https://your-app.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "BD Manager",
    "initials": "TU"
  }'

# 测试登录
curl -X POST https://your-app.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## 依赖更新

如果更新依赖，确保：

1. 更新 `requirements.txt`
2. 提交到 Git
3. Vercel 会自动重新部署

### 关键依赖

```txt
bcrypt>=4.0.0          # 密码哈希（替代 passlib）
PyJWT>=2.8.0           # JWT 令牌
python-jose[cryptography]>=3.3.0  # JWT 编解码
email-validator>=2.0.0 # 邮箱验证
```

## 本地测试 Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地运行 Serverless Function
vercel dev

# 访问 http://localhost:3000/api/v1/auth/register
```

## 监控和日志

### 查看日志

```bash
# 实时日志
vercel logs --follow

# 查看特定部署
vercel logs <deployment-url>
```

### 错误追踪

1. 检查 Vercel Dashboard 的 "Functions" 标签
2. 查看错误堆栈
3. 修复后重新部署

## 性能优化

### 数据库连接池

对于生产环境，使用 Supabase 连接池：

```python
# database.py
SQLALCHEMY_DATABASE_URL = os.getenv("POSTGRES_URL") + "?pgbouncer=true"
```

### 缓存

启用 Redis 缓存（可选）：

```bash
# 添加 Upstash Redis
# 在 Vercel Marketplace 中添加
```

## 安全检查清单

- [ ] SECRET_KEY 已更改为强随机密钥
- [ ] 数据库密码已更改
- [ ] API 密钥已保密
- [ ] 启用 HTTPS（Vercel 默认启用）
- [ ] 配置 CORS（如需要）
- [ ] 启用速率限制

## 资源

- [Vercel Python 文档](https://vercel.com/docs/runtimes#official-runtimes/python)
- [FastAPI 部署](https://fastapi.tiangolo.com/deployment/)
- [Supabase 设置](https://supabase.com/docs)
