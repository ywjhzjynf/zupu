# 数字族谱 (Digital Family Genealogy) 项目状态

## 1. 当前阶段
- **阶段**：全能 AI 助手与手机号/微信一键快捷登录集成完成 (All-Capable AI & Phone/WeChat Login Live)
- **状态**：通过编译验证，应用正常运行 (Build Verified & Ready)

## 2. 核心架构与技术栈
- **前端技术栈**：React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **手机号与微信登录**：新增 `PhoneLoginModal.tsx`，支持 11 位手机号加短信验证码快捷登录/注册，以及微信扫一扫/一键授权登录模拟；顶部导航栏新增“手机/微信登录”快捷入口。
- **全能 AI 助手**：升级 `aiGenealogy.ts` 底座（基于官方 `gemini-3.8-flash` 模型），支持全能通用问答（诗词、文案、日常对话、逻辑推理、知识问答）与深度家族图谱事实绑定双模切换，当问及先祖生平、亲属称谓或字辈家训时自动匹配真实族谱档案。
- **微信众包请柬**：`InviteModal.tsx` 支持一键生成微信家族群专属请柬与二维码。
- **智能冲突差异核对**：`ConflictResolveModal.tsx` 针对 AI 口述与照片识别出的重复人名提供可视化属性对比，支持智能互补融合。
- **宣纸卷轴风 PDF 导出**：`ExportGenealogyModal.tsx` 增加双朱红古印与线装书双重边框。
- **后端技术栈**：Node.js Express API + SQLite 持久化层

## 3. 开发路线图 (MVP 计划)
- [x] Phase 1-14: 基础架构、世系树、多端协同、PDF 导出、AI 口述/拍照识谱、微信请柬与冲突核对
- [x] Phase 15: 集成手机号短信验证码与微信授权登录中心
- [x] Phase 16: 升级 Gemini AI 助手为全能通用知识问答与家族图谱专家双模融合体

## 4. 最近更新记录
- 新增 `PhoneLoginModal.tsx`：支持手机号验证码登录及微信授权登录；
- 升级 `Header.tsx` 与 `App.tsx`：顶部增加一键登录入口；
- 升级 `aiGenealogy.ts`：扩充为支持全能通用问答与中华族谱专精的双核 AI 助手。
- 重新运行 `compile_applet` 编译测试，构建无误成功。
