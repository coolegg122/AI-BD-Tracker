---
description: Dual-machine Synchronization (Windows <-> Mac Mini) SOP
---

For AI agents working on this repository, please follow this mandatory synchronization workflow to avoid conflicts across different development machines.

// turbo-all
1. **Pull Before Work**: Always start the session by pulling the latest changes from GitHub.
   ```powershell
   git pull origin main
   ```
2. **Resolve Conflicts**: If `git pull` fails due to conflicts, resolve them by prioritizing "theirs" (the remote) if it contains the latest Phase/Production fixes, or ask the user for guidance.
3. **Save Work Progress**: Periodically commit your changes with descriptive messages.
4. **Push After Work**: Always end the session (or before transitioning to another machine) by pushing the local state to GitHub.
   ```powershell
   git add .
   git commit -m "SOP Sync: [Summary of changes]"
   git push origin main
   ```
5. **Update Dev Log**: Record all key changes and the current "Phase" status in `dev_log.md`.
