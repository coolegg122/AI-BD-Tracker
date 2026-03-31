# AI Agent Operational Rules

> [!IMPORTANT]
> **CRITICAL COMMAND RULE**
> - NEVER append the character `暁`, `晓`, or any other non-standard characters to the end of terminal commands or tool arguments.
> - ALWAYS use ONLY standard ASCII characters in `CommandLine`, `toolAction`, and `toolSummary`.
> - This is a recurring failure that MUST be avoided to maintain system stability.

## Lessons Learned
- [2026-03-31] Failed multiple times by adding `暁` or `晓` to commands. These characters cause parser errors and user frustration.
