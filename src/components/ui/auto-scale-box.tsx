'use client'

import type React from 'react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback
} from 'react'

type AutoScaleBoxProps = {
  children: React.ReactNode
  className?: string
  /** 最小缩放，避免过小导致不可读，可按需下调 */
  minScale?: number
  /** 最大缩放，通常为 1 */
  maxScale?: number
}

/**
 * AutoScaleBox
 * - 在固定空间内对内容进行等比例缩放，避免内容被裁切。
 * - 通过 ResizeObserver 监听容器与内容尺寸变化，动态设置 scale。
 */
export function AutoScaleBox({
  children,
  className,
  minScale = 0.8,
  maxScale = 1
}: AutoScaleBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  const measure = useCallback(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    // 先复位 scale 以读取内容自然尺寸
    content.style.transform = 'scale(1)'
    content.style.transformOrigin = 'top center'

    const cW = container.clientWidth
    const cH = container.clientHeight

    // 内容的自然尺寸（不缩放）
    const contentRect = content.getBoundingClientRect()
    const _parentRect = container.getBoundingClientRect()
    // 近似还原真实内容宽高（去除父缩放影响）
    const contentW = contentRect.width
    const contentH = contentRect.height

    // 计算基于宽高的缩放比，取较小值，确保完全放入
    const sW = cW / (contentW || 1)
    const sH = cH / (contentH || 1)
    let s = Math.min(sW, sH, maxScale)
    s = Math.max(s, minScale)

    setScale(s)
  }, [minScale, maxScale])

  useLayoutEffect(() => {
    measure()
    // 监听尺寸变化
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    const ro = new ResizeObserver(() => {
      measure()
    })
    ro.observe(container)
    ro.observe(content)

    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [measure])

  // 当 scale 变化时应用
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    content.style.transform = `scale(${scale})`
    content.style.transformOrigin = 'top center'
  }, [scale])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: 'hidden' }}
    >
      <div ref={contentRef} style={{ width: '100%' }}>
        {children}
      </div>
    </div>
  )
}
