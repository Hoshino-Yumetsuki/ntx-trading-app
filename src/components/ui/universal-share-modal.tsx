"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type ComponentType,
  cloneElement,
  isValidElement,
} from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Download, Share2, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";
import jsqr from "jsqr";
import { useLanguage } from "@/src/contexts/language-context";

export interface ShareData {
  title: string;
  text: string;
  url: string;
  qrCodeUrl?: string;
  fullText?: string;
}

export interface ShareAction {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

interface UniversalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  shareData: ShareData;
  imageGenerator?: (node: HTMLDivElement | null) => Promise<string | null>;
  posterComponent?: React.ReactElement;
  showImagePreview?: boolean;
  customActions?: ShareAction[];
  showDefaultShareButtons?: boolean;
  showCopyLinkButton?: boolean;
  onQrOverride?: (text: string) => void;
  showCustomQrUpload?: boolean;
  onShare?: () => void;
}

const useQrCodeScanner = (onQrScanSuccess: (text: string) => void, t: (key: string) => string) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        await img.decode();

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("无法获取 canvas 上下文");

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsqr(imageData.data, imageData.width, imageData.height);

        if (result?.data) {
          onQrScanSuccess(result.data);
          toast.success(t('profile.share.qrScanned'), {
            description: t('profile.share.qrScannedDesc'),
          });
        } else {
          toast.error(t('profile.share.scanFailed'), {
            description: t('profile.share.qrNotFound'),
          });
        }
      } catch (error) {
        console.error("二维码识别异常:", error);
        toast.error(t('profile.share.scanFailed'), {
          description: t('profile.share.scanError'),
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onQrScanSuccess, t],
  );

  return { fileInputRef, triggerUpload, handleFileChange };
};

const toPlainText = (formattedText: string): string => {
  if (!formattedText) return "";

  let text = formattedText;

  try {
    if (typeof document !== "undefined") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;
      text = tempDiv.textContent || tempDiv.innerText || "";
    } else {
      text = text.replace(/<[^>]*>?/gm, "");
    }
  } catch (e) {
    text = text.replace(/<[^>]*>?/gm, "");
  }

  text = text
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^(-{3,}|\*{3,}|_{3,})\s*$/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/(\*\*|__|\*|_|~~)(.*?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1");

  text = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
};


export function UniversalShareModal({
  isOpen,
  onClose,
  title,
  shareData,
  imageGenerator,
  posterComponent,
  showImagePreview = true,
  customActions = [],
  showDefaultShareButtons = true,
  showCopyLinkButton = true,
  onQrOverride,
  showCustomQrUpload = true,
  onShare,
}: UniversalShareModalProps) {
  const { t } = useLanguage();
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const [previewContainerHeight, setPreviewContainerHeight] = useState(400);

  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;

    let isIOSDevice =
      /iPad|iPhone|iPod/.test(platform) ||
      (platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (!isIOSDevice) {
      isIOSDevice = /iPhone|iPad|iPod/.test(userAgent);
    }

    setIsIOS(isIOSDevice);
  }, []);

  const downloadImage = useCallback(
    (imageToDownload: string, sharePayload: ShareData) => {
      if (!imageToDownload) {
        toast.error("图片尚未生成", {
          description: "请稍后再试",
        });
        return;
      }

      if (isIOS) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>分享海报</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
                <style>
                  body { margin: 0; background-color: #F0F8FF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 100vh; padding: 20px; box-sizing: border-box; }
                  .poster-container { width: 100%; text-align: center; }
                  .poster { max-width: 100%; height: auto; max-height: 70vh; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
                  .actions-container { width: 100%; max-width: 380px; padding: 15px 0; }
                  .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
                  button { display: flex; align-items: center; justify-content: center; gap: 8px; background-color: #ffffff; color: #007aff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; -webkit-appearance: none; transition: background-color 0.2s, transform 0.1s; }
                  button:active { transform: scale(0.97); background-color: #f0f0f0; }
                  button.primary { background-color: #007aff; color: white; border: none; }
                  .tip { color: #8a8a8e; font-size: 15px; text-align: center; margin-top: 25px; }
                </style>
              </head>
              <body>
                <div class="poster-container">
                  <img src="${imageToDownload}" alt="分享海报" class="poster">
                </div>

                <div class="actions-container">
                  <p class="tip">如果要保存到相册，请长按图片，选择“保存图片”</p>
                    <div class="actions">
                        <a id="downloadLink" href="${imageToDownload}" download="${sharePayload.title}.png" style="text-decoration: none;">
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                <span>下载图片</span>
                            </button>
                        </a>
                        <button class="primary" onclick="shareImage()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            <span>分享海报</span>
                        </button>
                    </div>
                </div>

                <script>
                  async function shareImage() {
                    const dataUrl = "${imageToDownload}";
                    const title = \`${sharePayload.title.replace(/`/g, "\\`")}\`;
                    const text = \`${sharePayload.text.replace(/`/g, "\\`")}\`;

                    try {
                      const response = await fetch(dataUrl);
                      const blob = await response.blob();
                      const file = new File([blob], title + '.png', { type: blob.type });

                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          files: [file],
                          title: title,
                          text: text,
                        });
                      } else {
                        alert('您的浏览器不支持分享文件，请长按图片保存。');
                      }
                    } catch (err) {
                      console.error('分享失败:', err);
                      alert('分享失败，您可以尝试长按图片进行保存。');
                    }
                  }
                </script>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        const link = document.createElement("a");
        link.href = imageToDownload;
        link.download = `${sharePayload.title}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('profile.share.downloadSuccess'), {
          description: t('profile.share.imageSaved'),
        });
      }
    },
    [isIOS, t],
  );

  useEffect(() => {
    if (isOpen && posterRef.current) {
      const posterElement = posterRef.current;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const fullHeight = entry.target.scrollHeight;
          setPreviewContainerHeight(fullHeight * 0.5);
        }
      });
      observer.observe(posterElement);
      return () => {
        observer.disconnect();
      };
    }
  }, [isOpen, posterComponent]);

  const handleGenerateAndSave = useCallback(async () => {
    if (generatedImage) {
      downloadImage(generatedImage, shareData);
      return;
    }

    if (!imageGenerator) return;
    setIsGenerating(true);
    try {
      const imageDataUrl = await imageGenerator(posterRef.current);
      if (imageDataUrl) {
        setGeneratedImage(imageDataUrl);
        downloadImage(imageDataUrl, shareData);
      } else {
        toast.error(t('profile.share.generateFailed'), {
          description: t('profile.share.cannotGenerate'),
        });
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error(t('profile.share.generateFailed'), {
        description: t('profile.share.cannotGenerate'),
      });
    } finally {
      setIsGenerating(false);
    }
  }, [imageGenerator, generatedImage, downloadImage, shareData, t]);

  useEffect(() => {
    if (isOpen) {
      setGeneratedImage("");
    }
  }, [isOpen]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareData.url);
    toast.success(t('profile.copy.success'), {
      description: t('profile.share.linkCopied'),
    });
  };

  const onQrScanSuccess = useCallback(
    (qrText: string) => {
      onQrOverride?.(qrText);
    },
    [onQrOverride],
  );

  const restoreDefaultQr = () => {
    onQrOverride?.("");
    toast.success(t('profile.share.qrRestored'));
  };

  const { fileInputRef, triggerUpload, handleFileChange } =
    useQrCodeScanner(onQrScanSuccess, t);

  const posterWithRef =
    posterComponent && isValidElement(posterComponent)
      ? cloneElement(
          posterComponent as React.ReactElement<{
            ref: React.Ref<HTMLDivElement>;
          }>,
          { ref: posterRef },
        )
      : null;

  const buildSharePayload = useCallback(() => {
    const rawTitle = (shareData.title || "").trim();
    const rawContent = (shareData.fullText || shareData.text || "").trim();
    const plainTextContent = toPlainText(rawContent);

    return {
      title: rawTitle || document.title || "",
      text: plainTextContent,
      url: shareData.url,
    };
  }, [shareData.title, shareData.text, shareData.fullText, shareData.url]);

  const shareToTelegram = () => {
    onShare?.();
    const payload = buildSharePayload();
    const shareText = `${payload.title}\n\n${payload.text}\n${payload.url}`;
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, "_blank");
  };

  const shareToTwitter = () => {
    onShare?.();
    const payload = buildSharePayload();
    const shareText = `${payload.title}\n\n${payload.text}\n${payload.url}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, "_blank");
  };

  const shareToWhatsApp = () => {
    onShare?.();
    const payload = buildSharePayload();
    const shareText = `${payload.title}\n\n${payload.text}\n${payload.url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, "_blank");
  };

  const shareNative = async () => {
    onShare?.();
    const shareDataPayload = buildSharePayload();
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareDataPayload.title,
          text: `${shareDataPayload.title}\n\n${shareDataPayload.text}\n\n${shareDataPayload.url}`,
        });
      } else {
        copyLink();
      }
    } catch (error) {
      console.error("分享失败:", error);
      copyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {posterWithRef && showImagePreview && (
            <div className="relative p-4 bg-gray-100 rounded-lg overflow-hidden flex justify-center items-center">
              <div
                style={{
                  width: "300px",
                  height: `${previewContainerHeight}px`,
                  position: "relative",
                  transition: "height 0.2s ease-in-out",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                  }}
                >
                  {posterWithRef}
                </div>
              </div>

              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="mt-2 text-sm text-slate-600">
                    {t('profile.share.generatingHD')}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {showImagePreview && (
              <Button
                onClick={handleGenerateAndSave}
                disabled={isGenerating}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? t('profile.share.generating') : t('profile.share.savePoster')}
              </Button>
            )}

            {showCopyLinkButton && (
              <Button variant="outline" onClick={copyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                {t('profile.share.copyLink')}
              </Button>
            )}

            {customActions.length > 0 && (
              <div className="space-y-2">
                {customActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      onClick={action.onClick}
                      className={action.className || "w-full"}
                    >
                      {IconComponent && (
                        <IconComponent className="w-4 h-4 mr-2" />
                      )}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {showDefaultShareButtons && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">{t('profile.share.shareTo')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareToTelegram}
                    className="flex items-center justify-center"
                  >
                    <NextImage
                      src="/telegram.png"
                      alt="Telegram"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareToTwitter}
                    className="flex items-center justify-center"
                  >
                    <NextImage
                      src="/twitter.png"
                      alt="X"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    X
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={shareNative}
                    className="flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('profile.share.more')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {showCustomQrUpload && onQrOverride && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={triggerUpload}
                    className="w-full"
                  >
                    {t('profile.share.uploadCustomQr')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={restoreDefaultQr}
                  >
                    {t('profile.share.restoreDefault')}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('profile.share.qrUploadTip')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}