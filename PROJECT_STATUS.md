# 数字族谱 (Digital Family Genealogy) 项目状态

## 1. 当前阶段
- **阶段**：微信众包请柬、智能差异核对弹窗与宣纸卷轴 PDF 导出完成 (WeChat Group Invites, Conflict Resolution & Scroll PDF Live)
- **状态**：通过编译验证，应用正常运行 (Build Verified & Ready)

## 2. 核心架构与技术栈
- **前端技术栈**：React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **微信众包请柬**：`InviteModal.tsx` 支持一键生成微信家族群专属请柬与二维码，各房宗亲点开即可分布式填报补充本房档案
- **智能冲突差异核对**：`ConflictResolveModal.tsx` 针对 AI 口述与照片识别出的重复人名提供可视化属性对比（系统原记录 vs AI 提取），支持保留原档案、采用新提取或智能互补融合
- **宣纸卷轴风 PDF 导出**：`ExportGenealogyModal.tsx` + `jspdf` + `html2canvas`，带朱红堂号印章与万代千秋古印，支持全景五代一图苏式与垂下式欧式高保真 PDF 下载
- **多分支智能归档**：后端 `api.ts` 支持 `parentName` / `spouseName` 自动匹配与去重合并，无论上传照片还是口述资料，只要提及已有先祖/长辈姓名，自动拼接到已有世系大树上并自动排布 SVG 连线
- **照片上传与多模态 OCR**：`/api/upload` 图片上传与 `/api/ai/parse-photo` 多模态识别接口，支持拍照/选取本地老照片、碑文或族谱相片直接通过 Gemini 2.5 Flash 视觉识别自动提炼宗亲信息
- **AI 免打字建谱**：`AIBatchEntryModal` + Gemini 2.5 Flash 智能提取，支持将微信聊天文本、口述段落、老族谱照片文字自动解析为多位宗亲节点与世系关系并一键写入数据库
- **纪念日引擎**：`FamilyMemorialSection` 自动遍历与计算全家族成员出生与逝世日期，精确推演下一次吉日/祭日倒计时天数与周岁/周年
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
- [x] Phase 10: 首页新增「家族纪念日」板块，自动推算临近生日寿诞与先祖忌日，并支持一键互动寄意
- [x] Phase 11: 解决手动录入繁琐痛点，新增「✨ AI 口述一键免打字建谱」后端提取与前端一键解析入谱
- [x] Phase 12: 增加 `/api/upload` 图片上传与 `/api/ai/parse-photo` 老照片/老族谱拍照多模态 OCR 视觉建谱功能
- [x] Phase 13: 多分支数据智能自动匹配关联、自动去重合并与可视化树图自动排布
- [x] Phase 14: 微信众包修谱请柬卡片生成 + 智能冲突差异对比弹窗 + 宣纸双印章高保真卷轴 PDF 导出

## 4. 最近更新记录
- 升级 `InviteModal.tsx`：支持微信家族群专属请柬卡片预览、分房/全族请柬生成与二维码展示
- 新增 `ConflictResolveModal.tsx`：当 AI 口述/照片提取产生同名碰撞时，提供原记录与 AI 提取数据的左右卡片差异对比，支持智能互补融合
- 升级 `ExportGenealogyModal.tsx`：增加双朱红古印（堂号章与万代千秋印）、线装书双重边框与高保真 PDF 渲染下载
- 重新运行 `compile_applet` 编译测试，构建无误成功。
