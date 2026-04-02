# AI-BD Tracker: Full-Stack Sync SOP (Atomic Protocol)

To ensure the system's stability and prevent state-mismatch bugs (like 500 errors or UI loading hangs), all development and AI agents (Antigravity) MUST follow this **Atomic Synchronization Protocol**.

---

## 🚀 核心原则 (Core Principle: Atomic Sync)
**严禁分层同步**。任何涉及跨层的改动（API 字段增加、数据库表结构修改、前端 Store 映射）必须在**同一次 Git 提交**中发布。

---

## 🔄 同步阶段 (Sync Workflow)

### 1. 开始阶段 (Status Pull)
在进行任何修改前，必须先同步云端状态。
- **指令**: `git pull origin main`
- **目的**: 确保本地拥有 Mac Mini 和云端的最新代码补丁。

### 2. 开发与验证 (Local Verification)
在 Push 之前，必须在本地完成双端验证：
1.  **Backend (FastAPI)**: 运行 `uvicorn main:app`，确保 `schemas.py` 与 `models.py` 匹配。
2.  **Frontend (React)**: 运行 `npm run dev`，确保 `api.js` 和 `useStore.js` 能够正确处理后端数据。
3.  **Schema Alignment**: 如果修改了 Pydantic Schema，必须同步更新前端的 `results` 处理逻辑。

### 3. 数据库迁移 (DB Migration)
如果更新了 `backend/models.py` (如添加了 `source_text` 字段)：
- **指令**: 在 **Supabase SQL Editor** 中运行相应的 `ALTER TABLE` 命令。
- **目的**: 确保云端数据库结构与本地代码版本完全对齐。

### 4. 提交与推送 (Atomic Push)
本地验证通过后，进行全量同步。
- **指令**:
  ```bash
  git add .
  git commit -m "feat(sync): [Phase X.X] [Feature Name] - Full-stack synchronized (FE+BE+DB)"
  git push origin main
  ```
- **目的**: 将前端代码、后端代码、文档一并固化，并触发 Vercel/Cloud 的自动部署。

---

## 🔒 环境变量对齐 (Secrets)
由于 `.env` 不参与同步，两台机器必须手动手动保持一致：
- `GEMINI_API_KEY`: AI 提取核心。
- `DATABASE_URL`: Supabase 远程地址。

---

> [!IMPORTANT]
> **切记**：如果同步代码后发现前端一直在 “Loading”，请第一时间检查 **Backend API 是否返回 500**，这通常说明你只同步了前端代码，而忽略了**后端 Schema** 或**云端数据库字段**的更新。
