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
      <body>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
