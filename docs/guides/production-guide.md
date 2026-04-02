# **AI-BD Tracker 生产环境开发与架构指南**

将目前的 MVP 升级为真正可供企业内部高管和 BD 团队日常使用的全套软件，需要从“单文件原型”走向“工程化体系”。以下是标准的落地实施路径：

## **第一阶段：前端工程化与组件拆分 (Frontend)**

目前的 MVP 将所有逻辑写在了一个 App.jsx 中。在正式开发中，需要将其拆分为规范的项目结构。

1. **初始化项目基础环境**  
   * 推荐使用 **Vite** 或 **Next.js** 来初始化 React 项目。  
   * 终端运行：npm create vite@latest ai-bd-tracker \-- \--template react 或 npx create-next-app@latest。  
   * 安装依赖：npm install lucide-react tailwindcss firebase。  
2. **目录与组件拆分**  
   建议的目录结构：  
   src/  
   ├── components/         \# 可复用组件  
   │   ├── Sidebar.jsx     \# 左侧导航栏  
   │   ├── Topbar.jsx      \# 顶部信息栏  
   │   └── KanbanBoard.jsx \# 拖拽看板组件  
   ├── views/              \# 核心视图页面  
   │   ├── SmartInput.jsx  \# AI 智能录入页  
   │   ├── Dashboard.jsx   \# 高管看板页  
   │   ├── Pipeline.jsx    \# 管线视图页  
   │   └── Schedule.jsx    \# 日程视图页  
   ├── hooks/              \# 自定义钩子 (如 useFirebaseData)  
   ├── services/           \# API 请求层 (连接后端 AI 接口)  
   └── App.jsx             \# 路由入口

3. **状态管理**  
   * 随着项目变大，建议引入 **Zustand** 或 **Redux Toolkit** 来管理全局的 Projects、Tasks 和 User 信息，避免组件层层传递 Props。

## **第二阶段：后端与核心 AI 引擎建设 (Backend & AI)**

为了保护医药 BD 的高度商业机密，以及处理复杂的 AI 逻辑，您需要一个强大的私有后端。

1. **搭建 Python 后端服务**  
   * 推荐使用 **FastAPI**，因为它对异步请求和 AI 接口调用支持极好。  
   * 使用我在之前为您提供的 backend.py 模板作为起点。  
2. **数据库选型**  
   * **关系型数据 (PostgreSQL)**：存储公司、管线、用户权限、跟进时间等结构化数据。  
   * **向量数据库 (Milvus 或 Pinecone)**：如果您希望以后能通过自然语言搜索历史聊天记录（例如：“去年哪家公司问过我们的 ADC 平台？”），需要将早期的会议纪要向量化存储。  
3. **AI 解析引擎对接**  
   * 集成大语言模型（如 Gemini 1.5 Pro 或 GPT-4o）。  
   * **System Prompt 优化**：在后端进一步细化 Prompt，让 AI 不仅能提取时间，还能分析“情绪/意向度 (Interest Level)”并打分。  
   * 数据脱敏：在后端发送给云端 AI 模型前，可以使用正则表达式或本地 NER 模型，将真实的药物代号替换为 \[Asset\_A\]，进一步提升安全性。

## **第三阶段：核心工作流自动化集成 (Workflow Automation)**

真正的提效在于“无感录入”。

1. **邮件解析自动化 (Email Parsing)**  
   * 配置一个专属的收件邮箱（如 tracker@yourcompany.com）。  
   * 使用 SendGrid Inbound Parse 或 AWS SES，当您将邮件转发给这个邮箱时，自动触发 Webhook，将邮件正文发送给您的 FastAPI 后端进行 AI 解析。  
2. **微信 / 会议纪要集成**  
   * 开发一个简单的微信小程序，或者飞书/钉钉的内部机器人，供团队开完会后直接语音输入或丢入文件，后端自动接管。  
3. **智能日历同步**  
   * 当 AI 从沟通记录中提取出“下周五开视频会”时，后端可以通过 Microsoft Graph API (针对 Outlook) 或 Google Calendar API，自动向您的日历发送会议邀请草稿。

## **第四阶段：安全与部署 (Security & Deployment)**

医药 BD 数据是最高机密，因此安全是重中之重。

1. **权限控制 (RBAC)**  
   * **高管视角**：可以查看所有管线项目的汇总和逾期情况。  
   * **BD 经理视角**：只能查看和编辑自己负责的管线和公司。  
2. **私有化部署建议**  
   * 如果不希望将数据放到公有云（如 Firebase），可以选择将整个服务打包为 Docker 镜像，部署在公司内部的局域网服务器或专属的 AWS / 阿里云 VPC 虚拟私有云中。  
3. **操作审计日志 (Audit Trail)**  
   * 记录所有关键状态的变更（谁在什么时间把 Ipsen 的状态从 DD 推进到了 Term Sheet），这在后续的复盘中非常有价值。

**下一步建议：**

如果您使用 Antigravity 或任何其他开发平台，您可以直接将 App.jsx 的代码作为前端的展示层 (View Layer) 嵌入，然后集中精力让您的后端工程师去完成“第二阶段”的 Python AI 接口开发。
---

## **开发日志 (Development Log)**

### 2026-03-30 测试与状态评估

**执行者：** Antigravity AI (Claude Opus 4.6)

**测试内容：** 对 `ai-bd-tracker/` Vite 项目进行完整启动测试

**发现的问题：**

1. **node_modules 损坏** — 项目存放在 OneDrive 目录中，文件同步导致 `node_modules` 内文件不完整（缺失 `vite/dist/node/chunks/chunk.js`）。执行 `rm -rf node_modules && npm install` 后修复（耗时约5分钟，OneDrive I/O较慢）。

2. **App.jsx 仍为 Vite 默认模板** — 当前 `src/App.jsx` 显示的是 "Get started / Count is 0" 的 Vite + React 初始模板，`MVP Html程序.md` 中的854行业务代码尚未集成到项目中。

3. **缺少关键依赖** — `package.json` 中只有 `react` 和 `react-dom`，缺少以下 MVP 所需依赖：
   - `lucide-react` — 图标库
   - `tailwindcss` — CSS 框架（MVP 代码大量使用 Tailwind class）
   - `firebase` — 后端数据持久化（Auth + Firestore）

4. **目录结构已按开发指南创建但为空** — `src/components/`、`src/views/`、`src/store/`、`src/services/` 目录已存在但均为空。

5. **后端未实现** — `backend/` 目录为空，`backend_code_reference.py` 是 FastAPI 参考模板（在项目根目录），尚未部署为可运行服务。

**当前可运行状态：** ✅ `npm run dev` 可正常启动，Vite 开发服务器在 `localhost:5173` 运行，但显示的是默认模板页面。

**下一步工作建议（按优先级排序）：**

1. 安装 MVP 所需依赖：`npm install lucide-react tailwindcss firebase`
2. 配置 Tailwind CSS（`tailwind.config.js` + PostCSS 配置）
3. 将 `MVP Html程序.md` 中的业务代码拆分并迁入：
   - 数据模型 & 初始数据 → `src/store/` 或 `src/data/`
   - 侧边栏组件 → `src/components/Sidebar.jsx`
   - 顶部栏组件 → `src/components/Topbar.jsx`
   - Smart Input 视图 → `src/views/SmartInput.jsx`
   - Dashboard 视图 → `src/views/Dashboard.jsx`
   - Pipeline Kanban 视图 → `src/views/Pipeline.jsx`
   - Schedule 视图 → `src/views/Schedule.jsx`
   - Firebase 服务层 → `src/services/firebase.js`
   - AI 解析服务层 → `src/services/ai.js`
4. 路由与状态管理集成
5. 后端 FastAPI 服务搭建（基于 `backend_code_reference.py`）
