'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface QRCodeSVGProps {
  dataUrl: string
  width: number
  height: number
  className?: string
}

export function QRCodeSVG({
  dataUrl,
  width,
  height,
  className
}: QRCodeSVGProps) {
  const [svgString, setSvgString] = useState<string>('')
  const isIOS =
    typeof window !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream

  useEffect(() => {
    if (!isIOS || !dataUrl) return

    const convertToSVG = async () => {
      try {
        const base64Match = dataUrl.match(/^data:image\/png;base64,(.+)$/)
        if (!base64Match) {
          console.error('Invalid data URL format')
          return
        }

        const img = new window.Image()
        img.src = dataUrl

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, width, height)

        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <image href="${dataUrl}" width="${width}" height="${height}" />
          </svg>
        `
        setSvgString(svg)
      } catch (error) {
        console.error('Failed to convert QR to SVG:', error)
      }
    }

    convertToSVG()
  }, [dataUrl, width, height, isIOS])

  if (isIOS && svgString) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: svgString }}
        style={{ width, height }}
      />
    )
  }

  return (
    <Image
      src={dataUrl}
      alt="QR Code"
      width={width}
      height={height}
      className={className}
    />
  )
}
