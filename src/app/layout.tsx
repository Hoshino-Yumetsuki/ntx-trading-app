import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NTX Trading | 掌握机构操盘体系，提升你的交易能力",
  description: "掌握机构操盘体系，提升你的交易能力",
  icons: {
    icon: "/NTX-LOGO优化-7.png",
    shortcut: "/NTX-LOGO优化-7.png",
    apple: "/NTX-LOGO优化-7.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
  );
}