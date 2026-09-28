# 数字族谱 (Digital Family Genealogy) 项目状态

## 1. 当前阶段
- **阶段**：直连 PDF 文件生成与下载功能完成 (Real PDF Generation & Download Complete)
- **状态**：通过编译验证，应用正常运行 (Build Verified & Ready)

## 2. 核心架构与技术栈
- **前端技术栈**：React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **PDF 渲染引擎**：`jspdf` + `html2canvas` 高清渲染引擎（将宣纸风苏式/欧式版面直接渲染生成为 `.pdf` 真实文件并触发浏览器自动下载）
- **族谱可视化引擎**：自研 Canvas / SVG 关系图谱引擎（支持双向世系图、俯视图、分支折叠与展开、直系血脉路径动态高亮、多配偶/过继关系连线、手势拖拽缩放、一键寻祖定焦）
- **后端技术栈**：Node.js Express API + SQLite 持久化层
- **AI 族谱助手**：Gemini 2.5 Flash / GenAI SDK (基于真实图谱无幻觉回答，支持血缘称谓计算与口述历史整理)

## 3. 开发路线图 (MVP 计划)
- [x] Pre-Phase: 产品架构设计与技术方案制定
- [x] Phase 1: 项目架构与基础工程 + SQLite 数据库模型 + 基础页面框架与主题
- [x] Phase 2: 用户认证模拟 + 家族创建与多家族切换 + 基础权限体系
- [x] Phase 3: 家族成员档案管理 + 复杂家庭关系网络 (父子/母子/配偶/养继/字辈)
- [x] Phase 4: 核心族谱可视化引擎 (多代世系树、横纵向切换、缩放漫游、分支高亮、快速寻根)
- [x] Phase 5: 家族故事记忆库 + 家族相册 (与成员关联、时间轴展示)
- [x] Phase 6: 权限系统与隐私保护 (管理员/编辑/普通成员/访客 + 敏感信息保护)
- [x] Phase 7: AI 族谱助手 (关系称谓推导、生平传记润色、口述历史整理、基于事实严谨问答)
- [x] Phase 8: 族谱图谱分支折叠/展开与直系血脉高亮渲染
- [x] Phase 9: 集成 `jspdf` 与 `html2canvas` 实现真正的 `.pdf` 族谱文件生成与自动下载

## 4. 最近更新记录
- 安装并集成 `jspdf` 与 `html2canvas`
- 升级 `ExportGenealogyModal.tsx`，点击“下载宣纸风 .PDF 族谱”按钮时，自动把苏式/欧式宣纸排版捕获为高清 Canvas 并分页导出为真正的 `.pdf` 格式文件下载至用户本地设备
- 重新运行 `compile_applet` 编译测试，构建无误成功。
