# AI Agent Operational Rules

> [!IMPORTANT]
> **CRITICAL COMMAND RULE**
> - NEVER append the character `暁`, `晓`, or any other non-standard characters to the end of terminal commands or tool arguments.
> - ALWAYS use ONLY standard ASCII characters in `CommandLine`, `toolAction`, and `toolSummary`.
> - This is a recurring failure that MUST be avoided to maintain system stability.

## 双工Debug (Duplex Debug)

本项目使用双工Debug系统进行代码审查 - 两个AI agents并行分析、实时讨论、达成共识。

### 工作模式
- **并行分析**: Qwen3和GLM5同时分析代码
- **实时讨论**: 双方就发现的问题进行讨论
- **共识达成**: 对每个问题达成一致意见
- **方案协商**: 共同制定解决方案

### Agents
| Agent | 角色 | 专注领域 |
|-------|------|----------|
| Qwen3-Debugger | 主审查员 | 安全、逻辑、性能、类型安全 |
| GLM5-Debugger | 交叉验证 | 边缘情况、集成、用户体验 |

### 使用方法
```bash
# 双工Debug模式（推荐）
python3 duplex_debug.py <files>

# 示例
python3 duplex_debug.py backend/auth.py backend/main.py
```

### 配置文件
- `.agent/qwen3-debugger.md` - Qwen3配置
- `.agent/glm5-debugger.md` - GLM5配置
- `.agent/workflows/duplex-debug.md` - 工作流程

## Lessons Learned
- [2026-03-31] Failed multiple times by adding `暁` or `晓` to commands. These characters cause parser errors and user frustration.
- [2026-03-31] JWT token "sub" field is string type, must convert to int when querying database.
- [2026-03-31] SQLite doesn't allow adding UNIQUE columns via ALTER TABLE - add without constraint first.
