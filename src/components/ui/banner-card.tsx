'use client'

import Image from 'next/image'
import { Button } from '@/src/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface BannerCardProps {
  title: string
  subtitle: string
  buttonText: string
  backgroundImage: string
  gradientFrom?: string
  gradientTo?: string
  onClick: () => void
}

export function BannerCard({
  title,
  subtitle,
  buttonText,
  backgroundImage,
  gradientFrom = 'blue-600',
  gradientTo = 'purple-600',
  onClick
}: BannerCardProps) {
  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden shadow-2xl">
      <div
        className="relative h-48 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(37 99 235 / 0.7), rgb(147 51 234 / 0.7)), url(${backgroundImage})`
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/90 text-sm mb-4 max-w-xs">{subtitle}</p>
          <Button
            onClick={onClick}
            className="bg-white text-blue-600 hover:bg-white/90 px-6 py-2 text-base font-semibold rounded-lg shadow-lg w-fit"
          >
            {buttonText} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
