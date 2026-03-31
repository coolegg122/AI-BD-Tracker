# AI-BD Tracker: Dual-Machine Sync Guide (Windows <-> Mac Mini)

To ensure consistency and prevent merge conflicts, all AI agents (Antigravity) and human developers must follow this standard synchronization procedure.

## 🚀 Sync Protocol

### 1. **Start of Session (Pull First)**
Before doing ANY work, always pull the latest changes from GitHub to ensure you have the work done on the other machine.
- **Command**: `git pull origin main`
- **Goal**: Synchronize local state with the cloud "master" version.

### 2. **During Development**
- Keep the `dev_log.md` updated with your progress.
- Ensure any database changes are backed up or migrated if necessary.

### 3. **End of Session (Push Last)**
Always push your work to GitHub before switching to the other machine or ending your session.
- **Commands**:
  ```bash
  git add .
  git commit -m "Sync: [Brief summary of work done]"
  git push origin main
  ```
- **Goal**: Make your work available for the other machine to pull.

## 🔑 Environment Variables
Remember that `.env` files are NOT synced via Git. Ensure both machines have the necessary keys (e.g., `GEMINI_API_KEY`, `SUPABASE_DB_URL`).

---

> [!IMPORTANT]
> If you encounter a merge conflict, address it immediately. Usually, `git pull --rebase` or choosing `theirs` (remote) is safer for simple syncs, but always verify architectural changes.
