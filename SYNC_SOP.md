# AI-BD Tracker: Dual-Machine Sync SOP (Windows <-> Mac Mini)

To ensure consistency and prevent merge conflicts between your development environments, all AI agents (Antigravity) and human contributors MUST follow this synchronization protocol.

## 核心流程 (The Workflow)

### 1. 开始工作前 (Pull Stage)
Before performing any code edits or database tasks, check the remote state.
- **指令**: `git pull origin main`
- **目的**: 确保获取了另一台设备（如 Mac Mini）昨天推送到 GitHub 的最新生产补丁。
- **冲突处理**: 
  - 如果是因为 `package-lock.json` 或 `README.md` 等非业务逻辑产生冲突，优先选择远程版本 (`--theirs`)。
  - 核心逻辑冲突必须人工干预或由 AI 提出方案后再确认。

### 2. 开发进行中 (Working Stage)
- 保持 `dev_log.md` 的实时更新，记录当前所在的 Phase 阶段。
- **强制同步**: 本地调试通过后，**必须**将 `backend/sql_app.db` 同步至 Supabase (运行 `scripts/migrate_to_supabase.py`)。严禁仅同步代码而忽略数据库，以免造成前后端不一致。

### 3. 工作结束前 (Push Stage)
Before leaving the current session or switching computers.
- **指令**: 
  ```bash
  git add .
  git commit -m "SOP Sync: Phase [X.X] - [Short description]"
  git push origin main
  ```
- **目的**: 将当前的工程进度固化为 GitHub 上的最新 Commit，供下一台电脑提取。

## 环境变量对齐 (Secrets)
- 由于 `.env` 不参与 Git 同步，请手动确保两台机器的 `GEMINI_API_KEY` 和 `SUPABASE_DB_URL` 是一致的。

---

### **⚠️ 重要提示**
**切记**：凡是涉及架构升级（如 Phase 17/18 的补丁），必须先 Push 再切换设备，严禁在两台电脑同时进行不兼容的 `models.py` 修改。
