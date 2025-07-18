ntx-trading-app/
├── app/  
Next.js 使用 `app` 目录下的文件和文件夹结构来定义路由。例如，`app/page.tsx` 就是应用的根路径 
│   ├── layout.tsx           # 根布局文件，定义了整个应用的HTML结构和全局样式导入
│   ├── page.tsx             # 应用的入口页面（首页），负责渲染SplashScreen和MainApp
│   ├── globals.css          # 全局CSS文件，包含Tailwind CSS的基础样式和所有自定义的UI样式（如.diffused-bg, .glass-card, .premium-icon等）
│   └── api/                 # API路由目录 (如果需要后端API)
├── components/              # 存放所有可复用的React UI组件
│   ├── splash-screen.tsx    # 应用启动时的闪屏界面
│   ├── main-app.tsx         # 应用的主容器，负责管理底部导航和页面切换
│   ├── home-page.tsx        # 主页内容
│   ├── mining-page.tsx      # 挖矿中心页面内容
│   ├── academy-page.tsx     # 黑马学院页面内容
│   ├── profile-page.tsx     # 用户个人资料页面内容
│   ├── news-page.tsx        # 新闻中心页面内容
│   ├── signal-carousel.tsx  # 首页的信号策略轮播组件
│   ├── recent-notifications.tsx # 首页底部的最近公告组件
│   └── ui/                  # shadcn/ui 组件的导入和导出目录 (我们不修改这些文件，只导入使用)
│       ├── button.tsx
│       ├── card.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       └── ... (其他shadcn/ui组件)
├── hooks/                   # 存放自定义React Hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                     # 存放工具函数和类型定义
│   └── utils.ts             # 包含cn函数等实用工具
├── public/                  # 存放静态资源 (如图片)
│   └── placeholder.svg      # 占位符图片
├── tailwind.config.ts       # Tailwind CSS 配置文件
├── next.config.mjs          # Next.js 配置文件
├── package.json             # 项目依赖和脚本
└── tsconfig.json            # TypeScript 配置文件

启动：
# 全局安装pnpm
npm install -g pnpm
pnpm install
pnpm dev  # 或 npm run dev