# 双工 Debug 系统 - 独立部署说明

## 目录结构

双工 Debug 系统已移至独立目录，与项目代码分离：

```
BDProjectManagement/
├── .agent/                          # 主项目的 agent 配置（简化版）
│   └── RULES.md                     # 包含双工 Debug 引用说明
│
├── tools/
│   └── duplex-debug/                # 双工 Debug 独立工具目录
│       ├── README.md                # 主文档（含 Qwen Code 专用说明）
│       ├── duplex_debug.py          # 主审查脚本
│       ├── debug_review.py          # 基础审查脚本
│       ├── DUPLEX_DEBUG_GUIDE.md    # 完整使用指南
│       ├── DUPLEX_DEBUG_EXAMPLES.md # 讨论示例
│       ├── DUPLEX_DEBUG_QUICKSTART.md # 快速参考
│       ├── DUPLEX_DEBUG_SUMMARY.md  # 系统总结
│       └── .agent/                  # 双工 Debug 配置目录
│           ├── qwen3-debugger.md    # Qwen3 配置
│           ├── glm5-debugger.md     # GLM5 配置
│           └── workflows/
│               └── duplex-debug.md  # 工作流程定义
│
└── [项目其他文件]
```

## 重要说明

### ⚠️ 平台限制

**双工 Debug 系统仅适用于 Qwen Code**，不适用于：
- ❌ Antigravity
- ❌ Claude Code
- ❌ 其他 AI 编程助手

### 原因

双工 Debug 系统深度集成了 Qwen Code 的专有特性：
1. Agent 系统调用接口
2. 工具链集成机制
3. 会话管理优化
4. 代码上下文理解

其他平台缺少必要的支持，无法运行此系统。

## 使用方法

### 在 Qwen Code 中

```bash
# 进入工具目录
cd tools/duplex-debug

# 运行双工 Debug
python3 duplex_debug.py <文件路径>

# 示例
python3 duplex_debug.py backend/auth.py backend/main.py
```

### 在其他平台

如果你使用 Antigravity 或 Claude Code，请使用平台内置的代码检查工具：

**Antigravity**:
- 使用内置的 lint 功能
- 使用标准 Python 工具（pylint, flake8, black）

**Claude Code**:
- 使用 Claude 的代码分析功能
- 使用标准代码检查工具

## 文件说明

### 核心文件

| 文件 | 说明 | 大小 |
|------|------|------|
| `duplex_debug.py` | 主审查脚本（交互式，支持并行分析 + 讨论） | ~36KB |
| `debug_review.py` | 基础审查脚本（单向分析） | ~15KB |

### 配置文件

| 文件 | 说明 |
|------|------|
| `.agent/qwen3-debugger.md` | Qwen3 Agent 配置（安全、逻辑、性能） |
| `.agent/glm5-debugger.md` | GLM5 Agent 配置（边缘情况、集成、UX） |
| `.agent/workflows/duplex-debug.md` | 双工 Debug 工作流程定义 |

### 文档

| 文件 | 说明 |
|------|------|
| `README.md` | 主文档，包含平台限制说明 |
| `DUPLEX_DEBUG_GUIDE.md` | 完整使用指南 |
| `DUPLEX_DEBUG_EXAMPLES.md` | 讨论示例 |
| `DUPLEX_DEBUG_QUICKSTART.md` | 快速参考卡片 |
| `DUPLEX_DEBUG_SUMMARY.md` | 系统总结 |

## 工作流程

```
1. 并行分析 (Qwen3 + GLM5)
   ↓
2. 实时讨论 (互相验证)
   ↓
3. 达成共识 (方案协商)
   ↓
4. 生成报告 (问题汇总 + 评分)
```

## Agents 分工

| Agent | 角色 | 专注领域 |
|-------|------|----------|
| **Qwen3-Debugger** | 主审查员 | 安全漏洞、逻辑错误、性能瓶颈、类型安全 |
| **GLM5-Debugger** | 交叉验证 | 边缘情况、集成问题、用户体验、可维护性 |

## 检测能力

### Qwen3 检测
- ✅ 密码未哈希存储
- ✅ JWT 验证缺失
- ✅ SQL 注入风险
- ✅ API 端点缺少认证
- ✅ 性能瓶颈（N+1 查询）
- ✅ 类型安全问题

### GLM5 检测
- ✅ 邮箱格式验证缺失
- ✅ localStorage 空值检查
- ✅ Token 过期处理
- ✅ 空状态 UI 处理
- ✅ 异步错误处理
- ✅ 边缘情况和边界条件

## 输出报告示例

```
======================================================================
双工 Debug (Duplex Debug) - 最终报告
======================================================================

审查时间：2026-03-31T22:55:02
审查文件：2
发现问题：4

严重程度分布:
  Critical: 0
  High: 0
  Medium: 3
  Low: 1

代码质量评分:
  安全性：10/10
  可靠性：10/10
  集成性：10/10
  用户体验：10/10

Agent 签核:
  Qwen3-Debugger: ✅ APPROVED
  GLM5-Debugger:  ✅ APPROVED
======================================================================
```

## 双工讨论示例

```
Qwen3: 发现 Critical Security 问题 - JWT token 未验证签名
       位置：backend/auth.py:45
       建议：必须验证 JWT 签名和过期时间

GLM5: 从用户角度看，这可能导致数据泄露。
      我同意严重程度评估。
      另外，我注意到缺少 token 过期处理。

Qwen3: 好发现。让我加入修复计划。

共识：双方同意这是 Critical 级别问题。
      修复计划：启用签名验证 + 检查过期时间
```

## 最佳实践

### ✅ 推荐做法
- 完成新功能后立即运行
- 重点关注核心业务逻辑和安全代码
- Critical 问题必须修复才能合并
- 定期更新 agent 配置

### ❌ 避免做法
- 不要忽略 Medium 以上问题
- 不要为了赶进度跳过审查
- 不要盲目接受所有建议（根据项目实际情况判断）

## 常见问题

### Q: 为什么不能在 Antigravity 或 Claude Code 中使用？

A: 双工 Debug 系统深度集成了 Qwen Code 的专有接口和工具链：
- Agent 调用接口是 Qwen Code 专有的
- 工具注册机制依赖 Qwen Code 的系统
- 上下文管理基于 Qwen Code 的会话管理
- 代码分析引擎集成 Qwen Code 内置分析器

其他平台缺少这些必要的技术支持。

### Q: 支持哪些编程语言？

A: 目前支持：
- Python (.py)
- JavaScript/JSX/TypeScript (.js/.jsx/.ts/.tsx)

### Q: 如何自定义检查规则？

A: 编辑 `.agent/qwen3-debugger.md` 和 `.agent/glm5-debugger.md`

### Q: 报告保存在哪里？

A: `duplex_debug_report_YYYYMMDD_HHMMSS.md`

### Q: 如何集成到 CI/CD？

A: 在 CI 脚本中添加：
```bash
python3 duplex_debug.py backend/*.py
```

## 替代方案（非 Qwen Code 平台）

如果你使用其他平台，可以考虑：

### 通用工具
- **ESLint** - JavaScript/TypeScript 代码检查
- **Pylint** - Python 代码检查
- **Black** - Python 代码格式化
- **flake8** - Python 代码风格检查

### 平台特定工具
- **Antigravity**: 使用内置 lint 工具
- **Claude Code**: 使用 Claude 的代码分析功能

## 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    双工 Debug 系统                            │
│         (Qwen Code 专用工具)                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ Qwen3 Agent  │              │  GLM5 Agent  │            │
│  │ (主审查员)   │◄────────────►│ (交叉验证)   │            │
│  │              │   并行执行    │              │            │
│  │ • 安全分析    │   实时讨论    │ • 边缘情况   │            │
│  │ • 逻辑检查    │   共识达成    │ • 集成验证   │            │
│  │ • 性能优化    │              │ • 用户体验   │            │
│  └──────────────┘              └──────────────┘            │
│         │                              │                    │
│         └──────────┬───────────────────┘                    │
│                    │                                        │
│                    ▼                                        │
│         ┌─────────────────────┐                            │
│         │   双工讨论引擎       │                            │
│         │   (Qwen Code 专用)   │                            │
│         └─────────────────────┘                            │
│                    │                                        │
│                    ▼                                        │
│         ┌─────────────────────┐                            │
│         │   最终报告生成器     │                            │
│         └─────────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 更多信息

- 完整使用指南：`DUPLEX_DEBUG_GUIDE.md`
- 讨论示例：`DUPLEX_DEBUG_EXAMPLES.md`
- 快速参考：`DUPLEX_DEBUG_QUICKSTART.md`
- 系统总结：`DUPLEX_DEBUG_SUMMARY.md`

---

**⚠️ 再次提醒**: 本工具仅适用于 Qwen Code。

**立即开始**: `python3 duplex_debug.py <your-files>`