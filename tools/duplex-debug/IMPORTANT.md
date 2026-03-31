# ⚠️ 重要提示

## 双工 Debug 系统使用说明

### 平台限制

**本工具仅适用于 Qwen Code**

❌ **不适用于**:
- Antigravity
- Claude Code
- 其他 AI 编程助手

### 原因

双工 Debug 系统深度集成了 Qwen Code 的专有特性：
1. Agent 系统调用接口
2. 工具链集成机制
3. 会话管理优化
4. 代码上下文理解

其他平台缺少必要的技术支持。

### 使用方法

```bash
# 进入工具目录
cd tools/duplex-debug

# 运行双工 Debug
python3 duplex_debug.py <文件路径>

# 示例
python3 duplex_debug.py backend/auth.py backend/main.py
```

### 替代方案

如果你使用其他平台，请使用：
- **Antigravity**: 内置 lint 工具
- **Claude Code**: Claude 代码分析功能
- **通用工具**: ESLint, Pylint, Black 等

### 更多信息

详细文档请查看：
- `README.md` - 主文档
- `DUPLEX_DEBUG_GUIDE.md` - 完整指南
- `DUPLEX_DEBUG_QUICKSTART.md` - 快速参考

---

**⚠️ 再次提醒**: 本工具仅适用于 Qwen Code。