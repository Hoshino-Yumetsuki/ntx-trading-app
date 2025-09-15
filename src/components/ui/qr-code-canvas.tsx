"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface QRCodeCanvasProps {
  dataUrl: string;
  width: number;
  height: number;
  className?: string;
}

export function QRCodeCanvas({
  dataUrl,
  width,
  height,
  className,
}: QRCodeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isIOS =
    typeof window !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream;

  useEffect(() => {
    if (!isIOS || !canvasRef.current || !dataUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = dataUrl;
  }, [dataUrl, width, height, isIOS]);

  if (isIOS) {
    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{ width, height }}
      />
    );
  }

  return (
    <Image
      src={dataUrl}
      alt="QR Code"
      width={width}
      height={height}
      className={className}
    />
  );
}
