# 项目结构与文件摆放规范 (SOP)

> **版本**: v0.1.0  
> **生效日期**: 2026-04-02  
> **适用范围**: 所有 AI 助手和开发人员

---

## 📁 目录结构规范

### 根目录规则

**根目录只保留以下文件:**
- 配置文件 (`.env.example`, `.gitignore`, `package.json`, `vercel.json` 等)
- 核心说明文档 (`README.md`)
- 数据库脚本 (`requirements.txt`, `supabase_init.sql`)

**禁止在根目录放置:**
- 临时文档
- 测试脚本
- 分析报告
- 开发日志

### docs/ 目录规范

```
docs/
├── guides/          # 开发指南 (操作手册类)
│   ├── production-guide.md
│   ├── vercel-deployment.md
│   ├── sync-sop.md
│   ├── gmail-setup.md
│   └── dev-log.md
│
├── reports/         # 分析报告 (审查/验证类)
│   ├── code-structure-analysis.md
│   ├── code-fix-verification.md
│   ├── fullstack-comparison.md
│   └── v0.1.0-verification.md
│
└── archive/         # 归档文档 (废弃/MVP/历史)
    └── mvp-html-program.md
```

**分类规则:**
- `guides/` - 如何做什么的指南 (How-to)
- `reports/` - 分析、审查、验证报告
- `archive/` - 不再使用但有参考价值的文档

### scripts/ 目录规范

```
scripts/
├── test/            # 测试脚本
│   ├── test_gemini.py
│   ├── test_registration.py
│   ├── test_vercel.py
│   └── verify_enrichment.py
│
├── migrate/         # 数据库迁移脚本
│   └── ...
│
└── utils/           # 工具脚本
    └── ...
```

**分类规则:**
- `test/` - 所有测试相关脚本
- `migrate/` - 数据库迁移脚本
- `utils/` - 其他工具脚本

### tools/ 目录规范

```
tools/
├── duplex-debug/    # 双工调试工具
│   └── ...
│
└── utils/           # 其他工具
    └── backend_code_reference.py
```

---

## 📝 文档命名规范

### 文件名格式

**使用小写 + 连字符:**
- ✅ `production-guide.md`
- ✅ `code-structure-analysis.md`
- ❌ `Production Guide.md`
- ❌ `CodeStructureAnalysis.md`

### 版本号规范

**在文档内部使用版本标记，文件名不含版本:**
```markdown
# 文档标题
> **版本**: v0.1.0
> **更新日期**: 2026-04-02
```

---

## 🔧 AI 协作规范

### 开始工作前

1. **读取本规范** - 确保了解文件摆放规则
2. **检查当前结构** - `ls -la` 查看根目录
3. **读取 README.md** - 了解项目最新状态

### 创建新文件时

1. **选择正确目录** - 根据文件类型选择 docs/scripts/tools
2. **使用正确命名** - 小写 + 连字符
3. **更新文档索引** - 在 README.md 中添加链接

### 修改现有文件时

1. **不要移动文件** - 除非明确需要重新分类
2. **保持向后兼容** - 如有链接更新 README
3. **记录变更** - 在 `dev-log.md` 中记录重大修改

### 完成任务后

1. **清理临时文件** - 不在根目录留下任何临时文件
2. **验证结构** - 确保根目录整洁
3. **更新文档** - 如修改了结构，更新本 SOP

---

## 🚨 代码检查清单

### 目录更改后的检查

**本次整理已验证 (2026-04-02):**

```bash
# ✅ 已搜索硬编码路径引用
grep -r "VERCEL_DEPLOYMENT|SYNC_SOP|production-guide|gmail-setup|dev_log"
grep -r "test_gemini|test_registration|test_vercel|verify_enrichment"
grep -r "backend_code_reference"
```

**验证结果:**
- 所有引用都在文档中 (`.md` 文件)
- 代码文件 (`.py`, `.js`, `.jsx`) 中没有硬编码文档路径
- README.md 中的链接已更新为正确路径

**需要检查的地方:**
- 所有文档链接是否更新
- 所有路径引用是否正确

---

## 📦 标准文件分类表

| 文件类型 | 应放置目录 | 示例 |
|----------|------------|------|
| 开发指南 | `docs/guides/` | `production-guide.md` |
| 部署文档 | `docs/guides/` | `vercel-deployment.md` |
| 操作程序 | `docs/guides/` | `sync-sop.md` |
| 设置指南 | `docs/guides/` | `gmail-setup.md` |
| 开发日志 | `docs/guides/` | `dev-log.md` |
| 代码分析 | `docs/reports/` | `code-structure-analysis.md` |
| 修复验证 | `docs/reports/` | `code-fix-verification.md` |
| 功能对比 | `docs/reports/` | `fullstack-comparison.md` |
| 版本验证 | `docs/reports/` | `v0.1.0-verification.md` |
| 测试脚本 | `scripts/test/` | `test_gemini.py` |
| 迁移脚本 | `scripts/migrate/` | `migrate_*.py` |
| 工具脚本 | `scripts/` 或 `tools/` | `create_admin_user.py` |
| 调试工具 | `tools/` | `duplex-debug/` |
| 参考代码 | `tools/` | `backend_code_reference.py` |
| 归档文档 | `docs/archive/` | `mvp-html-program.md` |

---

## 🔄 文件移动操作流程

当需要将文件移动到新位置时：

1. **创建目标目录** (如需要)
   ```bash
   mkdir -p docs/new-category
   ```

2. **移动文件**
   ```bash
   mv old-location/file.md docs/new-category/file.md
   ```

3. **更新引用**
   - 搜索所有引用该文件的地方
   - 更新路径

4. **更新索引**
   - 更新 README.md 中的文档索引
   - 更新本 SOP 中的分类表 (如需要)

5. **验证**
   - 运行 `ls -la` 确认根目录整洁
   - 运行 `git status` 查看变更

---

## ⚠️ 注意事项

1. **不要删除历史文档** - 移动到 archive/
2. **不要混合中英文命名** - 统一使用英文文件名
3. **不要忽略更新索引** - 每次移动后更新 README
4. **不要硬编码相对路径** - 使用适当的导入/引用方式

---

## 📋 快速参考

**根目录整洁检查:**
```bash
# 应该只看到
ls -la
# .env.example  .gitignore  package.json  vercel.json
# README.md     requirements.txt  supabase_init.sql
# backend/  ai-bd-tracker/  api/  docs/  scripts/  tools/
```

**文档位置查询:**
- 指南 → `docs/guides/`
- 报告 → `docs/reports/`
- 测试 → `scripts/test/`
- 工具 → `tools/`
- 归档 → `docs/archive/`

---

> **重要**: 所有 AI 助手在工作时必须遵守本规范，确保项目结构的一致性和可维护性。