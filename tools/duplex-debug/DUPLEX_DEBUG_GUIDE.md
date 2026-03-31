# 双工Debug (Duplex Debug) - 完整指南

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                    双工Debug系统                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ Qwen3 Agent  │              │  GLM5 Agent  │            │
│  │              │              │              │            │
│  │ • 安全分析    │◄────────────►│ • 边缘情况   │            │
│  │ • 逻辑检查    │   并行执行    │ • 集成验证   │            │
│  │ • 性能优化    │   实时讨论    │ • 用户体验   │            │
│  │ • 类型安全    │              │ • 可维护性   │            │
│  └──────────────┘              └──────────────┘            │
│         │                              │                    │
│         └──────────┬───────────────────┘                    │
│                    │                                        │
│                    ▼                                        │
│         ┌─────────────────────┐                            │
│         │   双工讨论引擎       │                            │
│         │                     │                            │
│         │ • 观点交换          │                            │
│         │ • 方案协商          │                            │
│         │ • 优先级对齐        │                            │
│         └─────────────────────┘                            │
│                    │                                        │
│                    ▼                                        │
│         ┌─────────────────────┐                            │
│         │   最终报告生成器     │                            │
│         │                     │                            │
│         │ • 问题汇总          │                            │
│         │ • 解决方案          │                            │
│         │ • 行动计划          │                            │
│         └─────────────────────┘                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Qwen3-Debugger Agent
**角色**: 主审查员

**专长**:
- 安全漏洞检测（SQL注入、XSS、认证绕过）
- 逻辑错误识别（死锁、竞态条件、无限循环）
- 性能问题分析（N+1查询、内存泄漏）
- 类型安全验证（类型不匹配、空指针）

**工作方式**:
```python
Qwen3: "发现 Critical Security 问题 - JWT token未验证签名"
       "位置: backend/auth.py:45"
       "建议: 必须验证JWT签名和过期时间"
       "置信度: 95%"
```

### 2. GLM5-Debugger Agent
**角色**: 交叉验证专家

**专长**:
- 边缘情况发现（空值、边界条件、异常输入）
- 集成问题检测（API契约、数据流、状态同步）
- 用户体验分析（错误提示、加载状态、可访问性）
- 可维护性评估（代码复杂度、文档完整性）

**工作方式**:
```python
GLM5: "从用户角度看，这可能导致问题..."
      "我还发现一个边缘情况：如果token在请求期间过期会怎样？"
      "建议: 添加token刷新逻辑"
```

### 3. 双工讨论引擎
**功能**:
- 促进agents之间的实时对话
- 管理不同意见的协商
- 确保最终达成共识

**讨论流程**:
```
1. Qwen3提出问题 → 2. GLM5验证 → 3. 双方讨论 → 4. 达成共识
```

## 使用场景

### 场景1: 新功能开发后审查
```bash
# 审查新添加的认证功能
python3 duplex_debug.py backend/auth.py backend/main.py

# 输出:
# Qwen3: 发现JWT验证问题
# GLM5: 发现token过期处理缺失
# 共识: 两个问题都需要立即修复
```

### 场景2: 代码重构后验证
```bash
# 审查重构后的API端点
python3 duplex_debug.py backend/routes/*.py

# 输出:
# Qwen3: 性能优化建议
# GLM5: API契约一致性检查
# 共识: 建议采纳，优先级中等
```

### 场景3: 安全审计
```bash
# 全面安全审查
python3 duplex_debug.py backend/*.py

# 输出:
# Qwen3: 发现3个安全漏洞
# GLM5: 验证漏洞影响范围
# 共识: 立即修复所有Critical级别问题
```

## 输出报告结构

### 1. 执行摘要
- 审查文件数量
- 发现问题总数
- 严重程度分布

### 2. 详细发现
按严重程度分类的问题列表：
- Critical: 必须立即修复
- High: 24小时内修复
- Medium: 下个迭代修复
- Low: 未来改进

### 3. 双工讨论摘要
- Qwen3的主要发现
- GLM5的补充发现
- 双方达成共识的问题
- 存在分歧的问题（如有）

### 4. 代码质量评分
- 安全性: 0-10分
- 可靠性: 0-10分
- 集成性: 0-10分
- 用户体验: 0-10分

### 5. 行动计划
- 立即行动项
- 短期改进项
- 长期优化项

## 最佳实践

### 1. 审查时机
- ✅ 完成新功能开发后
- ✅ 代码重构后
- ✅ 提交Pull Request前
- ✅ 定期安全审计

### 2. 文件选择
- 优先审查核心业务逻辑
- 重点关注安全相关代码
- 不要忽视配置文件
- 包含测试文件

### 3. 结果处理
- Critical问题必须修复才能合并
- High问题应在当天修复
- Medium问题加入backlog
- Low问题作为技术债务跟踪

### 4. 持续改进
- 定期更新agent配置
- 添加新发现的模式到检查列表
- 记录误报以优化检测精度

## 配置选项

### 环境变量
```bash
# 启用/禁用双工Debug
export DEBUG_AGENTS_ENABLED=true

# 设置agent模型
export QWEN3_MODEL=qwen3-plus
export GLM5_MODEL=glm-5

# 设置超时时间（秒）
export REVIEW_TIMEOUT=600

# 设置并行度
export MAX_PARALLEL_AGENTS=2
```

### 自定义检查规则
在`.agent/qwen3-debugger.md`和`.agent/glm5-debugger.md`中添加：
```markdown
## Custom Checks
- [ ] 检查项目特定的业务规则
- [ ] 验证自定义的安全要求
- [ ] 确保符合团队编码规范
```

## 故障排除

### 问题1: Agent没有发现问题
**可能原因**:
- 文件类型不支持
- 代码确实没有问题
- 检查规则需要更新

**解决方案**:
```bash
# 检查支持的文件类型
python3 duplex_debug.py --help

# 更新检查规则
# 编辑 .agent/qwen3-debugger.md
```

### 问题2: 误报过多
**可能原因**:
- 检查规则过于严格
- 代码模式特殊

**解决方案**:
- 调整confidence阈值
- 添加例外规则
- 更新agent配置

### 问题3: Agents意见不一致
**处理方式**:
1. 查看详细讨论记录
2. 评估两种观点的合理性
3. 根据项目实际情况决定
4. 记录决策理由

## 扩展开发

### 添加新的检查规则
```python
# 在 duplex_debug.py 中添加
def _check_custom_issue(self, file_path, content, analyzer):
    issues = []
    # 添加自定义检查逻辑
    if 'custom_pattern' in content:
        issues.append(Issue(
            agent=self.name,
            severity=Severity.MEDIUM,
            category="Custom",
            file=file_path,
            message="Custom issue detected",
            recommendation="Fix according to project standards"
        ))
    return issues
```

### 集成到CI/CD
```yaml
# .github/workflows/duplex-debug.yml
name: 双工Debug审查
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: 运行双工Debug
        run: python3 duplex_debug.py backend/*.py
      - name: 检查结果
        run: |
          if grep -q "CRITICAL" duplex_debug_report_*.md; then
            echo "发现Critical问题，请修复后再合并。"
            exit 1
          fi
```

## 总结

双工Debug系统通过并行分析和实时讨论，提供了比单一agent更全面、更可靠的代码审查。Qwen3专注于安全和逻辑，GLM5专注于边缘情况和用户体验，两者互补，确保问题不被遗漏。

**核心优势**:
1. 并行分析提高效率
2. 交叉验证提高准确性
3. 实时讨论达成共识
4. 详细报告便于行动

**适用场景**:
- 新功能开发审查
- 代码重构验证
- 安全审计
- 质量保证

立即开始使用：
```bash
python3 duplex_debug.py <your-files>
```