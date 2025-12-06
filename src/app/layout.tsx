import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import 'katex/dist/katex.min.css'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const alibabaPuHuiTi = localFont({
  src: [
    {
      path: '../../public/fonts/AlibabaPuHuiTi-3-45-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AlibabaPuHuiTi-3-65-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/AlibabaPuHuiTi-3-85-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-alibaba',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'NTX Trading | 掌握机构操盘体系，提升你的交易能力',
  description: '掌握机构操盘体系，提升你的交易能力',
  icons: {
    icon: '/ntx-logo.png',
    shortcut: '/ntx-logo.png',
    apple: '/ntx-logo.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={alibabaPuHuiTi.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <div className="relative mx-auto flex min-h-screen w-full flex-col bg-[#F0F8FF] md:max-w-md md:shadow-2xl md:border-gray-800">
            {children}
          </div>
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
