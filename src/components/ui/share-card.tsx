"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import MarkdownIt from "markdown-it";
import multimdTable from "markdown-it-multimd-table";
import Image from "next/image";
import { QRCodeCanvas } from "@/src/components/ui/qr-code-canvas";

interface ShareCardProps {
  title: string;
  content: string;
  summary: string;
  publishDate: string;
  qrCodeDataUrl?: string;
  source?: string;
}

// 使用 forwardRef 包装组件，使其可以接收 ref
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ title, content, qrCodeDataUrl }, ref) => {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    }).use(multimdTable, {
      multiline: true,
      rowspan: true,
      headerless: true,
    });

    const titleContainerRef = useRef<HTMLDivElement>(null);
    const [titleHeight, setTitleHeight] = useState(0);

    useEffect(() => {
      const measureTitle = () => {
        if (titleContainerRef.current) {
          setTitleHeight(titleContainerRef.current.offsetHeight);
        }
      };
      measureTitle();
      window.addEventListener("resize", measureTitle);
      return () => window.removeEventListener("resize", measureTitle);
    }, [title]);

    const contentWrapperRef = useRef<HTMLDivElement>(null);
    const contentInnerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [contentFontSize, setContentFontSize] = useState(18);
    const BASE_HEIGHT = 1068;
    const TOP_SLICE = Math.floor(BASE_HEIGHT / 2);
    const BOTTOM_SLICE = BASE_HEIGHT - TOP_SLICE;
    const [cardHeight, setCardHeight] = useState(BASE_HEIGHT);

    useEffect(() => {
      const fitContent = () => {
        const wrapper = contentWrapperRef.current;
        const inner = contentInnerRef.current as HTMLDivElement | null;
        const footer = footerRef.current;
        if (!wrapper || !inner || !footer) return;

        const available = footer.offsetTop - wrapper.offsetTop - 8;
        let font = 20;
        inner.style.fontSize = `${font}px`;
        inner.style.lineHeight = "1.9";
        let guard = 0;
        while (inner.scrollHeight > available && font > 16 && guard < 24) {
          font -= 1;
          inner.style.fontSize = `${font}px`;
          guard++;
        }
        setContentFontSize(font);

        const overflow = Math.max(0, inner.scrollHeight - available);
        setCardHeight(BASE_HEIGHT + overflow);
      };

      const id = window.requestAnimationFrame(fitContent);
      window.addEventListener("resize", fitContent);
      return () => {
        window.cancelAnimationFrame(id);
        window.removeEventListener("resize", fitContent);
      };
    }, [content]);

    const renderMarkdown = (text: string) => {
      const withoutMdImages = text.replace(/!\[[^\]]*\]\([^)]*\)/g, "");
      const html = md.render(withoutMdImages);
      const withoutHtmlImages = html.replace(/<img[^>]*>/gi, "");
      return { __html: withoutHtmlImages };
    };

    const qrPlaceholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'>
  <rect width='100%' height='100%' fill='#ffffff'/>
  <rect x='8' y='8' width='134' height='134' rx='12' ry='12' fill='none' stroke='#E2E8F0' stroke-width='2'/>
  <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94A3B8' font-family='system-ui, sans-serif' font-size='14'>QR Code</text>
</svg>`;
    const qrSrc =
      qrCodeDataUrl && qrCodeDataUrl.trim() !== ""
        ? qrCodeDataUrl
        : `data:image/svg+xml;utf8,${encodeURIComponent(qrPlaceholderSvg)}`;

    const formatDateYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}年${m}月${day}日`;
    };
    const todayLabel = formatDateYMD(new Date());

    return (
      <div
        ref={ref} // 将 ref 附加到根元素
        className="relative overflow-hidden"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          width: "600px",
          height: `${cardHeight}px`,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
        }}
      >
        {/* 背景切片 */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-0"
          style={{
            height: `${TOP_SLICE}px`,
            backgroundImage: "url(/Frame35.png)",
            backgroundSize: "600px 1068px",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-0"
          style={{
            height: `${BOTTOM_SLICE}px`,
            backgroundImage: "url(/Frame35.png)",
            backgroundSize: "600px 1068px",
            backgroundPosition: "bottom center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          aria-hidden
          className="absolute left-0 right-0 z-0"
          style={{
            top: `${TOP_SLICE}px`,
            bottom: `${BOTTOM_SLICE}px`,
            background: "#fefefe",
          }}
        />
        {/* Header */}
        <div className="absolute top-6 left-6 pointer-events-none select-none z-10">
          <Image
            src="/Frame17@3x.png"
            alt="NTX Logo"
            width={200}
            height={200}
            priority
            loading="eager"
          />
          <style jsx>{`
            .content :global(p) {
              margin: 0 0 1em 0;
              text-indent: 0;
            }
            .content :global(ul),
            .content :global(ol) {
              margin: 0 0 1em 1.25em;
            }
            .content :global(table) {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1em;
            }
            .content :global(th),
            .content :global(td) {
              border: 1px solid #e2e8f0;
              padding: 8px;
              text-align: left;
            }
            .content :global(th) {
              background-color: #f8fafc;
              font-weight: bold;
            }
          `}</style>
        </div>

        <div
          ref={titleContainerRef}
          className="absolute left-0 right-0 z-20 pointer-events-none overflow-visible px-8"
          style={{ top: "96px" }}
        >
          <h1 className="text-left whitespace-normal break-words text-[32px] font-extrabold text-slate-900 leading-snug">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div
          ref={contentWrapperRef}
          className="relative z-10 px-8 pb-[220px]"
          style={{ marginTop: Math.max(160, titleHeight + 120) }}
        >
          <div className="content text-slate-700">
            <div
              ref={contentInnerRef}
              dangerouslySetInnerHTML={renderMarkdown(content)}
              style={{
                fontSize: contentFontSize,
                lineHeight: "1.9",
              }}
            />
          </div>
        </div>

        {/* Bottom overlay */}
        <div
          ref={footerRef}
          className="absolute left-8 right-8 bottom-12 flex items-center justify-between"
        >
          <div className="text-left w-[280px] flex flex-col justify-center h-[170px]">
            <div className="flex justify-between text-[#1C55FF] font-bold text-[32px] leading-tight">
              <span>连接用户 聚合资源</span>
            </div>
            <div className="text-gray-600 text-[20px] mt-2 leading-tight w-full">
              挖掘你的 Web3 机会
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-sm">
              {qrCodeDataUrl && qrCodeDataUrl.trim() !== "" ? (
                <QRCodeCanvas
                  dataUrl={qrCodeDataUrl}
                  width={150}
                  height={150}
                  className="w-[150px] h-[150px]"
                />
              ) : (
                <Image
                  src={qrSrc}
                  alt="二维码"
                  width={150}
                  height={150}
                  className="w-[150px] h-[150px]"
                  priority
                />
              )}
            </div>
            <div className="text-slate-700 text-base font-medium">扫码注册</div>
          </div>
        </div>

        {/* 右上角日期标签 */}
        <div className="absolute right-8 top-6 z-30 text-slate-700 text-base select-none">
          {todayLabel}
        </div>
      </div>
    );
  },
);

ShareCard.displayName = "ShareCard";
