# AI-BD Tracker 代码结构分析报告

> **生成日期**: 2026-04-02  
> **分析范围**: 全栈代码审查 (Frontend + Backend)  
> **分析目的**: 识别代码不一致性、潜在问题和改进建议

---

## 📌 项目概述

**AI-BD Tracker** 是一个专为生物制药行业业务发展 (BD) 团队设计的智能化项目跟踪管理系统。系统利用 AI 技术自动化处理 BD 相关的各种任务和信息管理。

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | React + Vite | 19.2.4 / 8.0.1 |
| **状态管理** | Zustand | 5.0.12 |
| **样式框架** | Tailwind CSS | 4.2.2 |
| **后端框架** | FastAPI | >=0.100.0 |
| **数据库 ORM** | SQLAlchemy | >=2.0.0 |
| **数据验证** | Pydantic | >=2.0.0 |
| **AI 集成** | Google Gemini | >=0.3.0 |
| **认证** | JWT + Bcrypt | - |
| **部署** | Vercel + Supabase | - |

---

## 📁 项目结构

```
BDProjectManagement/
├── ai-bd-tracker/              # React 前端
│   ├── src/
│   │   ├── App.jsx             # 主应用与路由
│   │   ├── main.jsx            # 入口文件
│   │   ├── store/
│   │   │   └── useStore.js     # Zustand 全局状态 (73 行)
│   │   ├── services/
│   │   │   └── api.js          # API 客户端封装 (494 行)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # 认证上下文 (184 行)
│   │   │   └── ThemeContext.jsx
│   │   ├── components/
│   │   │   ├── ProjectSlideOver.jsx  # 项目详情侧边栏 (680 行)
│   │   │   ├── SmartInput.jsx        # 智能输入组件 (274 行)
│   │   │   └── EditableField.jsx
│   │   └── views/
│   │       ├── Dashboard.jsx
│   │       ├── Pipeline.jsx
│   │       ├── Contacts.jsx
│   │       └── ...
│   └── package.json
│
├── backend/                    # FastAPI 后端
│   ├── main.py                 # API 路由入口 (845 行)
│   ├── models.py               # SQLAlchemy 数据库模型 (152 行)
│   ├── schemas.py              # Pydantic 数据验证模式 (292 行)
│   ├── auth.py                 # JWT 认证模块 (88 行)
│   ├── ai_engine.py            # Google Gemini AI 集成 (472 行)
│   ├── database.py             # 数据库连接配置 (36 行)
│   └── mail_poller.py          # 邮件同步模块
│
├── api/                        # Vercel Serverless API
├── scripts/                    # 迁移和工具脚本
└── tools/duplex-debug/         # 调试工具
```

---

## 🗄️ 数据库模型 (10 个表)

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| **User** | 用户账户 | `id`, `email`, `role`, `hashed_password`, `is_active`, `notification_prefs`, `theme` |
| **Project** | BD 项目 | `id`, `company`, `pipeline`, `stage`, `details(JSON)`, `negotiation_prep(JSON)` |
| **Task** | 任务/事件 | `id`, `project_id`, `type`, `desc`, `date`, `status` |
| **Attachment** | 项目附件 | `id`, `project_id`, `name`, `file_type`, `category`, `url` |
| **ProjectHistory** | 项目历史追踪 | `id`, `project_id`, `type`, `title`, `date`, `desc`, `details(JSON)` |
| **Contact** | 联系人档案 | `id`, `name`, `currentCompany`, `currentTitle`, `details(JSON)`, `source_text` |
| **CareerHistory** | 职业履历 | `id`, `contact_id`, `company`, `title`, `dateRange`, `isCurrent` |
| **Catalyst** | 竞争对手催化剂事件 | `id`, `competitor`, `asset`, `type`, `date`, `impact` |
| **CompanyIntelligence** | 公司情报缓存 | `id`, `company_name`, `focus_areas`, `bd_strategy`, `patent_cliffs`, `recent_deals` |
| **PendingIngestion** | 待审核自动化采集 | `id`, `source_type`, `sender_email`, `ai_extracted_payload(JSON)`, `status` |

---

## 🔌 API 端点概览

### 认证模块
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/v1/auth/register` | POST | 公开 | 用户注册 |
| `/api/v1/auth/login` | POST | 公开 | 用户登录 |
| `/api/v1/auth/change-password` | POST | 认证用户 | 修改密码 |

### 用户管理
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/v1/users/me` | GET/PATCH | 认证用户 | 获取/更新当前用户信息 |
| `/api/v1/users/me/preferences` | PATCH | 认证用户 | 更新偏好设置 |
| `/api/v1/users` | GET | Admin | 获取所有用户 |
| `/api/v1/users/{id}` | PATCH | Admin | 更新用户 (管理员) |

### 项目管理
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/v1/projects` | GET/POST | GET: 认证 / POST: Admin | 获取/创建项目 |
| `/api/v1/projects/{id}` | PATCH | Admin | 更新项目 |
| `/api/v1/projects/{id}/history` | GET/POST | GET: 认证 / POST: Admin | 项目历史 |
| `/api/v1/projects/{id}/attachments` | GET | 认证用户 | 项目附件 |
| `/api/v1/projects/{id}/negotiation-prep` | GET | 认证用户 | AI 谈判准备 |
| `/api/v1/projects/{id}/strategist-chat` | POST | 认证用户 | AI 策略师聊天 |

### 联系人管理
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/v1/contacts` | GET/POST | GET: 认证 / POST: Admin | 获取/创建联系人 |
| `/api/v1/contacts/{id}` | PATCH | Admin | 更新联系人 |

### AI 功能
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/v1/extract` | POST | Admin | AI 数据提取 |
| `/api/v1/smart-input/universal` | POST | Admin | 通用 AI 提取与同步 |
| `/api/v1/intelligence/{company}` | GET | 认证用户 | 公司情报报告 |

### 自动化集成
| 端点 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/v1/webhook/ingest` | POST | 公开 | Webhook 数据摄入 |
| `/api/v1/ingestion/pending` | GET | 认证用户 | 待审核采集 |
| `/api/v1/ingestion/{id}/process` | POST | Admin | 处理采集项 |
| `/api/v1/ingestion/sync` | POST | Admin | 邮件同步 |

---

## ⚠️ 代码不一致问题清单

### 🔴 高优先级

#### 1. 认证系统混用 Firebase 和 本地 JWT

**问题描述:**
- 前端 `package.json` 引入了 `firebase` 依赖 (`"firebase": "^12.11.0"`)
- 前端 `AuthContext.jsx` 使用本地 JWT 认证 (`/api/v1/auth/login`)
- 后端 `auth.py` 使用 bcrypt + PyJWT 实现本地认证
- 后端 `models.py` 第 9 行定义了 `firebase_uid` 字段但从未使用

**代码证据:**
```python
# backend/models.py 第 5-16 行
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)  # ⚠️ 从未使用
    name = Column(String)
    email = Column(String, unique=True, index=True)
    job_title = Column(String)
    role = Column(String)
    initials = Column(String)
    hashed_password = Column(String)  # 使用 bcrypt 本地密码
    is_active = Column(Integer, default=1)
```

```javascript
// ai-bd-tracker/src/context/AuthContext.jsx 第 79-96 行
const login = async (email, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  const authToken = data.access_token;  // JWT Token
  setToken(authToken);
  localStorage.setItem('token', authToken);
};
```

```json
// ai-bd-tracker/package.json 第 14 行
"dependencies": {
  "firebase": "^12.11.0",  // ⚠️ 未在前端代码中使用
  ...
}
```

**潜在风险:**
- 代码中存在两种认证系统的残留，可能导致开发混淆
- `firebase` 依赖增加不必要的包体积
- `firebase_uid` 字段占用数据库空间但无实际用途

**建议修复:**
1. 如果不需要 Firebase 认证，移除 `firebase` 依赖
2. 从 `User` 模型中移除 `firebase_uid` 字段 (需数据库迁移)
3. 或者完整实现 Firebase 认证集成

---

### 🟡 中优先级

#### 2. 类型不一致：Integer vs Boolean

**问题描述:**
- `CareerHistory` 模型中 `isCurrent` 字段在数据库使用 `Integer`，在 Pydantic Schema 使用 `bool`

**代码证据:**
```python
# backend/models.py 第 117-127 行
class CareerHistory(Base):
    __tablename__ = "career_histories"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"))
    company = Column(String)
    title = Column(String)
    dateRange = Column(String)
    isCurrent = Column(Integer, default=0)  # ⚠️ 使用 Integer (SQLite 兼容)
```

```python
# backend/schemas.py 第 42-56 行
class CareerHistoryBase(BaseModel):
    company: str
    title: str
    dateRange: str
    isCurrent: bool = False  # ⚠️ 使用 bool

class CareerHistoryResponse(CareerHistoryBase):
    id: int
    contact_id: int
    class Config:
        from_attributes = True
```

**影响:**
- Pydantic 会自动进行类型转换 (`0` → `False`, `1` → `True`)
- 但在某些边界情况下可能导致意外行为
- 前端接收到的值类型可能不一致

**建议修复:**
- 在 SQLAlchemy 模型中使用 `Boolean` 类型 (如果数据库支持)
- 或在 Pydantic Schema 中明确使用 `int` 并添加文档说明

---

#### 3. 权限控制边界不清晰

**问题描述:**
- 后端使用 `get_current_active_user` 和 `get_current_admin_user` 两种权限检查
- 前端使用 `isAdmin` 判断控制 UI 元素
- 某些 API 端点的权限要求不一致

**代码证据:**
```python
# backend/main.py 第 121 行 - 需要 admin
@app.post("/api/v1/extract", response_model=dict)
def ai_extract_bd_data(request: schemas.AIParsingRequest, current_user: models.User = Depends(get_current_admin_user)):
    """需要 Admin 权限"""

# backend/main.py 第 434 行 - 只需要 active user
@app.get("/api/v1/projects/{project_id}/negotiation-prep")
def get_project_negotiation_prep(project_id: int, force: bool = False, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_active_user)):
    """只需要认证用户"""
```

```javascript
// ai-bd-tracker/src/views/SmartInput.jsx 第 182 行
<button 
  onClick={handleAIParse} 
  disabled={isAnalyzing || !inputText.trim() || !isAdmin}  // ⚠️ 前端权限检查
  className={`...${(!isAdmin || isAnalyzing || !inputText.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
>
```

```python
# backend/auth.py 第 81-88 行
def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Check if the current authenticated user is an admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return current_user
```

**影响:**
- 权限逻辑分散在前后端，可能导致安全漏洞
- 前端权限检查可以被绕过
- 如果后端权限变更，前端可能不同步更新

**建议修复:**
1. 创建权限矩阵文档，明确每个端点的权限要求
2. 在前端统一处理权限错误 (403 响应)
3. 考虑使用基于策略的权限系统

---

#### 4. 前端 API 错误处理不一致

**问题描述:**
- `AuthContext.jsx` 实现了完善的错误处理辅助函数 (`readJsonSafe`, `detailFromBody`)
- 但 `api.js` 中使用简单的错误处理方式

**代码证据:**
```javascript
// ai-bd-tracker/src/context/AuthContext.jsx 第 5-24 行
async function readJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text.trim().slice(0, 400) };
  }
}

function detailFromBody(data) {
  if (!data || data.detail == null) return null;
  const d = data.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d.map((e) => (e && e.msg) ? e.msg : JSON.stringify(e)).join('; ');
  }
  return String(d);
}
```

```javascript
// ai-bd-tracker/src/services/api.js 第 71-84 行
getProjects: async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(false)
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);  // ⚠️ 简单错误处理
    }
    return response.json();
  } catch (error) {
    console.error('GetProjects API error:', error);
    throw error;
  }
},
```

**影响:**
- 用户体验不一致，某些错误可能无法正确显示
- FastAPI 返回的结构化错误信息 (`detail` 字段) 可能丢失
- 代理/网关返回的非 JSON 错误响应可能解析失败

**建议修复:**
1. 在 `api.js` 中集成 `readJsonSafe` 类似的辅助函数
2. 统一错误处理格式，提取后端返回的 `detail` 字段
3. 创建全局错误通知组件

---

#### 5. GET 请求的 Content-Type 处理

**问题描述:**
- 前端 `api.js` 中 GET 请求显式不设置 Content-Type
- 这是一个合理的假设，但在某些代理场景下可能出现问题

**代码证据:**
```javascript
// ai-bd-tracker/src/services/api.js 第 74 行
getProjects: async () => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: getAuthHeaders(false)  // Don't include content-type for GET requests
  });
  ...
},

// ai-bd-tracker/src/services/api.js 第 16-29 行
const getAuthHeaders = (includeContentType = true) => {
  const token = getAuthToken();
  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
```

**说明:**
- GET 请求通常不需要 Content-Type (因为没有请求体)
- 但这种显式排除可能在某些严格配置的代理/网关下出现问题
- 建议保持当前做法，但需了解潜在影响

---

#### 6. AI 模型 ID 硬编码

**问题描述:**
- 后端 `ai_engine.py` 多处硬编码 `gemini-3-flash-preview`
- 没有通过环境变量配置模型 ID

**代码证据:**
```python
# backend/ai_engine.py 第 43 行
model_id = "gemini-3-flash-preview"

# backend/ai_engine.py 第 231 行 (extract_mixed)
model_id = "gemini-3-flash-preview"

# backend/ai_engine.py 第 338 行 (generate_company_intelligence)
model_id = "gemini-3-flash-preview"

# backend/ai_engine.py 第 395 行 (generate_negotiation_prep)
model_id = "gemini-3-flash-preview"

# backend/ai_engine.py 第 443 行 (chat_with_strategist)
model_id = "gemini-3-flash-preview"
```

**影响:**
- 模型更新或切换时需要修改代码
- 无法灵活使用不同模型 (如测试新模型、降级到便宜模型)
- 不同功能无法配置不同模型

**建议修复:**
```python
# 建议改为环境变量配置
import os
MODEL_ID = os.getenv("GEMINI_MODEL_ID", "gemini-3-flash-preview")

# 或者按功能配置不同模型
EXTRACT_MODEL = os.getenv("GEMINI_EXTRACT_MODEL", "gemini-3-flash-preview")
INTELLIGENCE_MODEL = os.getenv("GEMINI_INTELLIGENCE_MODEL", "gemini-3-pro-preview")
CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-3-flash-preview")
```

---

### 🟢 低优先级

#### 7. 日期格式不统一

**问题描述:**
- 后端多处使用不同的日期格式

**代码证据:**
```python
# backend/main.py 第 254 行
lastContactDate=datetime.now().strftime('%Y-%m-%d')  # 仅日期

# backend/main.py 第 474 行
prep_updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # 日期 + 时间

# backend/models.py 第 152 行注释
created_at = Column(String)  # YYYY-MM-DD HH:MM (但实际格式不一致)
```

**影响:**
- 前端显示和排序可能不一致
- 日期解析可能需要多种格式

**建议修复:**
```python
# backend/database.py 中添加统一的日期工具
def get_date_string(include_time: bool = False) -> str:
    """Get current date as string."""
    fmt = '%Y-%m-%d %H:%M:%S' if include_time else '%Y-%m-%d'
    return datetime.now().strftime(fmt)
```

---

#### 8. Pydantic Schema 重复定义

**问题描述:**
- `schemas.py` 中 `TokenData` 类被定义了两次

**代码证据:**
```python
# backend/schemas.py 第 241-243 行
class TokenData(BaseModel):
    email: Optional[str] = None

# backend/schemas.py 第 282-284 行
class TokenData(BaseModel):  # ⚠️ 重复定义
    email: Optional[str] = None
```

**影响:**
- 第二个定义会覆盖第一个，可能导致代码混淆
- 静态分析工具可能报错

**建议修复:** 移除重复定义 (第 241-243 行)

---

#### 9. Mock 数据硬编码

**问题描述:**
- `useStore.js` 中包含硬编码的 mock catalysts 数据

**代码证据:**
```javascript
// ai-bd-tracker/src/store/useStore.js 第 11-14 行
const initialCatalysts = [
  { id: 1, competitor: 'Vertex Pharma', asset: 'VX-548 (Pain)', event: 'Phase III Top-line data release.', date: 'Oct 23', impact: 'High' },
  { id: 2, competitor: 'Merck & Co.', asset: 'Keytruda sBLA', event: 'FDA PDUFA Date: early-stage NSCLC.', date: 'Oct 25', impact: 'Medium' }
];
```

**说明:**
- 这些数据可能用于开发/演示
- 建议移到配置文件或通过 API 获取

---

#### 10. JSON 字段默认值处理

**问题描述:**
- 后端 `models.py` 中 JSON 字段使用 `default=dict` 或 `default=list`
- 后端 `schemas.py` 中多处使用 `Optional[dict] = {}`

**代码证据:**
```python
# backend/models.py
notification_prefs = Column(JSON, default=dict)  # Python dict

# backend/schemas.py 第 268 行
notification_prefs: Optional[dict] = {}  # Pydantic default
```

**说明:**
- Pydantic 会正确处理这些默认值
- 但在某些序列化场景下可能导致空值处理不一致
- 建议在 API 响应中显式处理空值

---

## 📊 代码质量指标

| 指标 | 数值 | 说明 |
|------|------|------|
| **后端代码行数** | ~1,900 行 | 不含空行和注释 |
| **前端代码行数** | ~2,500 行 | 不含空行和注释 |
| **API 端点数量** | ~35 个 | 包含所有 CRUD 和业务端点 |
| **数据库表数量** | 10 个 | 包含关联表 |
| **认证方式** | JWT | 本地认证，30 分钟过期 |
| **AI 模型** | Gemini 3 Flash | 硬编码 |

---

## 🔧 建议改进清单

### 短期 (1-2 周)

1. **移除 Firebase 残留**
   - 移除 `firebase` npm 依赖
   - 移除 `firebase_uid` 数据库字段

2. **统一错误处理**
   - 在 `api.js` 中集成 `readJsonSafe` 辅助函数
   - 创建全局错误通知组件

3. **修复重复定义**
   - 移除 `TokenData` 重复定义

### 中期 (1 个月)

4. **权限系统文档化**
   - 创建权限矩阵文档
   - 统一前后端权限检查逻辑

5. **AI 模型配置化**
   - 添加环境变量配置模型 ID
   - 支持不同功能使用不同模型

6. **日期工具函数**
   - 创建统一的日期格式化工具

### 长期 (季度)

7. **类型系统重构**
   - 评估 SQLAlchemy Boolean 支持
   - 统一 Integer/Boolean 使用

8. **测试覆盖**
   - 添加后端 API 测试
   - 添加前端组件测试

---

## 📝 总结

AI-BD Tracker 是一个功能完整、架构清晰的全栈应用。代码整体质量良好，但存在一些不一致之处，主要集中在：

1. **认证系统**: Firebase 残留与实际使用的 JWT 认证不一致
2. **类型处理**: SQLAlchemy 和 Pydantic 之间的类型转换
3. **权限边界**: 前后端权限检查分散
4. **错误处理**: 不同模块错误处理方式不一致

这些问题大多数属于中等或低优先级，不影响核心功能运行。建议按上述清单逐步改进，以提升代码质量和可维护性。

---

> **备注**: 本报告由代码静态分析生成，未包含运行时测试验证。实际修复前建议进行完整测试。