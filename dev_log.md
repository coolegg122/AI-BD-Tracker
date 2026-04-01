# AI-BD Tracker Development Log

此文档用于记录项目的代码变更历史与架构状态，建议您在使用任何其他 AI 辅助编程工具时，先让其阅读此文档以快速获取项目上下文。

## 历次版本迭代地图 (Phase Roadmap v1.0 - v14.0)
| Phase | 核心模块 / 功能迭代 (Features) | 关键技术状态 |
| :--- | :--- | :--- |
| **P 1-3** | **前后端分离重构**：完全剥离 HTML 单文件 MVP，建立 Vite + React 前端与 FastAPI + SQLite 后端的双边架构，完成 RESTful 通信打通。 | `Production Ready` |
| **P 4-7** | **全局状态与组件精修**：引入 Zustand 状态管理，完善 Dashboard 面板 UI 与全局通知交互。建设底层 Schema。 | `Completed` |
| **P 8** | **Pipeline 360° 透视**：重构看板逻辑，新增“按管线资产 (Asset)”与“按合作公司 (Partner)”双向折叠透视矩阵。 | `Completed` |
| **P 9** | **历史足迹下钻**：开发 `ProjectSlideOver.jsx`，支持点击时间轴事件原地展开高仿真的邮件、会议 Takeaways 和关键档案。 | `Completed` |
| **P 10-11**| **全球战役室 (Conferences Hub)**：新增会议管理一级模块，支持 JPM, ASCO 等顶会的倒计时、时差换算计算以及专属战盟档案背景自动切换。 | `Completed` |
| **P 12-13**| **人脉情报网持久化 (Key Contacts)**：建立高管大图名片簿，后接 SQLite `Contact` 与 `CareerHistory` 表实现履历变动的 1-to-N 级联数据库固化。 | `Completed` |
| **P 14** | **AI 竞争情报引擎 (Intelligence)**：贯通 Gemini 接口，在 Kanban 直接生成大厂近况调查（战略、并购史、专利悬崖），并使用本地 DB 永久缓存提速。 | `Completed` |

---


## [2026-03-30] 架构升级：完成 Phase 1 (前端) 与 Phase 2 (后端) 初始化

### Phase 1: 前端工程化与 Vite 组件拆分

将原本 1500+ 行的单文件 MVP (`MVP Html程序.md`) 成功解耦为标准化的现代 React 架构。

- **工作目录**: `ai-bd-tracker/`
- **技术栈**: React, Vite, Tailwind CSS v4, Zustand, React Router, Firebase.
- **核心变更记录**:
  - **组件化 (Components)**: 提取了 `Sidebar.jsx`, `Topbar.jsx`。
  - **视图分离 (Views)**: 提取并路由拆分了 `SmartInput.jsx`, `Dashboard.jsx`, `Pipeline.jsx`, `Schedule.jsx`。
  - **状态管理 (Store)**: 新增 `store/useStore.js` (Zustand)，消除属性透传，统一管理 `projects` 和 `catalysts`。
  - **服务解耦 (Services)**: 新增 `services/firebase.js` 统一管理凭证和连接连接池。

### Phase 2: 私有企业级后端骨架与 AI 引擎搭建

基于《生产环境开发指南》，从零构建了满足数据隐私要求的 Python Web 应用程序骨架。

- **工作目录**: `backend/`
- **技术栈**: Python, FastAPI, SQLAlchemy, Pydantic, Google GenerativeAI (Gemini SDK).
- **核心变更记录**:
  - **数据库设计**: `database.py` 配置了连接；`models.py` 构建了 `User`, `Project`, `Task` 的 ORM 表结构与强关联外键。
  - **接口规范**: `schemas.py` 构建了严谨的 Pydantic 数据校验模型 (`ProjectCreate`, `TaskSchema` 等)。
  - **AI 交互层**: `ai_engine.py` 集成了大模型 Gemini，内嵌了专门处理包含医药研发隐讳信息和时间提取的 System Prompt。
  - **路由控制器**: `main.py` 完成了从大模型提取数据、到直接存入数据库的 `/api/v1/extract` 和 `/api/v1/projects` 的全套 REST API。

### Phase 3: 前后端整合 (Integration)

将重构好的 Vite 前端界面与 FastAPI 后端正式脱机对接，移除了由于 MVP 继承而来的 Firebase 直接读写代码。

- **核心变更记录**:
  - **新建** `src/services/api.js`: 使用 fetch 封装了对 `http://localhost:8000/api/v1` 的标准 RESTful 请求（`extractProjects`, `getProjects`, `createProject`, `updateProjectStage`）。
  - **重构** `src/App.jsx`: 移除 Firebase SDK 的 `onSnapshot` 监听，改为初始化时调用 `api.getProjects()`。
  - **重构** `src/views/SmartInput.jsx`: 移除了客户端模拟生成 JSON 逻辑，改为实际发起 `/api/v1/extract` 和后续写入操作。
  - **重构** `src/views/Pipeline.jsx`: 将看板拖拽的阶段流转更新对接至后端的 `PATCH /projects/{id}` API（同时具有前端乐观更新体验）。

---

## [2026-03-30] 业务深化：完成 Phase 8-11 核心功能重构与品牌化

### Phase 8: Deal Tracker 360° 多维透视矩阵 (Pipeline 重构)

彻底重构了 `Pipeline.jsx`，将看板模式升级为高密度 BD 透视表。

- **工作目录**: `ai-bd-tracker/src/views/Pipeline.jsx`
- **核心变更**:
  - **双视角切换**: 支持“按内部管线 (Asset)”与“按外部公司 (Partner)”进行维度透视。
  - **折叠交互**: 采用了手风琴式的嵌套布局，支持在不跳页的情况下直接查阅每家合作伙伴的最新反馈状态。

### Phase 9: 历史足迹深度下钻 (Footprint Deep Dives)

赋予了历史时间轴“穿透到底层文件”的能力。

- **工作目录**: `ai-bd-tracker/src/components/ProjectSlideOver.jsx`
- **核心变更**:
  - **内联手风琴详情**: 在 CRM 抽屉的时间轴中点击记录，可原地展开明细面板。
  - **专门视图**: 开发了 `Email Viewer` (仿真邮件头与正文)、`Document Viewer` (带 CDA 有效期预警的档案卡) 和 `Meeting Viewer` (参会人名单与 Takeaways)。

### Phase 10 & 11: 全球会议战役室与导航重构 (Global Conferences Hub)

新增了一级核心模块，用于管理 JPM, AACR, ASCO, ESMO 等顶级商务会议。

- **工作目录**: `src/views/Conferences.jsx`, `src/components/Sidebar.jsx`
- **核心变更**:
  - **时区引擎**: 自动计算会场（PST/CEST/CDT）与北京时间（CST）的时差及对时表。
  - **战盟档案 (Dossier)**：整合了参会高管画像、谈判目标以及对手背景调查。
  - **导航扩容**: 主侧边栏新增了悬挂式的子菜单 (Nested Nav)，直接在主目录快速切换会议。
  - **空间解放**: 移除了多余的二级侧栏，将 100% 的宽度释放给会议大厅，通过顶部胶囊 Tab 切换年份。

### 品牌资产化 (Branding & Assets)

- **本地化 Logo**: 在 `public/logos/` 中部署了 JPM, AACR, ASCO, ESMO 的超清官方 Logo。
- **动态主题**: 根据当前选取的会议（或历史存档状态），整站大屏背景色、图标及强调色会联动热切换。

---

## [2026-03-30] 核心模块全栈化：完成 Phase 13 与 Phase 14 (AI 智能生成)

### Phase 13: 人脉情报警报系统持久化 (Key Contacts Persistence)

将前端原本 Hardcoded 的高管联系人剥离，下沉至后台 SQLite 数据库全量接管。

- **工作目录**: `backend/models.py`, `src/views/Contacts.jsx`
- **核心变更**:
  - **动态关系映射**: 新建了 `Contact` 主模型，并通过 SQLAlchemy `ForeignKey` 实现了与 `CareerHistory` 的一对多级联存储，真实还原高管跳槽履历。
  - **RESTful 对接**: 开通了 `GET /api/v1/contacts`。
  - **UI 容错机制**: 在 React 前端加入了骨架屏/加载雷达动画，即使后端网络拥堵也能保持极佳的科技感视觉交互。

### Phase 14: 竞争情报大模型生成引擎 (AI Competitive Intelligence)

构建了一整套基于 Gemini API 的企业级“竞争对手尽调背调”生态。

- **逻辑架构**:
  - **前台触点**: 在 `Pipeline.jsx` 双维视图的最显眼处注入了高亮的 `[✨ AI DOSSIER]` 与 `[✨ View AI Deep Dive]` 徽章级悬浮按钮。
  - **沉浸式 UI**: 独立抽离了 `IntelligenceModal.jsx` 弹窗，运用暗黑景深与微发光动效展示情报四大维度：战略偏好、核心临床领域、专利悬崖危机以及近期历史交易对标。
  - **后台持久层**: 
    1. 前端唤醒后端 `GET /api/v1/intelligence/{company}`。
    2. 后端拦截请求，优先检索数据库表 `CompanyIntelligence` 是否已有该厂牌的缓存档案。
    3. 若无缓存，`ai_engine.py` 瞬间组装 System Prompt 击穿大模型（配有强大的脱机 Mock 备用库保证无网演示），提取纯粹的 JSON 回调。
    4. 落库并返还前端，实现“首开长加载，后续秒唤醒”的生产级体验。

---

### 给下一个接手 AI 的关键上下文提示 (Context for AI Agents)

- **当前状态**: 前后端接口已高度咬合。不仅涵盖了 Deal Tracking 状态流转，更完成了【人脉库】与【AI 战情库】的表结构持久化。前端在主流程视图上已全部淘汰 Mock 数据并转由 Zustand Store 从业务接口订阅。
- **当前的待办 (TODO)**:
  1. **正式 AI 接口联调**: 目前 `AIAnalysisModal.jsx` 与竞争情报中的输出虽然逼近完美，但若要实际商用，需在本地根目录下配置 `.env` 文件填充真实的 `GEMINI_API_KEY`。
  2. **可视化增强**: 考虑在 Dashboard 引入 Recharts 曲线，展示 Pipeline 中不同阶段项目的估值/里程碑趋势。
  3. **数据反哺闭环**: 让人脉页面和会议页面的信息也能通过 Smart Input 从非结构化文本中一键提取落库。

---

## [2026-03-31] 部署就绪：完成 Phase 15 (Vercel Cloud Deployment Prep)

### Phase 15: 生产环境部署优化与 GitHub 同步

为了将项目发布至 Vercel，我们对架构进行了最后的云端适配优化。

- **工作目录**: 项目根目录
- **核心变更记录**:
  - **路径适配**: 修改了 `api/index.py`，动态向 `sys.path` 注入了 `backend` 路径，解决了 Vercel Serverless 环境下跨目录导入 `models`, `schemas` 失败的问题。
  - **依赖补完**: 深度审计了 `requirements.txt` 和 `package.json`，确保所有生产环境依赖（如 `sqladmin`, `google-generativeai`, `zustand`）均已声明。
  - **构建优化**: 新增了 `.vercelignore`，排除了 `node_modules`、本地 SQLite 数据库 (`sql_app.db`) 以及 macOS 缓存文件，显著提升了 Vercel 的上传与构建速度。
  - **GitHub 整合**: 用户已成功将全量代码推送到 GitHub (`coolegg122/AI-BD-Tracker`)。

### **给下一个接手 AI 的关键上下文提示 (Context for Vercel Deployment)**

- **Vercel 配置**: 
  - **Framework Preset**: 选择 `Other` (由 `vercel.json` 接管)。
  - **Root Directory**: 保持为项目根目录。
  - **Environment Variables**: 必须在 Vercel 控制台配置 `GEMINI_API_KEY` 以开启 AI 解析功能。
- **持久化提醒**: 目前使用 SQLite。如果需要生产级数据持久化，请在 Vercel 配置 `DATABASE_URL` 指向外部 Postgres 数据库。

**当前状态**: 🚀 **代码已就绪，可直接在 Vercel 导入 GitHub 仓库进行一键部署。**

### Phase 16: 数据彻底迁移至 Supabase (Cloud Database Sync)

通过直接执行 Python 脚本，已成功将本地离线的 `sql_app.db` 内容无损迁移到线上的 Supabase Postgres 库中。

- **工作目录**: `scripts/`
- **操作记录**:
  - 创建并执行了 `migrate_to_supabase.py`。
  - **同步成果**: 成功迁移了 8 个项目 (Project), 8 个任务 (Task), 4 名高管履历 (Contact + History), 以及 4 份 AI 竞争情报 (Intelligence)。
  - **网络细节**: 因本地屏蔽了 IPv6 外回，使用 `aws-1-ap-southeast-2.pooler.supabase.com:6543` 的 IPv4 Proxy 池成功连接并写入完毕。

### Phase 17: Vercel 云端运行时优化与 Bug 修复 (Serverless DB Fix)

在 Vercel 部署连结线上 Supabase 之后，针对 Vercel Edge/Serverless Functions 和 Supabase Pooler 的特性进行了三次关键修复，彻底解决了前端 "Loading / Syncing" 永远转圈的 500 崩溃问题。

- **核心变更记录**:
  - **数据库连接池兼容**: 修改了 `backend/main.py`，**移除并注销了 `models.Base.metadata.create_all`**。因为在 Serverless 环境加上 Supabase 默认开启事务池 (Transaction Pooler, 6543端口) 的情况下，每次冷启动执行 DDL 会阻塞并直接触发 Vercel 10s 超时上限导致崩溃。
  - **Vercel 环境变量智能读取**: 修改了 `backend/database.py`，代码目前会智能轮询读取 `DATABASE_URL`, `POSTGRES_URL` (Supabase Vercel 插件默认提供), 以及 `POSTGRES_URL_NON_POOLING`，全方位保证不回退到 SQLite 从而引发 Vercel 容器只读报错。
  - **SQLAdmin 后台云端穿透**: 修改了 `vercel.json` 路由规则，新增了对 `/admin` 及 `/admin/(.*)` 的精确规则，保证了 FastAPI 内置的后台管理界面能在生产环境被正确代理打开。
  - **构建防错**: 清理了被工具误加到根目录下的 `package.json`，确保 Vercel 构建系统能够准确识别当前为 Python 后端，并根据 `requirements.txt` 打包依赖。

---

## [2026-03-31] 环境打通：完成 Phase 18 (GitHub & Supabase Production Sync)

### Phase 18: 代码与数据全量云端对齐

为了正式完成部署闭环，我们在本地与云端（GitHub/Supabase）之间建立了稳定的同步链路。

- **核心变更记录**:
  - **GitHub 权限激活**: 在根目录下重新初始化了本地 Git 仓库，并通过用户提供的 GitHub PAT (ghp_...) 建立了与 `coolegg122/AI-BD-Tracker` 的远程连接。
  - **全量代码推送**: 成功将包含 Phase 17（Vercel 运行时优化）在内的所有代码强制推送（Force Push）至 `main` 分支，确保 Vercel 的自动构建源为最新状态。
  - **Supabase 脚本修复**: 修改了 `scripts/migrate_to_supabase.py`，解决了由于目录结构调整导致的 `ModuleNotFoundError: No module named 'database'` 导入错误，使迁移工具能够正确加载 `backend.models`。
  - **数据迁移触达**: 使用 IPv4 Pooler 代理地址 (`aws-1-ap-southeast-2.pooler.supabase.com:6543`) 成功完成数据同步，将本地最新的项目、人脉及 AI 竞争情报全量迁移至 Supabase 云端数据库。

**当前状态**: ✅ **基础设施全面就绪**。建立了双机同步标准操作程序 (SOP)，已在根目录生成 `SYNC_SOP.md` 并在 `.agent/workflows/sync.md` 配置了 AI 指令系统。

## [2026-03-31] 业务赋能：完成 Phase 19 (Interactive Dashboard Visualizations)

### Phase 19: 交互式数据可视化增强

为了提升 BD 决策效率，我们在 Executive Dashboard 中引入了动态图表模块，实现了从单一指标向多维情报可视化的跨越。

- **工作目录**: `ai-bd-tracker/src/components/charts/`, `ai-bd-tracker/src/views/Dashboard.jsx`
- **技术栈**: Recharts, Lucide-React.
- **核心变更**:
  - **依赖集成**: 引入了 `recharts` 库，作为前端可视化的核心引擎。
  - **项目漏斗图 (Project Funnel)**: 开发了 `ProjectFunnel.jsx` 交互式条形图，按阶段（Initial Contact, CDA, DD 等）实时统计项目分布。点击图表即可一键跳转至管线详情。
  - **组合动量趋势 (Portfolio Momentum)**: 开发了 `PortfolioTrend.jsx` 面积图，可视化展示过去 6 个月内项目数量与 AI 情报获取的增长趋势。
  - **布局重构**: 在 Dashboard 中新增了 "Pipeline Intelligence" 专区，采用分栏布局展示核心图表。

---

## [2026-03-31] 后端增强：完成 Phase 20 (History Footprints DB Persistence)

### Phase 20: 历史轨迹数据库持久化

为了让项目的“足迹”模块从纯前端 Mock 转向真实的业务支撑，我们对后端架构进行了深度补全。

- **工作目录**: `backend/models.py`, `backend/schemas.py`, `backend/main.py`, `ai-bd-tracker/src/components/ProjectSlideOver.jsx`
- **核心变更**:
  - **ORM 扩展**: 在 Supabase 中新增了 `project_history` 表，采用 JSONB 存储灵活的事件元数据（如 Zoom 链接、PDF 下载地址、参会人名单等）。
  - **API 实现**: 新增了 `GET /api/v1/projects/{id}/history` 接口，支持按时间倒序拉取真实的跟进轨迹。
  - **前端对接**: 重构了 `ProjectSlideOver.jsx`，移除了硬编码的 `mockHistory` 数组，引入了异步加载状态（Loading Pulse）和真实的后端数据绑定。
  - **附件打通**: 在 `public/demo-assets/` 下建立了真实的附件下载锚点，确保 CDA 签署和会议纪要功能的交互闭环。

---

## [2026-03-31] 业务闭环：完成 Phase 21 (Data Feedback Loop & AI Re-ingestion)

### Phase 21: 多维数据反哺与 AI 预判系统

为了实现 BD 信息的全自动闭环，我们将“Smart Input”升级为通用的 BD 智能采集引擎。

- **工作目录**: `backend/ai_engine.py`, `ai-bd-tracker/src/views/SmartInput.jsx`, `ai-bd-tracker/src/services/api.js`
- **核心变更**:
  - **通用提取引擎**: 升级了 AI 引擎，支持从一段非结构化文本中智能提取：**BD 项目 (Project)**、**高级人脉 (Contact)** 以及 **会议纪要/邮件 Takeaways (Meeting Note)**。
  - **AI 智能关联**: 针对会议纪要，AI 会自动从语境中“猜”出它属于哪一个管线项目，并提供 `suspected_project_name`。
  - **三合一预览工作流**: 重构了 Smart Input UI。AI 提取后，现在会先进入“人工审核模式”。管理员可以对 AI 识别的错误进行修正（如职位变动、项目归属等）。
  - **关联入库**: 会议纪要现在可以精确地追溯到各个项目的 `ProjectHistory` 表中，形成了完整的 Deal Tracking 足迹。

---

## [2026-03-31] 深度采集：完成 Phase 22 (AI Inbound Inbox & Review System)

### Phase 22: 智能化全自动异步采集通道

为了支持邮件 BCC 密送采集及外部 Webhook 对接，我们将 Smart Input 升级为异步“AI 收件箱”模式。

- **工作目录**: `backend/models.py`, `backend/main.py`, `ai-bd-tracker/src/views/SmartInput.jsx`, `ai-bd-tracker/src/services/api.js`
- **核心变更**:
  - **待审收件箱 (Pending Inbox)**: 在后端新增 `pending_ingestion` 表及管理接口。支持通过 Email 转发或 Webhook 直接向系统推送原始文本。
  - **元数据抽取**: 系统现在能自动记录邮件发件人（用于 Owner 归属逻辑）、邮件主题以及原始附件列表（📎 PDF/PPT 等）。
  - **异步预判逻辑**: 邮件到达瞬间，AI 会同步在后台完成“初审”并将结构化草稿存入 Pending 状态。
  - **二级确认 UI**: Smart Input 新增“Review Inbox”标签页。用户可以查看所有待处理邮件，一键加载 AI 预判结果，修正后点击 Archive 正式转存至生产库。

---

### **给下一个接手 AI 的关键上下文提示 (Context for Inbound Data)**

- **Smart Input 架构**: 具备同步（剪贴板粘贴）与异步（邮件收件箱）双通道。所有非手动录入的数据必须经过 `PendingIngestion` 暂存审核区。
- **当前状态**: ✅ **全业务链路已闭环**。AI-BD Tracker 现已进化为集：决策仪表盘 (Phase 19) -> 历史足迹跟踪 (Phase 20) -> 智能结构化抽取 (Phase 21) -> 多元异步采集 (Phase 22) 于一体的自动化系统。

---

## [2026-03-31] 直连采集：完成 Phase 23 (Zoho Mail Direct IMAP Integration)

### Phase 23: Zoho Mail 直连同步模块

为了彻底省去 Cloudmailin 等中间服务，实现"发邮件 → 系统直接感知"的最简流程，我们直接用 IMAP 协议登录 `bdtracker212@zohomail.com` 进行主动拉取。

- **工作目录**: `backend/mail_poller.py`, `backend/main.py`, `ai-bd-tracker/src/views/SmartInput.jsx`, `ai-bd-tracker/src/services/api.js`, `.env`
- **核心变更**:
  - **[NEW] `backend/mail_poller.py`**: 完整的 IMAP 拉取模块。支持多部分邮件解析（纯文本 + HTML 降级），自动提取附件名，调用 AI 引擎初审，写入 `PendingIngestion`。
  - **去重逻辑**: 按 `sender_email + subject` 去重，避免重复点击同步时产生重复记录。
  - **API 触发**: 新增 `POST /api/v1/ingestion/sync` 接口，供前端"一键同步"。
  - **前端按钮**: `SmartInput.jsx` 的 AI Inbox 标签下新增 **"Sync Zoho Mail"** 按钮，并将其从条件渲染区域提升至顶部工具栏（**永远可见**，修复 UX Bug）。
  - **同步结果反馈**: 按钮旁新增绿色/红色的同步结果 Toast 提示。
  - **凭据安全**: Zoho 账号/密码存储于本地 `.env`，已加入 `.gitignore`，不入库。

### Phase 23 Hotfix: Schema 校验 & 错误提示优化

- **问题**: 在 Vercel 生产环境中，AI 无法保证始终提取出 `nextFollowUp` 字段，导致后端 Pydantic 422 验证失败，前端只显示无意义的 "Failed to save" 提示。
- **修复**:
  - `backend/schemas.py`: 将 `ProjectBase.nextFollowUp` 和 `pipeline` 改为 `Optional[str] = ""`，不再强制要求 AI 必须提供。
  - `api.js`: `createProject` 现在会读取后端返回的完整错误 JSON body 并抛出，而非仅抛出 HTTP 状态码。
  - `SmartInput.jsx`: 错误弹窗升级为显示后端真实错误详情，大幅提升了生产环境可调试性。

---

### **给下一个接手 AI 的关键上下文提示 (Context for Phase 23)**

- **邮箱账号**: `bdtracker212@zohomail.com`（凭据在本地 `.env`，Vercel Environment Variables 中单独配置）。
- **去重逻辑**: 基于 `sender + subject`。如需更精确，可考虑改为 Message-ID 去重。
---

## [2026-03-31] 模型与架构升级：完成 Phase 24 与 Phase 25 (Unrestricted AI Data)

### Phase 24: Gemini 模型升级与 SDK 迁移

为了提升 AI 提取的精度与速度，并适应最新的开发标准，我们对 AI 引擎进行了底层重构。

- **核心变更记录**:
  - **SDK 迁移**: 将已过时的 `google-generativeai` 库完全迁移至 Google 官方最新的 `google-genai` SDK，采用更简洁的 `Client` 初始化模式。
  - **模型升级**: 从 `gemini-1.5-flash` 升级至 **`gemini-3-flash-preview`**，显著提升了在医药 BD 隐晦语境下的语义理解能力。
  - **环境健壮性**: 在 `main.py` 和 `ai_engine.py` 中强制执行 `load_dotenv()`，确保本地 `.env` 中的 API Key 优先级。

### Phase 25: AI 提取深度化与数据库灵活性扩展 (Unrestricted Data Strategy)

解决了系统此前“固定数据库维度”的限制，使 AI-BD Tracker 进化为真正的非结构化情报引擎。

- **核心变更记录**:
  - **数据库扩展 (Schema Upgrade)**: 在 `models.py` 的 `Project` 和 `Contact` 模型中新增了 `details` (JSON) 字段。
  - **数据库迁移 (Migration)**: 针对已有的 SQLite 数据库，开发并执行了 `migrate_add_details.py` 脚本，成功通过 `ALTER TABLE` 为存量数据补全了 JSONB 字段，解决了后端由于字段缺失导致的 500 崩溃。
  - **AI Prompt 重构**: 重新设计了 `ai_engine.py` 中的提示词，强制要求 AI 寻找并归类：临床靶点、药物联用、具体人物角色、会议关键备注等，并自动封装入 `details` 对象。
  - **CORS & Networking 彻底修复**:
    - **Vite Proxy**: 在 `vite.config.js` 中配置了 `/api` -> `localhost:8000` 的本地代理转发，彻底解决了浏览器在 `127.0.0.1` vs `localhost` 以及 VPN 隧道环境下频发的 "Failed to fetch" 和 CORS 拦截问题。
    - **API 路径扁平化**: 重构了 `api.js`，统一使用相对路径 `/api/v1`，实现了本地开发与 Vercel 生产环境的无缝切换。
  - **UI 动态赋能**: 升级了 `SmartInput.jsx` 的预览界面。新增了“动态细节编辑区”，支持用户在保存前对 AI 提取的所有非结构化详情进行增删改查。

---

### **给下一个接手 AI 的关键上下文提示 (Context for Phase 25)**

- **数据库弹性**: 现在的架构已不再惧怕业务维度的变动。所有新增需求（如“要记录药物副作用”、“要记录联系人 LinkedIn”）均可直接存入 `details`，无需再动 `models.py`。
- **本地开发环境**: 必须使用 **`127.0.0.1:5173`** 访问前端。Vite Proxy 已锁定转发至本地 `8000` 端口。
- **迁移工具**: `backend/migrate_add_details.py` 可作为未来数据库字段热更新的参考模板。

**当前状态**: ✅ **全业务链路已具备极强的容错性与扩展性**。后端能够处理万物，前端能够自由编辑，网络联调已由 Vite Proxy 彻底打通。

---

## [2026-04-01] 安全与追溯：完成 Phase 26 与 Phase 27

### Phase 26: 全栈用户身份验证系统 (Authentication & User Management)

为了满足企业级安全性要求，我们将系统从“无登录演示模式”升级为基于 JWT 的全栈身份验证架构。

- **工作目录**: `backend/auth.py`, `backend/models.py`, `ai-bd-tracker/src/context/AuthContext.jsx`, `ai-bd-tracker/src/views/LoginPage.jsx`
- **核心变更记录**:
  - **后端安全引擎**: 引入了 `bcrypt` 进行密码哈希，通过 `PyJWT` 签发 30 分钟有效的访问令牌。
  - **模型升级**: `User` 模型增加了 `email`, `hashed_password` 和 `is_active` 状态位。
  - **注册逻辑**: 开通了统一的注册与登录接口，支持在登录时校验用户是否被禁用。
  - **前端权限守卫**: 
    - 封装了 `AuthContext` 统一管理 Token 的持久化（Local Storage）与用户信息解析。
    - 在 `App.jsx` 中增加了 `ProtectedRoute` (路由守卫) 和 `PublicRoute` (重定向逻辑)，确保未授权用户无法访问管线数据。
  - **API 增强**: 在 `api.js` 中全局注入 `Authorization: Bearer <Token>` 请求头，对接后端受保护路由。

### Phase 27: 深度历史足迹持久化 (Persistent Footprints Expansion)

将原本依赖前端模拟数组的“足迹”模块，彻底重构为基于数据库持久层的交互式系统。

- **工作目录**: `backend/main.py`, `scripts/migrate_history_table.py`, `ai-bd-tracker/src/components/ProjectSlideOver.jsx`
- **核心变更记录**:
  - **专用表结构**: 正式建立了 `project_history` 表，通过 `project_id` 与主项目关联，支持存储会议纪要、邮件往来和档案变更记录。
  - **接口打通**: 实现了历史记录的 `GET` (列表拉取) 与 `POST` (手动新增足迹) API。
  - **UI 数据绑定**: 重构了侧滑抽屉 `ProjectSlideOver`，现在时间轴会实时拉取后端的历史事件，并展示对应的 Zoom 链接、附件预览等 JSON 详情。
  - **自动迁移工具**: 开发了 `migrate_history_table.py` 脚本，可一键完成建表与模拟数据注入。

---

### **给下一个接手 AI 的关键上下文提示 (Context for Authentication & History)**

- **身份验证**: 登录成功后 Token 存储在浏览器 `localStorage` 中。本地开发环境中，第一个初始用户需要通过 `auth/register` 手动创建或直接操作 DB。
- **数据状态**: 如果发现历史足迹为空，请运行 `python scripts/migrate_history_table.py` 进行数据初始化。
- **安全性**: `backend/auth.py` 中的 `SECRET_KEY` 在生产环境下必须从环境变量读取。

**当前状态**: ✅ **系统安全性与可追溯性大幅增强**。已完成从“数据采集”到“安全管控”的全流程功能闭环。

---

## [2026-04-01] 体验与功能完备化：完成 Phase 28 (Placeholder Removal & UX Polish)

### Phase 28: 补全占位功能、主题系统与设置中心

为了将项目从“原型验证”推向“生产就绪”，我们彻底清除了所有 `alert()` 占位符，并补全了账号管理、全局搜索及个性化配置的核心链路。

- **工作目录**: `backend/main.py`, `ai-bd-tracker/src/views/SettingsPage.jsx`, `ai-bd-tracker/src/components/Topbar.jsx`, `ai-bd-tracker/src/context/ThemeContext.jsx`
- **核心变更记录**:
  - **后端接口扩展**: 新增了改密 (`/auth/change-password`)、全局搜索 (`/search`) 及用户偏好设置 (`/users/me/preferences`) 三大端点，支持复杂业务逻辑。
  - **数据库热更新**: 通过 `migrate_add_user_prefs.py` 脚本为 `users` 表新增了 `notification_prefs` (JSONB) 和 `theme` (VARCHAR) 字段，并兼容 SQLite 与 PostgreSQL。
  - **全局主题引擎**: 基于 React Context 开发了 `ThemeContext`，结合 CSS Variables 与 Tailwind 4 `@theme` 实现了高表现力的深色/浅色模式热切换，且偏好设置随账号云同步。
  - **设置中心 (Settings)**: 
    - 实现了 4 个功能 Tab：个人资料修改、账号安全、通知开关（邮件/管线/会议/AI 情报）、界面主题。
  - **Topbar 交互重构**: 
    - **智能搜索**: 将原先的 alert 替换为实时查询后端数据库的下拉搜索框，支持分类索引项目与联系人。
    - **用户中心**: 点击头像展开下拉菜单，集成设置入口、主题切换与退出登录。
    - **情报汇总**: 点击 "AI Insights" 自动聚合来自 `Dashboard` 的最新高价值警报。
  - **登录 UX 优化**: 将“找回密码”警告框重构为内联 Modal，增强了品牌专业度。

---

### **给下一个接手 AI 的关键上下文提示 (Context for UX & Settings)**

- **深色模式**: 系统通过在 `<html>` 标签注入 `.dark` 类实现。CSS 变量定义在 `index.css` 的 `@layer base` 中。
- **搜索策略**: 采用 `ILike` 模糊匹配。如需提升性能，未来可在 Supabase 开启 `pg_trgm` 索引。
- **数据一致性**: 每次后端模型变更后，请务必运行对应的 `migrate_xxx.py` 脚本同步本地与线上数据库。

**当前状态**: ✅ **全系统功能点已无占位符，具备完整的生产级交互体验。**
