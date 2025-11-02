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
  minScale?: number
  maxScale?: number
}

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

    content.style.transform = 'scale(1)'
    content.style.transformOrigin = 'top center'

    const cW = container.clientWidth
    const cH = container.clientHeight

    const contentRect = content.getBoundingClientRect()
    const _parentRect = container.getBoundingClientRect()
    const contentW = contentRect.width
    const contentH = contentRect.height

    const sW = cW / (contentW || 1)
    const sH = cH / (contentH || 1)
    let s = Math.min(sW, sH, maxScale)
    s = Math.max(s, minScale)

    setScale(s)
  }, [minScale, maxScale])

  useLayoutEffect(() => {
    measure()
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
