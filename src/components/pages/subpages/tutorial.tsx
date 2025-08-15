'use client'

import { Button } from '@/src/components/ui/button'
import Image from 'next/image'
import { useLanguage } from '@/src/contexts/language-context'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/src/components/ui/card'
import {
  ArrowLeft,
  BookOpen,
  Users,
  TrendingUp,
  Wallet,
  GraduationCap,
  Target,
  Coins,
  Shield,
  Heart,
  Building
} from 'lucide-react'

interface TutorialPageProps {
  onBack: () => void
}

export function TutorialPage({ onBack }: TutorialPageProps) {
  const { t } = useLanguage()
  const tutorialSections = [
    {
      id: 'overview',
      title: t('tutorial.overview.title'),
      icon: <Building className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.overview.content')
    },
    {
      id: 'audience',
      title: t('tutorial.audience.title'),
      icon: <Users className="w-6 h-6 text-purple-600" />,
      content: t('tutorial.audience.content')
    },
    {
      id: 'account-setup',
      title: t('tutorial.account.title'),
      icon: <Wallet className="w-6 h-6 text-green-600" />,
      content: t('tutorial.account.content')
    },
    {
      id: 'mining-mechanism',
      title: t('tutorial.mining.title'),
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
      content: t('tutorial.mining.content')
    },
    {
      id: 'rebate-structure',
      title: t('tutorial.rebate.title'),
      icon: <Coins className="w-6 h-6 text-amber-600" />,
      content: t('tutorial.rebate.content'),
      images: [
        '/introduction/1.png',
        '/introduction/2.png',
        '/introduction/3.png'
      ]
    },
    {
      id: 'staking-dividends',
      title: t('tutorial.staking.title'),
      icon: <Shield className="w-6 h-6 text-cyan-600" />,
      content: t('tutorial.staking.content')
    },
    {
      id: 'community-governance',
      title: t('tutorial.governance.title'),
      icon: <Heart className="w-6 h-6 text-pink-600" />,
      content: t('tutorial.governance.content')
    },
    {
      id: 'academy-system',
      title: t('tutorial.academy.title'),
      icon: <GraduationCap className="w-6 h-6 text-orange-600" />,
      content: t('tutorial.academy.content')
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* 头部 */}
      <div className="px-6 py-4 flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-slate-800">{t('tutorial.title')}</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Introduction Card */}
        <Card className="glass-card border-white/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl gradient-text">
              欢迎来到 NexTrade DAO
            </CardTitle>
            <p className="text-slate-600 mt-2">
              通过交易返利、质押分红和社区治理赚取 NTX 代币
            </p>
          </CardHeader>
        </Card>

        {/* Tutorial Sections - Unified Card */}
        <Card className="glass-card border-white/50 overflow-hidden shadow-xl">
          <CardContent className="py-6">
            <div className="space-y-8">
              {tutorialSections.map((section, index) => (
                <div key={section.id}>
                  {/* 如果不是第一个部分，则添加分隔线 */}
                  {index > 0 && (
                    <div className="border-t border-slate-200/70 my-8"></div>
                  )}

                  <div className="flex items-start">
                    <div className="premium-icon w-12 h-12 rounded-xl mr-4 flex-shrink-0">
                      {section.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">
                        {section.title}
                      </h3>
                      <div className="text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                        {section.content}
                      </div>

                      {/* 图片部分 */}
                      {section.images && (
                        <div className="mt-6 space-y-4">
                          {section.images.map((image, imageIndex) => (
                            <div
                              key={imageIndex}
                              className="bg-white/30 p-2 rounded-lg shadow-sm"
                            >
                              <div className="relative w-full h-64">
                                <Image
                                  src={image}
                                  alt={`${section.title} - 图${imageIndex + 1}`}
                                  fill
                                  className="object-contain rounded-lg"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
