# Gmail 智能采集对接指南 (Gmail Integration Guide)

本指南介绍如何利用 **Cloudmailin** 作为桥梁，将您的 Gmail 邮件自动同步至 AI-BD Tracker 的待审收件箱。

## 第一阶段：配置 Cloudmailin 机器人

1.  **注册账号**: 访问 [Cloudmailin.com](https://www.cloudmailin.com/) 并注册。
2.  **创建收件地址**: 
    - 创建一个新地址 (Address).
    - 系统会分配给您一个唯一的邮箱，例如：`your_unique_id@cloudmailin.net`。
3.  **配置 Webhook 转发**:
    - 在 **"Target URL"** 中填入您的 Vercel 后端接口：
      `https://[您的Vercel项目名].vercel.app/api/v1/webhook/ingest`
    - **HTTP POST Format**: 务必选择 **"JSON"**。

## 第二阶段：配置 Gmail 自动转发

1.  **添加转发地址**:
    - 进入 Gmail 设置 -> **“转发和 POP/IMAP”** 标签。
    - 点击 **“添加转发地址”**，输入上一步获得的 `your_unique_id@cloudmailin.net`。
2.  **完成验证**:
    - Gmail 会发送一封验证邮件确认权限。
    - 此时回到 Cloudmailin 的 **"Recent Requests"** 面板，点击最新进来的那封邮件，找到其中的验证链接或验证码进行确认。
3.  **创建规则 (Filter)**:
    - 在 Gmail 搜索框输入 `to:me` 或某些特定关键词，点击右侧的搜索选项。
    - 点击 **“创建过滤器”**。
    - 勾选 **“转发给：[your_unique_id@cloudmailin.net]”**。

## 第三阶段：高效使用场景

### 1. 密送 (BCC) 自动建档
在您日常回复合作伙伴邮件时，在 **BCC (密送)** 栏中添加您的机器人邮箱。
- 优点：对方看不到机器人存在，但 AI 会同步收到邮件并提取纪要。
- AI 效果：系统会自动通过 `From` 字段识别出是您 (Owner) 发送的，并将提取出的项目/人脉暂存在您的收件箱。

### 2. 批量导入
您可以将过去累积的一系列会议纪要、微信截图转化的文字稿等，一次性转发给机器人邮箱。

---

### **⚠️关于数据安全**
*   发往机器人邮箱的邮件会被 AI 引擎实时解析。
*   除非您在 Smart Input 的 **"Review Inbox"** 中点击 "Confirm"，否则数据不会正式记录到主 Pipeline 中。
