# 📚 WRead Notes

像刷小红书一样轻松愉快地浏览你的微信读书笔记，发现其中的精彩片段和独特见解。每一条笔记都像是一个精致的小红书帖子，充满了灵感和智慧。你可以随手点赞、评论或分享这些笔记，与志同道合的朋友一起交流阅读心得。这种便捷的浏览方式，让你随时都能沉浸在书的世界里，享受阅读带来的乐趣和收获。

## 特性

- **🔀 随机瀑布流** — 每次打开或点击"换一批"，从全部笔记中随机选取 50 条，像刷小红书一样发现旧笔记
- **🔒 本地存储** — 笔记数据和 API Key 存在浏览器 IndexedDB 中，不上传服务器，无需担心隐私
- **⚡ 一键同步** — 输入微信读书 API Key，服务端自动完成分页拉取 + 批量并发，浏览器只发 1 次请求
- **🎨 双样式卡片** — 划线用引用风格（左边框强调色），想法用气泡风格（彩色背景）

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16（App Router + Turbopack） |
| UI | React 19 + Tailwind CSS v4 |
| 存储 | IndexedDB（浏览器端） |
| 字体 | next/font（Geist + Geist Mono） |
| 语言 | TypeScript |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000

# 生产构建
npm run build
npm start
```

## 项目结构

```
├── app/
│   ├── api/sync/route.ts    # POST /api/sync — 服务端统一拉取笔记
│   ├── globals.css           # Tailwind + 全局样式
│   ├── layout.tsx            # 根布局（Server Component）
│   └── page.tsx              # 首页（Server Component，渲染 HomeClient）
├── components/
│   ├── HomeClient.tsx        # 核心客户端组件：状态管理 + 数据流
│   ├── NotesWall.tsx         # 瀑布流容器 + 骨架屏
│   ├── NoteCard.tsx          # 笔记卡片（划线/想法双样式）
│   ├── Header.tsx            # 顶部导航栏
│   └── ApiKeyModal.tsx       # API Key 输入弹窗
├── lib/
│   ├── weread.ts             # 微信读书 API 封装（网关调用、分页、批量）
│   └── db.ts                 # IndexedDB 读写封装
├── types/
│   └── index.ts              # TypeScript 类型定义
├── next.config.ts            # Next.js 配置（rewrites 代理、StrictMode）
└── package.json
```

## 使用说明

1. 打开页面，输入微信读书 API Key（格式：`wrk-xxxxxxxxxxxxxxxx`）
2. 点击「开始同步」，等待笔记拉取完成
3. 点击「换一批」随机切换展示的 50 条笔记
4. 点击「更换 Key」可切换账号，旧数据会被新数据覆盖

> **获取 API Key**：访问 [weread-skills](https://weread.qq.com/r/weread-skills) 获取你的专属 Key。Key 只存储在本地浏览器中。

## 隐私说明

- API Key 和所有笔记数据**仅存储在浏览器 IndexedDB 中**
- `/api/sync` 路由仅在同步时作为代理转发请求，**不存储任何数据**
- 清除浏览器数据或点击「更换 Key」会删除本地数据
