# 数字族谱 (Digital Family Genealogy) 项目状态

## 1. 当前阶段
- **阶段**：真实微信静默登录与手机号授权组件重构完成 (Real WeChat Auth & Phone Component Live)
- **状态**：通过编译验证，应用正常运行 (Build Verified & Ready)

## 2. 核心架构与技术栈
- **前端技术栈**：React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **真实微信与手机号登录**：
  - **静默登录**：前端通过 `wx.login()` 获取 `code`，发给后端 `/api/wechat/login` 调用官方 `https://api.weixin.qq.com/sns/jscode2session` 接口换取真实 `openid` 并生成 JWT Token 保存至本地缓存（`wx.setStorageSync` / `localStorage`），后续 API 请求携带 `Authorization: Bearer <token>` 头部。
  - **手机号授权组件**：前端通过 `<button open-type="getPhoneNumber">` 响应事件获取 `e.detail.code`，发给后端 `/api/wechat/get-phone`。后端获取 `access_token` 后调用官方 `https://api.weixin.qq.com/wxa/business/getuserphonenumber` 接口换取真实 11 位手机号。
  - **异常防御**：严禁 Mock 假数据。当后端未配置 `WECHAT_APP_ID` 或 `WECHAT_APP_SECRET` 时，明确返回 HTTP 400 错误并在前端醒目位置提示配置方法。
- **全能 AI 助手**：升级 `aiGenealogy.ts` 底座，支持全能通用问答与深度家族图谱事实绑定双模切换。
- **后端技术栈**：Node.js Express API + 持久化层 + 微信官方 REST API 对接

## 3. 开发路线图 (MVP 计划)
- [x] Phase 1-14: 基础架构、世系树、多端协同、PDF 导出、AI 口述/拍照识谱、微信请柬与冲突核对
- [x] Phase 15: 升级真实微信静默登录 (wx.login) 与手机号组件授权 (getPhoneNumber)
- [x] Phase 16: 升级 Gemini AI 助手为全能通用知识问答与家族图谱专家双模融合体

## 4. 最近更新记录
- 彻底移除所有 Mock 假登录逻辑，替换为真实微信接口通信；
- 后端新增 `/api/wechat/login` 与 `/api/wechat/get-phone` 接口，严禁将 AppSecret 暴露在前端；
- `.env.example` 新增 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET` 配置项与微信公众平台白名单配置指引；
- 重新运行 `compile_applet` 编译测试，构建无误成功。
