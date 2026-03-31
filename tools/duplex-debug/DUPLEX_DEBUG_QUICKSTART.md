# 双工Debug (Duplex Debug) - 快速参考

## 一行命令

```bash
python3 duplex_debug.py <文件路径>
```

## 工作流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  并行分析   │ →  │  实时讨论   │ →  │  达成共识   │ →  │  生成报告   │
│ Qwen3+GLM5 │    │ 互相验证    │    │ 方案协商    │    │ 行动计划    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Agents 分工

| Agent | 角色 | 专注领域 |
|-------|------|----------|
| **Qwen3** | 主审查员 | 安全、逻辑、性能、类型安全 |
| **GLM5** | 交叉验证 | 边缘情况、集成、用户体验 |

## 严重程度

| 级别 | 含义 | 修复时限 |
|------|------|----------|
| **Critical** | 安全漏洞、数据丢失、认证绕过 | 立即修复 |
| **High** | 功能损坏、重大性能问题 | 24小时内 |
| **Medium** | UX问题、代码质量、小bug | 下个迭代 |
| **Low** | 样式问题、优化机会 | 未来改进 |

## 检测能力

### Qwen3 检测
- ✅ 密码未哈希
- ✅ JWT验证缺失
- ✅ SQL注入风险
- ✅ API缺少认证
- ✅ N+1查询
- ✅ 类型安全问题

### GLM5 检测
- ✅ 邮箱验证缺失
- ✅ localStorage空值检查
- ✅ Token过期处理
- ✅ 空状态UI
- ✅ 异步错误处理
- ✅ 边缘情况

## 示例

### 审查单个文件
```bash
python3 duplex_debug.py backend/auth.py
```

### 审查多个文件
```bash
python3 duplex_debug.py backend/auth.py backend/main.py
```

### 审查整个目录
```bash
python3 duplex_debug.py backend/*.py
```

## 输出报告

```
======================================================================
双工Debug (Duplex Debug) - 最终报告
======================================================================

审查时间: 2026-03-31T22:55:02
审查文件: 2
发现问题: 4

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

## 讨论示例

```
Qwen3: 发现 Critical Security 问题 - JWT token未验证签名
       建议：必须验证JWT签名和过期时间

GLM5: 从用户角度看，这可能导致数据泄露。
      我同意严重程度评估。
      另外，我注意到缺少token过期处理。

Qwen3: 好发现。让我加入修复计划。

共识：双方同意这是Critical级别问题。
      修复计划：启用签名验证 + 检查过期时间
```

## 最佳实践

### ✅ 何时使用
- 完成新功能开发后
- 代码重构后
- 提交Pull Request前
- 定期安全审计

### 📁 审查重点
- 核心业务逻辑
- 安全相关代码
- 认证/授权模块
- API端点

### 📊 结果处理
- Critical → 必须修复才能合并
- High → 当天修复
- Medium → 加入backlog
- Low → 技术债务跟踪

## 配置文件

| 文件 | 说明 |
|------|------|
| `.agent/qwen3-debugger.md` | Qwen3配置 |
| `.agent/glm5-debugger.md` | GLM5配置 |
| `.agent/workflows/duplex-debug.md` | 工作流程 |
| `DUPLEX_DEBUG_GUIDE.md` | 完整指南 |
| `DUPLEX_DEBUG_EXAMPLES.md` | 讨论示例 |

## 常见问题

**Q: 支持哪些文件类型？**
A: `.py`, `.js`, `.jsx`, `.ts`, `.tsx`

**Q: 如何自定义检查规则？**
A: 编辑 `.agent/qwen3-debugger.md` 和 `.agent/glm5-debugger.md`

**Q: 如何集成到CI/CD？**
A: 在CI脚本中添加 `python3 duplex_debug.py backend/*.py`

**Q: 报告保存在哪里？**
A: `duplex_debug_report_YYYYMMDD_HHMMSS.md`

## 快速故障排除

| 问题 | 解决方案 |
|------|----------|
| 没有发现问题 | 检查文件类型是否支持 |
| 误报过多 | 调整confidence阈值 |
| Agents意见不一致 | 查看详细讨论记录 |

## 更多信息

- 完整指南：`DUPLEX_DEBUG_GUIDE.md`
- 讨论示例：`DUPLEX_DEBUG_EXAMPLES.md`
- 工作流程：`.agent/workflows/duplex-debug.md`

---

**立即开始**: `python3 duplex_debug.py <your-files>`