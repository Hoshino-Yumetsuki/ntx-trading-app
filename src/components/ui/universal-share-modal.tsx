'use client'

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type FC,
  type ComponentType
} from 'react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/src/components/ui/dialog'
import { Download, Share2, Copy } from 'lucide-react'
import { toast } from '@/src/hooks/use-toast'
import NextImage from 'next/image'
import QRCode from 'qrcode'
import jsqr from 'jsqr'

// --- 接口定义 ---
export interface ShareData {
  title: string
  text: string
  url: string
  qrCodeUrl?: string
}

export interface ShareAction {
  label: string
  icon?: ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

interface UniversalShareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  shareData: ShareData
  imageGenerator?: () => Promise<string | null>
  showImagePreview?: boolean
  customActions?: ShareAction[]
  showDefaultShareButtons?: boolean
  showCopyLinkButton?: boolean
  onQrOverride?: (text: string) => void
  showCustomQrUpload?: boolean
}


// ######################################################################
// ### 1. 内部子组件定义 (Internal Sub-components) ###
// ######################################################################

interface ShareImagePreviewProps {
  isGenerating: boolean
  generatedImage: string
  onRegenerate: () => void
}

const ShareImagePreview: FC<ShareImagePreviewProps> = ({ isGenerating, generatedImage, onRegenerate }) => (
  <div className="bg-gray-50 rounded-lg p-4 text-center min-h-[150px] flex items-center justify-center">
    {isGenerating ? (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-sm text-gray-500">正在生成分享图片...</p>
      </div>
    ) : generatedImage ? (
      <div className="relative">
        <NextImage
          src={generatedImage}
          alt="分享预览"
          width={300}
          height={400}
          className="rounded-lg shadow-lg mx-auto w-auto h-auto max-w-full max-h-[500px] object-contain"
          unoptimized
        />
        <p className="text-xs text-gray-500 mt-2">分享图片预览</p>
      </div>
    ) : (
      <div className="py-8 text-gray-500 flex flex-col items-center gap-3">
        <p className="text-sm">生成图片失败或未生成</p>
        <Button variant="outline" onClick={onRegenerate}>重新生成</Button>
      </div>
    )}
  </div>
);


// ######################################################################
// ### 2. 内部自定义 Hook 定义 (Internal Custom Hooks) ###
// ######################################################################

/**
 * Hook: 封装图片下载、复制及 iOS 兼容逻辑
 */
const useImageActions = (generatedImage: string, title: string) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));
  }, []);

  const downloadImage = useCallback(() => {
    if (!generatedImage) return;

    if (isIOS) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<html><head><title>保存海报</title><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}img{max-width:100%;max-height:80vh;border-radius:8px;}p{margin-top:20px;font-family:-apple-system,sans-serif}</style></head><body><img src="${generatedImage}" alt="分享海报"><p><strong>请长按图片保存到相册</strong></p></body></html>`);
        newWindow.document.close();
      }
      toast({
        title: '请长按图片保存',
        description: 'iOS设备请长按图片，然后选择"添加到照片"'
      });
    } else {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: '下载成功', description: '图片已保存到本地' });
    }
  }, [generatedImage, title, isIOS]);

  const copyImage = useCallback(async () => {
    if (!generatedImage) return;
    try {
      const blob = await (await fetch(generatedImage)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast({ title: '复制成功', description: '图片已复制到剪贴板' });
    } catch (error) {
      console.error('复制失败:', error);
      toast({ title: '复制失败', description: '无法复制图片到剪贴板', variant: 'destructive' });
    }
  }, [generatedImage]);

  return { downloadImage, copyImage };
};

/**
 * Hook: 封装二维码上传和解析逻辑
 */
const useQrCodeScanner = (onQrScanSuccess: (text: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('无法获取 canvas 上下文');

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsqr(imageData.data, imageData.width, imageData.height);

      if (result?.data) {
        onQrScanSuccess(result.data);
        toast({ title: '二维码识别成功', description: '将使用自定义二维码内容' });
      } else {
        toast({ title: '识别失败', description: '未能识别到二维码', variant: 'destructive' });
      }
    } catch (error) {
      console.error('二维码识别异常:', error);
      toast({ title: '识别失败', description: '处理图片时发生错误', variant: 'destructive' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onQrScanSuccess]);

  return { fileInputRef, triggerUpload, handleFileChange };
};


// ######################################################################
// ### 3. 主组件实现 (Main Component Implementation) ###
// ######################################################################

export function UniversalShareModal({
  isOpen,
  onClose,
  title,
  shareData,
  imageGenerator,
  showImagePreview = false,
  customActions = [],
  showDefaultShareButtons = true,
  showCopyLinkButton = true,
  onQrOverride,
  showCustomQrUpload = true
}: UniversalShareModalProps) {
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 逻辑处理 (Logic Handling) ---
  const generateImage = useCallback(async () => {
    if (!imageGenerator) return;
    setIsGenerating(true);
    try {
      const imageDataUrl = await imageGenerator();
      setGeneratedImage(imageDataUrl || '');
    } catch (error) {
      console.error('生成图片失败:', error);
      setGeneratedImage('');
      toast({ title: '生成失败', description: '无法生成分享图片', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [imageGenerator]);

  const onQrScanSuccess = useCallback((qrText: string) => {
    onQrOverride?.(qrText);
    if (showImagePreview) generateImage();
  }, [onQrOverride, showImagePreview, generateImage]);

  const restoreDefaultQr = () => {
    onQrOverride?.('');
    toast({ title: '已还原默认二维码' });
    if (showImagePreview) generateImage();
  };

  // --- 调用内部 Hooks (Using Internal Hooks) ---
  const { downloadImage, copyImage } = useImageActions(generatedImage, shareData.title);
  const { fileInputRef, triggerUpload, handleFileChange } = useQrCodeScanner(onQrScanSuccess);

  // --- Effect 管理 ---
  useEffect(() => {
    if (isOpen) {
      setGeneratedImage('');
      if (showImagePreview) {
        generateImage();
      }
    }
  }, [isOpen, showImagePreview, generateImage]);


  // --- 分享动作 (Share Actions) ---
  const copyLink = () => {
    navigator.clipboard.writeText(shareData.url);
    toast({ title: '复制成功', description: '链接已复制到剪贴板' });
  };

  const shareToTelegram = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  const shareToTwitter = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareData.url)}`;
    window.open(shareUrl, '_blank');
  };

  const shareToWhatsApp = () => {
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  const shareNative = async () => {
    const shareDataPayload = {
      title: shareData.title,
      text: shareData.text,
      url: shareData.url
    };
    try {
      if (navigator.share) {
        await navigator.share(shareDataPayload);
      } else {
        copyLink();
      }
    } catch (error) {
      console.error('分享失败:', error);
      copyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        <div className="space-y-4">
          
          {showImagePreview && (
            <ShareImagePreview
              isGenerating={isGenerating}
              generatedImage={generatedImage}
              onRegenerate={generateImage}
            />
          )}

          {showCustomQrUpload && onQrOverride && (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={triggerUpload} className="w-full">上传自定义二维码</Button>
                    <Button variant="ghost" className="w-full" onClick={restoreDefaultQr}>还原默认</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    提示：可上传包含二维码的图片，系统会自动解析并替换分享图中的二维码指向。
                  </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {showImagePreview && generatedImage && (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={downloadImage} variant="outline" className="flex items-center justify-center"><Download className="w-4 h-4 mr-2" />保存图片</Button>
                <Button onClick={copyImage} variant="outline" className="flex items-center justify-center"><Copy className="w-4 h-4 mr-2" />复制图片</Button>
              </div>
            )}

            {showCopyLinkButton && (
              <Button variant="outline" onClick={copyLink} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                复制链接
              </Button>
            )}

            {customActions.length > 0 && (
              <div className="space-y-2">
                {customActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      onClick={action.onClick}
                      className={action.className || 'w-full'}
                    >
                      {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}

            {showDefaultShareButtons && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">分享到</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={shareToTelegram} className="flex items-center justify-center"><Share2 className="w-4 h-4 mr-2" />Telegram</Button>
                  <Button variant="outline" onClick={shareToTwitter} className="flex items-center justify-center"><Share2 className="w-4 h-4 mr-2" />X</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={shareToWhatsApp} className="flex items-center justify-center"><Share2 className="w-4 h-4 mr-2" />WhatsApp</Button>
                  <Button variant="outline" onClick={shareNative} className="flex items-center justify-center"><Share2 className="w-4 h-4 mr-2" />更多</Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}