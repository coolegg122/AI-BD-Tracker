# 双工 Debug (Duplex Debug) 系统

> ⚠️ **重要提示**: 本工具**仅适用于 Qwen Code**，不适用于 Antigravity 或 Claude Code。

## 概述

双工 Debug 系统是一个专为 Qwen Code 设计的代码审查工具，通过两个 AI agents（Qwen3 和 GLM5）的**并行分析**、**实时讨论**和**共识达成**来提供全面的代码质量检查。

## 为什么只适用于 Qwen Code？

本系统深度集成了 Qwen Code 的以下特性：

1. **Agent 系统调用** - 使用 Qwen Code 专有的 agent 调用接口
2. **工具链集成** - 依赖 Qwen Code 内置的代码分析工具
3. **会话管理** - 利用 Qwen Code 的多轮对话优化机制
4. **代码上下文理解** - 基于 Qwen Code 的代码理解能力

❌ **不适用于**:
- Antigravity - 缺少必要的 agent 接口
- Claude Code - 工具调用方式不兼容
- 其他 AI 编程助手 - 架构不兼容

## 快速开始

```bash
# 进入工具目录
cd tools/duplex-debug

# 运行双工 Debug
python3 duplex_debug.py <文件路径>
```

### 示例

```bash
# 审查单个文件
python3 duplex_debug.py backend/auth.py

# 审查多个文件
python3 duplex_debug.py backend/auth.py backend/main.py

# 审查整个目录
python3 duplex_debug.py backend/*.py
```

## 系统架构

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

## Agents 分工

| Agent | 角色 | 专注领域 |
|-------|------|----------|
| **Qwen3-Debugger** | 主审查员 | 安全漏洞、逻辑错误、性能瓶颈、类型安全 |
| **GLM5-Debugger** | 交叉验证 | 边缘情况、集成问题、用户体验、可维护性 |

## 工作流程

```
1. 并行分析 → 2. 实时讨论 → 3. 达成共识 → 4. 生成报告
```

### 阶段说明

1. **并行分析**: Qwen3 和 GLM5 同时分析代码
2. **实时讨论**: 双方就发现的问题进行讨论
3. **达成共识**: 对每个问题达成一致意见
4. **生成报告**: 包含问题汇总、质量评分、行动计划

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

## 输出报告

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

## 文件结构

```
tools/duplex-debug/
├── README.md                      # 本文件
├── duplex_debug.py                # 主审查脚本
├── debug_review.py                # 基础审查脚本
├── DUPLEX_DEBUG_GUIDE.md          # 完整使用指南
├── DUPLEX_DEBUG_EXAMPLES.md       # 讨论示例
├── DUPLEX_DEBUG_QUICKSTART.md     # 快速参考
├── DUPLEX_DEBUG_SUMMARY.md        # 系统总结
└── .agent/
    ├── qwen3-debugger.md          # Qwen3 配置
    ├── glm5-debugger.md           # GLM5 配置
    └── workflows/
        └── duplex-debug.md        # 工作流程定义
```

## 使用场景

| 场景 | 使用方式 | 收益 |
|------|----------|------|
| 新功能开发 | 完成后立即审查 | 及早发现问题 |
| 代码重构 | 重构后验证 | 确保质量不下降 |
| Pull Request | 合并前审查 | 提高代码质量 |
| 安全审计 | 定期全面审查 | 发现潜在漏洞 |

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

## 配置选项

### 环境变量
```bash
# 启用/禁用双工 Debug
export DEBUG_AGENTS_ENABLED=true

# 设置 agent 模型
export QWEN3_MODEL=qwen3-plus
export GLM5_MODEL=glm-5

# 设置超时时间（秒）
export REVIEW_TIMEOUT=600
```

### 自定义检查规则
在 `.agent/qwen3-debugger.md` 和 `.agent/glm5-debugger.md` 中添加自定义规则。

## 常见问题

### Q: 为什么不能在 Antigravity 或 Claude Code 中使用？
A: 本系统深度集成了 Qwen Code 的专有接口和工具链，其他平台缺少必要的支持。

### Q: 支持哪些编程语言？
A: 目前支持 Python (.py) 和 JavaScript/JSX/TypeScript (.js/.jsx/.ts/.tsx)

### Q: 如何自定义检查规则？
A: 编辑 `.agent/qwen3-debugger.md` 和 `.agent/glm5-debugger.md`

### Q: 报告保存在哪里？
A: `duplex_debug_report_YYYYMMDD_HHMMSS.md`

### Q: 如何集成到 CI/CD？
A: 在 CI 脚本中添加 `python3 duplex_debug.py backend/*.py`

## 技术限制

由于以下技术原因，本工具**无法**在其他平台运行：

1. **Agent 调用接口** - 使用 Qwen Code 专有的 agent 协议
2. **工具注册机制** - 依赖 Qwen Code 的工具注册系统
3. **上下文管理** - 基于 Qwen Code 的会话管理
4. **代码分析引擎** - 集成 Qwen Code 内置分析器

## 替代方案

如果你使用其他平台，可以考虑：

- **Antigravity**: 使用内置的 lint 工具
- **Claude Code**: 使用 Claude 的代码分析功能
- **通用方案**: ESLint, Pylint, Black 等标准工具

## 许可证

本工具与主项目使用相同的许可证（MIT）。

## 更多信息

- 完整使用指南：`DUPLEX_DEBUG_GUIDE.md`
- 讨论示例：`DUPLEX_DEBUG_EXAMPLES.md`
- 快速参考：`DUPLEX_DEBUG_QUICKSTART.md`
- 系统总结：`DUPLEX_DEBUG_SUMMARY.md`

---

**⚠️ 再次提醒**: 本工具仅适用于 Qwen Code。

**立即开始**: `python3 duplex_debug.py <your-files>`