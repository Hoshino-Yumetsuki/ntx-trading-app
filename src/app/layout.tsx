import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NTX Trading | 掌握机构操盘体系，提升你的交易能力',
  description: '掌握机构操盘体系，提升你的交易能力'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
