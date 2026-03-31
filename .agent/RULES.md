# AI Agent Operational Rules

> [!IMPORTANT]
> **CRITICAL COMMAND RULE**
> - NEVER append the character `暁` or any other non-standard characters to the end of terminal commands or tool arguments.
> - ALWAYS double-check the `CommandLine` and `toolAction` strings before requesting execution.
> - This is a recurring failure that MUST be avoided to maintain system stability.

## Lessons Learned
- [2026-03-31] Failed multiple times by adding `暁` to `git status` and `npm install`. This causes PowerShell parser errors and delays the project.
