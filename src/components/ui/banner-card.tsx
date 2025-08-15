'use client'

import { ReactNode } from 'react'
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
      <div className={`relative h-48 bg-gradient-to-r from-${gradientFrom} to-${gradientTo}`}>
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover opacity-80"
        />
        <div className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom}/70 to-${gradientTo}/70`} />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-white/90 text-sm mb-4 max-w-xs">
            {subtitle}
          </p>
          <Button
            onClick={onClick}
            className="bg-white text-blue-600 hover:bg-white/90 px-6 py-2 text-base font-semibold rounded-lg shadow-lg w-fit"
          >
            {buttonText}{' '}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
