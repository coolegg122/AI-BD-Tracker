# Gemini API Available Models & Capabilities Reference

> 数据更新于: 2026-04-02 | 来源: Google AI Studio Direct Query & User Provided Rate Limits

---

## 🚀 核心模型系列与速率限制 (Paid Tier 1)

以下为付费账号 (Tier 1) 的速率限制参考。其中 **RPM** (每分钟请求数), **TPM** (每分钟 Token 数), **RPD** (每天请求数)。

### 旗舰与高频模型

| 模型 ID | 上下文 | RPM | TPM | RPD | 核心能力 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`gemini-3.1-pro-preview`** | 2M+ | 25 | 2M | 250 | **最强推理**，支持长上下文分析。 |
| **`gemini-3-flash-preview`** | 1M | 1,000 | 2M | 10,000 | **当前使用**，极速且高并发支持。 |
| **`gemini-3.1-flash-lite-preview`**| 1M | 4,000 | 4M | 150,000 | **极致吞吐**，适合大规模低功耗任务。 |
| **`gemini-2.5-flash`** | 1M | 1,000 | 1M | 10,000 | 2.5 世代稳定版本。 |
| **`gemini-2.0-flash`** | 1M | 2,000 | 4M | 无限制 | 2.0 世代高性能版本。 |
| **`gemini-2.5-pro`** | 1M | 150 | 2M | 1,000 | 2.5 世代高推理版本。 |

---

## 🎨 多模态与多功能模型速率

| 模型类型 | 模型 ID | RPM | TPM | RPD |
| :--- | :--- | :--- | :--- | :--- |
| **语音生成 (TTS)** | `gemini-2.5-flash-tts` | 10 | 10K | 100 |
| **图像生成** | `imagen-4-generate` | 10 | - | 70 |
| **视频生成** | `veo-3-generate` | 2 | - | 10 |
| **实时交互 (Live)** | `gemini-3-flash-live` | 无限制 | 150K | 无限制 |
| **代理 (Agent)** | `deep-research-pro-preview` | 1 | 500K | 1,440 |
| **计算机操作** | `computer-use-preview` | 150 | 2M | 10,000 |

---

## 🧩 开源与嵌入模型速率

| 模型 ID | RPM | TPM | RPD |
| :--- | :--- | :--- | :--- |
| **`gemma-3-27b-it`** | 30 | 15K | 14.4K |
| **`gemma-3-12b-it`** | 30 | 15K | 14.4K |
| **`gemini-embedding-2`** | 3,000 | 1M | 无限制 |

---

## 🛠️ 地接 (Grounding) 与搜索速率限制

| 工具类型 | 支持模型 | 限制 (RPD) |
| :--- | :--- | :--- |
| **Google Search Grounding** | Gemini 2.5 / 3 | 1,500 - 5,000 |
| **Google Maps Grounding** | 全系列 | 无限制 |

---

## 📝 开发者备注：如何根据速率选择模型？

1.  **高并发提取 (BD 系统核心)**: 选用 `gemini-3-flash-preview`。1,000 RPM 的频率足以支持全量邮件同步和实时分析。
2.  **长文/复杂研报分析**: 选用 `gemini-3.1-pro-preview`。虽然 RPM 只有 25，但 2M 的上下文窗口和极强的推理能力是关键。
3.  **实时对话/录音同步**: 选用 `gemini-3-flash-live`，其 RPM 无限制，适合处理不间断的语音流。
4.  **大规模清洗**: 如果需要对百万级历史记录进行预处理，`gemini-3.1-flash-lite-preview` 是唯一的选择（15万次/天）。
