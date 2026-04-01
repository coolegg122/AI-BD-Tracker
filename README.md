# AI-BD Tracker

AI-BD Tracker 是一个专为生物制药行业业务发展(BD)团队设计的智能化项目跟踪管理系统。该系统利用AI技术自动化处理BD相关的各种任务和信息管理，帮助团队高效跟踪潜在合作机会、管理项目进度、分析竞争对手动态。

## 功能特性

### 1. 智能数据提取
- **AI驱动解析**: 从邮件、会议记录、聊天记录等非结构化文本中自动提取项目信息
- **多格式支持**: 支持多种文本来源的数据提取
- **智能分类**: 自动识别公司、管线、阶段、跟进日期等关键信息

### 2. 项目管理
- **看板视图**: 可视化展示项目在不同阶段的进展
- **阶段跟踪**: 支持从初始接触到谈判签约的全流程跟踪
- **任务管理**: 自动创建和跟踪待办事项

### 3. 仪表板与报告
- **高管概览**: 提供项目健康状况和关键指标的综合视图
- **数据可视化**: 使用图表展示项目趋势和分布
- **关键指标**: 实时显示活跃项目数、休眠项目数、本周跟进数等

### 4. 竞争情报
- **AI生成报告**: 自动生成竞争对手的战略分析、专利到期、近期交易等信息
- **催化剂事件**: 跟踪行业内的重要事件和时间节点
- **情报缓存**: 本地数据库缓存以提高响应速度

### 5. 人脉管理
- **高管档案**: 建立详细的联系人档案
- **职业履历**: 跟踪高管的职业变动历史
- **关系网络**: 展示联系人与各公司的关联

### 6. 邮件与自动化集成
- **邮件同步**: 通过IMAP协议直接同步Zoho邮件
- **自动采集**: 支持Webhook和邮件转发的自动数据录入
- **待审收件箱**: AI预处理后的数据审核流程

### 7. 会议管理
- **行业会议**: 专门管理JPM、ASCO等顶级行业会议
- **时区转换**: 自动计算不同时区的时间差异
- **会议档案**: 为参会高管准备背景资料

## 技术架构

### 前端
- **框架**: React + Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **图表**: Recharts
- **图标**: Lucide React
- **路由**: React Router

### 后端
- **框架**: FastAPI
- **数据库**: SQLAlchemy ORM (支持SQLite/PostgreSQL)
- **数据验证**: Pydantic
- **AI集成**: Google GenerativeAI (Gemini)
- **管理界面**: SQLAdmin

### 部署
- **云平台**: Vercel
- **数据库**: Supabase (生产环境)
- **环境管理**: 支持本地开发和云端部署

## 核心模块

### 1. Smart Input (智能输入)
允许用户粘贴原始文本，AI自动提取结构化数据并创建项目记录。

### 2. Dashboard (仪表板)
提供高管视角的项目概览，包含统计数据、关键指标和重要提醒。

### 3. Pipeline (管线跟踪)
看板式界面，可视化展示项目在不同阶段的进展，支持拖拽更改阶段。

### 4. Schedule (日程管理)
集成日历功能和竞争对手催化剂事件跟踪。

### 5. Conferences (会议中心)
专门管理行业顶级会议，包括倒计时、时区换算和专属档案。

### 6. Contacts (人脉管理)
高管联系人档案及其职业履历跟踪系统。

## AI功能

### 文本解析
系统使用先进的AI模型从非结构化文本中提取关键BD信息，包括：
- 公司名称和管线信息
- 项目阶段和跟进日期
- 任务和行动项
- 联系人信息
- 附件和文档

### 竞争情报生成
AI自动生成竞争对手的详细分析报告，涵盖：
- 重点关注领域
- BD策略
- 专利到期风险
- 近期交易历史

## 安全与隐私

- **本地部署选项**: 支持私有化部署以保护敏感商业信息
- **数据加密**: 所有传输数据均经过加密处理
- **访问控制**: 支持基于角色的权限管理
- **审计日志**: 记录所有关键操作的审计轨迹

## 开发历程

该项目经历了多个开发阶段(Phase 1-25)，从最初的MVP发展为功能完备的企业级应用，包含了完整的前后端分离架构、数据库持久化、AI集成、邮件同步等功能。

## 适用场景

AI-BD Tracker 特别适合：
- 生物制药公司的BD团队
- 需要跟踪多个合作项目的团队
- 需要监控竞争对手动态的组织
- 希望自动化处理大量非结构化沟通信息的团队
- 需要数据驱动决策的高管层

## 业务价值

1. **提高效率**: 通过AI自动化减少手动录入工作
2. **增强洞察**: 提供深入的竞争分析和市场洞察
3. **改善协作**: 支持团队成员间的实时协作
4. **降低风险**: 自动跟踪关键截止日期和里程碑
5. **数据驱动**: 基于数据的决策支持系统

## 部署

### 环境要求
- Node.js (前端开发)
- Python 3.8+ (后端开发)
- Google Gemini API Key (AI功能)
- Zoho邮箱账户 (邮件同步功能)

### 本地开发设置

#### 1. 克隆仓库
```bash
git clone https://github.com/coolegg122/AI-BD-Tracker.git
cd AI-BD-Tracker
```

#### 2. 设置后端 (FastAPI)
```bash
cd backend
pip install -r requirements.txt
```

创建 `.env` 文件并配置以下环境变量：
```env
GEMINI_API_KEY=your_google_gemini_api_key
ZOHO_EMAIL=your_zoho_email
ZOHO_PASSWORD=your_zoho_password
ZOHO_IMAP_SERVER=imap.zoho.com
ZOHO_IMAP_PORT=993
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=your-secret-key-change-in-production
```

#### 3. 设置前端 (React/Vite)
```bash
cd ai-bd-tracker
npm install
```

#### 4. 运行项目
分别在两个终端中运行：

后端：
```bash
cd backend
uvicorn main:app --reload
```

前端：
```bash
cd ai-bd-tracker
npm run dev
```

### Vercel云部署

该项目已配置为可在Vercel上一键部署：

1. 将代码推送到GitHub仓库
2. 在Vercel仪表板中导入项目
3. 配置环境变量（完整说明见根目录 [`.env.example`](.env.example) 与 [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md)）：
   - `POSTGRES_URL` 或 `DATABASE_URL`: Supabase 连接串（Serverless 建议 Transaction Pooler **6543** 端口）
   - `SECRET_KEY`: JWT 签名密钥（生产环境请使用 `openssl rand -hex 32` 生成）
   - `GEMINI_API_KEY`: Google Gemini API密钥
   - `ZOHO_EMAIL` / `ZOHO_PASSWORD`: 邮件同步（若使用）
4. 部署完成后即可访问应用

部署后可用脚本自检登录与用户接口（需有效账号）：

```bash
BASE_URL=https://你的域名.vercel.app SMOKE_EMAIL=你的邮箱 SMOKE_PASSWORD=你的密码 ./scripts/vercel-api-smoke.sh
```

### 数据库配置

项目支持SQLite(开发)和PostgreSQL(生产)：
- 本地开发：使用SQLite数据库 (`sql_app.db`)
- 生产环境：推荐使用Supabase PostgreSQL数据库

## 认证功能

AI-BD Tracker现在包含了完整的用户认证系统：

### 功能特性
- **用户注册**: 新用户可以注册账户
- **用户登录**: 现有用户可以使用电子邮件和密码登录
- **JWT令牌**: 使用JSON Web Tokens进行身份验证
- **受保护路由**: 只有认证用户才能访问某些功能
- **用户资料管理**: 用户可以更新个人资料信息

### API端点
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/users/me` - 获取当前用户信息
- `PATCH /api/v1/users/me` - 更新用户资料

### 前端组件
- 登录页面 (`/login`)
- 注册页面 (`/register`)
- 认证上下文管理
- 自动令牌管理（存储在localStorage中）

## 贡献


## 工具

### 双工 Debug (Duplex Debug)

本项目使用双工 Debug 系统进行代码审查。

> **注意**: 此工具**仅适用于 Qwen Code**，不适用于 Antigravity 或 Claude Code。

详细说明请查看：`tools/duplex-debug/README.md`

```bash
# 进入工具目录
cd tools/duplex-debug

# 运行审查
python3 duplex_debug.py <文件路径>
```

## 许可证

此项目按照 MIT 许可证发布。
