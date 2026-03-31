# AI Agent Operational Rules

> [!IMPORTANT]
> **CRITICAL COMMAND RULE**
> - NEVER append the character `暁`, `晓`, or any other non-standard characters to the end of terminal commands or tool arguments.
> - ALWAYS use ONLY standard ASCII characters in `CommandLine`, `toolAction`, and `toolSummary`.
> - This is a recurring failure that MUST be avoided to maintain system stability.

## Lessons Learned
- [2026-03-31] Failed multiple times by adding `暁` or `晓` to commands. These characters cause parser errors and user frustration.
- [2026-03-31] JWT token "sub" field is string type, must convert to int when querying database.
- [2026-03-31] SQLite doesn't allow adding UNIQUE columns via ALTER TABLE - add without constraint first.

## 双工 Debug (Duplex Debug)

双工 Debug 系统已移至独立目录：`tools/duplex-debug/`

> **注意**: 此工具**仅适用于 Qwen Code**，不适用于 Antigravity 或 Claude Code。

详细说明请查看：`tools/duplex-debug/README.md`
