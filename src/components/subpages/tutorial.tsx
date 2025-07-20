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
  Shield
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
      icon: <BookOpen className="w-6 h-6" />,
      content: t('tutorial.overview.content')
    },
    {
      id: 'audience',
      title: t('tutorial.audience.title'),
      icon: <Users className="w-6 h-6" />,
      content: t('tutorial.audience.content')
    },
    {
      id: 'account-setup',
      title: t('tutorial.account.title'),
      icon: <Wallet className="w-6 h-6" />,
      content: t('tutorial.account.content')
    },
    {
      id: 'mining-mechanism',
      title: t('tutorial.mining.title'),
      icon: <TrendingUp className="w-6 h-6" />,
      content: t('tutorial.mining.content')
    },
    {
      id: 'rebate-structure',
      title: t('tutorial.rebate.title'),
      icon: <Coins className="w-6 h-6" />,
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
      icon: <Shield className="w-6 h-6" />,
      content: t('tutorial.staking.content')
    },
    {
      id: 'community-governance',
      title: t('tutorial.governance.title'),
      icon: <Users className="w-6 h-6" />,
      content: t('tutorial.governance.content')
    },
    {
      id: 'academy-system',
      title: t('tutorial.academy.title'),
      icon: <GraduationCap className="w-6 h-6" />,
      content: t('tutorial.academy.content')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/20 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mr-3 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('tutorial.back')}
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  {t('tutorial.title')}
                </h1>
                <p className="text-slate-600 mb-6">{t('tutorial.subtitle')}</p>
              </div>
            </div>
            <div className="premium-icon w-10 h-10 rounded-full">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
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

        {/* Tutorial Sections */}
        <div className="space-y-4">
          {tutorialSections.map((section, _index) => (
            <Card
              key={section.id}
              className="glass-card border-white/50 overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-center">
                  <div className="premium-icon w-12 h-12 rounded-xl mr-4">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-800">
                      {section.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>

                  {section.images && (
                    <div className="mt-4 space-y-4">
                      {section.images.map((image, imageIndex) => (
                        <div key={imageIndex}>
                          <div className="relative w-full h-64">
                            <Image
                              src={image}
                              alt={`${section.title} - 图${imageIndex + 1}`}
                              fill
                              className="object-contain rounded-lg shadow-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
