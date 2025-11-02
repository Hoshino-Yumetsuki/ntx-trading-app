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
import MarkdownIt from 'markdown-it'
import multimdTable from 'markdown-it-multimd-table'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import DOMPurify from 'dompurify'
import 'katex/dist/katex.min.css'
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Wallet,
  GraduationCap,
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
      icon: <Users className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.audience.content')
    },
    {
      id: 'account-setup',
      title: t('tutorial.account.title'),
      icon: <Wallet className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.account.content')
    },
    {
      id: 'mining-mechanism',
      title: t('tutorial.mining.title'),
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.mining.content')
    },
    {
      id: 'rebate-structure',
      title: t('tutorial.rebate.title'),
      icon: <Coins className="w-6 h-6 text-blue-600" />,
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
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.staking.content')
    },
    {
      id: 'community-governance',
      title: t('tutorial.governance.title'),
      icon: <Heart className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.governance.content')
    },
    {
      id: 'academy-system',
      title: t('tutorial.academy.title'),
      icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
      content: t('tutorial.academy.content')
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-12 pb-2 relative z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="relative w-28 h-9 md:w-32 md:h-10">
            <Image
              src="/Frame17@3x.png"
              alt="NTX Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="relative mb-6 rounded-2xl overflow-visible">
          <div className="relative h-32">
            <div className="relative z-10 h-full flex items-center pl-4 pr-48 md:pr-56">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">
                  {t('tutorial.title') || '新手教程'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {t('tutorial.subtitle') || '快速了解与上手指南'}
                </p>
              </div>
            </div>
            <div className="absolute -right-2 md:-right-3 top-1/2 -translate-y-1/2 w-56 h-56 md:w-64 md:h-64 z-0 pointer-events-none">
              <Image
                src="/Group34406@3x.png"
                alt="Tutorial Header"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card className="glass-card border-white/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Image
                src="/Frame48@3x.png"
                alt="Welcome Icon"
                fill
                className="object-contain"
                priority
              />
            </div>
            <CardTitle className="text-2xl font-semibold text-blue-600">
              欢迎来到 NexTrade DAO
            </CardTitle>
            <p className="text-slate-600 mt-2">
              全球首家一站式Web3返佣创业服务平台
            </p>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          {tutorialSections.map((section) => (
            <Card
              key={section.id}
              className="glass-card border-white/50 overflow-hidden shadow-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">{section.icon}</div>
                  <CardTitle className="text-lg font-semibold text-blue-600">
                    {section.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  {(() => {
                    const md = new MarkdownIt({
                      html: true,
                      linkify: true,
                      typographer: true,
                      breaks: true
                    })
                      .use(multimdTable, {
                        multiline: true,
                        rowspan: true,
                        headerless: true
                      })
                      .use(texmath, {
                        engine: katex,
                        delimiters: ['dollars', 'bracks'],
                        katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
                      })

                    const html = md.render(section.content || '')
                    const safe = DOMPurify.sanitize(html)

                    return (
                      <div
                        dangerouslySetInnerHTML={{ __html: safe }}
                      />
                    )
                  })()}
                </div>

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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
