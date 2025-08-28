'use client'

import { useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import type { UserInfo } from '@/src/types/user'

// --- 步骤 1: 提取独立的辅助函数，减少重复代码 ---

/**
 * 在 Canvas 2D 上下文中绘制一个圆角矩形路径
 * @param ctx - CanvasRenderingContext2D
 * @param x - 起始点 x 坐标
 * @param y - 起始点 y 坐标
 * @param width - 宽度
 * @param height - 高度
 * @param radius - 圆角半径
 */
function createRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 加载图片资源
 * @param src - 图片路径
 * @returns Promise<HTMLImageElement>
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// --- 步骤 2: 将所有绘制逻辑封装到一个核心函数中 ---

/**
 * 在给定的 Canvas 上绘制邀请分享图
 * @param canvas - HTMLCanvasElement
 * @param userInfo - 用户信息
 */
async function drawInviteImageOnCanvas(
  canvas: HTMLCanvasElement,
  userInfo: UserInfo
): Promise<string> {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法获取 Canvas 2D 上下文')
  }

  // 1. 设置画布尺寸
  canvas.width = 600
  canvas.height = 800

  // 2. 绘制背景
  try {
    const bgImg = await loadImage('/分享-bg.png')
    const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height)
    const dw = bgImg.width * scale
    const dh = bgImg.height * scale
    ctx.drawImage(bgImg, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh)
  } catch (err) {
    console.error('背景图加载失败，使用纯色背景', err)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // 3. 绘制 Logo
  try {
    const logoImg = await loadImage('/ntx_1_1.jpg')
    const logoSize = 84
    const logoX = (canvas.width - logoSize) / 2
    const logoY = 60
    const r = 16

    ctx.save()
    createRoundedRectPath(ctx, logoX, logoY, logoSize, logoSize, r)
    ctx.clip()
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
    ctx.restore()

    // 绘制边框
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    createRoundedRectPath(ctx, logoX, logoY, logoSize, logoSize, r)
    ctx.stroke()
  } catch (err) {
    console.error('Logo 加载失败，绘制文字兜底', err)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('NTX', canvas.width / 2, 150)
  }

  // 4. 绘制主副标题
  ctx.textAlign = 'center'
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 28px Arial'
  ctx.fillText('注册 NTX DAO，连接用户聚合资源，', canvas.width / 2, 200)
  ctx.fillText('挖掘你的 Web3 机会', canvas.width / 2, 240)
  ctx.fillStyle = '#374151'
  ctx.font = '16px Arial'
  ctx.fillText('享受高达60%手续费返佣和挖矿交易', canvas.width / 2, 280)
  
  // 5. 绘制中部 Banner (使用 Hook 版本中的新图)
  try {
    const bannerImg = await loadImage('/share_p1.png') // 统一使用新版图片
    const bannerW = 243
    const bannerH = 244
    const bannerX = (canvas.width - bannerW) / 2
    const bannerY = 320
    const scale = Math.min(bannerW / bannerImg.width, bannerH / bannerImg.height)
    const drawW = bannerImg.width * scale
    const drawH = bannerImg.height * scale
    const drawX = bannerX + (bannerW - drawW) / 2
    const drawY = bannerY + (bannerH - drawH) / 2
    ctx.drawImage(bannerImg, drawX, drawY, drawW, drawH)
  } catch(err) {
    console.error('中部 Banner 加载失败', err)
  }

  // 6. 绘制底部信息卡片
  const cardX = 30
  const cardY = 560
  const cardW = canvas.width - 60
  const cardH = 190
  const cardR = 16
  ctx.fillStyle = '#2563eb'
  createRoundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR)
  ctx.fill()
  
  // 绘制卡片内文字
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.font = '20px Arial'
  ctx.fillText('扫描二维码, 注册 NTX DAO', cardX + 80, cardY + 80)
  ctx.font = 'bold 30px Arial'
  ctx.fillText(
    `邀请码： ${String(userInfo.myInviteCode).toUpperCase()}`,
    cardX + 54,
    cardY + 120
  )

  // 7. 生成并绘制二维码
  const baseUrl = window.location.origin || process.env.NEXT_PUBLIC_BASE_URL || ''
  const inviteUrl = `${baseUrl}/register?invite=${userInfo.myInviteCode}`
  const qrDataUrl = await QRCode.toDataURL(inviteUrl, {
    width: 200,
    margin: 2,
    color: { dark: '#1e40af', light: '#ffffff' }
  })
  const qrImg = await loadImage(qrDataUrl)

  const qrSize = 120
  const qrPadding = 6
  const qrWrapperSize = qrSize + qrPadding * 2
  const qrX = cardX + cardW - 24 - qrWrapperSize
  const qrY = cardY + (cardH - qrWrapperSize) / 2
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(qrX, qrY, qrWrapperSize, qrWrapperSize)
  ctx.drawImage(qrImg, qrX + qrPadding, qrY + qrPadding, qrSize, qrSize)

  // 8. 返回最终的图片 Data URL
  return canvas.toDataURL('image/png', 0.9)
}

// --- 步骤 3: 提供一个干净、统一的 Hook ---

/**
 * 用于生成邀请分享图的 Hook
 * @param userInfo - 用户信息
 */
export function useInviteImageGenerator(userInfo: UserInfo | null) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!canvasRef.current || !userInfo?.myInviteCode) {
      console.error('生成图片的前置条件不足：Canvas 未渲染或用户信息不完整')
      return null
    }

    try {
      return await drawInviteImageOnCanvas(canvasRef.current, userInfo)
    } catch (error) {
      console.error('生成邀请分享图片失败:', error)
      return null // 也可以向上抛出错误，让调用者处理
    }
  }, [userInfo])
  
  // 返回一个需要被渲染的、隐藏的 Canvas 组件
  const InviteCanvas = useCallback(() => {
    // 如果没有用户信息，则无需渲染 canvas，以节省资源
    if (!userInfo) return null;
    
    return (
      <div className="fixed -top-[9999px] left-0 pointer-events-none" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
    );
  }, [userInfo]);


  return { generateImage, InviteCanvas }
}