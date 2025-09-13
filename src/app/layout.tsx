import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'NTX Trading | 掌握机构操盘体系，提升你的交易能力',
  description: '掌握机构操盘体系，提升你的交易能力',
  icons: {
    icon: '/NTX-LOGO优化-7.png',
    shortcut: '/NTX-LOGO优化-7.png',
    apple: '/NTX-LOGO优化-7.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning>
        {/* --- 新增的“手机画框”容器 --- */}
        <div
          className="
          relative              /* 设定为相对定位，作为内部元素的定位参考 */
          mx-auto               /* 关键：水平居中 */
          flex                  /* 使用 flex 布局 */
          h-screen              /* 高度占满整个屏幕 */
          w-full                /* 在手机上宽度占满 */
          flex-col              /* 内部元素垂直排列 */
          bg-[#F0F8FF]          /* 画框本身的背景色 */
          md:max-w-md           /* 关键：在 md 断点(768px)及以上，最大宽度设为 md (448px) */
          md:shadow-2xl         /* 在 md 断点及以上，添加阴影以产生立体感 */
          md:border-gray-800
        "
        >
          {children}
        </div>
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
