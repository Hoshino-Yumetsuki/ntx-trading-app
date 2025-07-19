'use client'

import { Button } from '@/src/components/ui/button'
import Image from 'next/image'
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
  const tutorialSections = [
    {
      id: 'overview',
      title: 'NexTrade DAO 概述',
      icon: <BookOpen className="w-6 h-6" />,
      content: `欢迎加入 NextTrade DAO，这是一个通过交易返利、质押分红和社区治理让你赚取 NTX 代币的连接传统金融与 Web3 的去中心化交易平台！我们旨在通过区块链技术、人工智能优化、SocialFi 激励以及现实世界资产（RWA）投资，与全球各大交易所（如 Bitget、Binance、Bybit 等）合作进行导流用户，构建透明、高效、多方共赢的交易生态。`
    },
    {
      id: 'audience',
      title: '受众群体',
      icon: <Users className="w-6 h-6" />,
      content: `• 加密货币交易新手
• 对区块链、DeFi 和 RWA 投资感兴趣的用户
• 希望通过返利和质押获得额外收益的投资者`
    },
    {
      id: 'account-setup',
      title: '1. 账户设置与交易所绑定',
      icon: <Wallet className="w-6 h-6" />,
      content: `绑定交易所账户: 点击首页导航【挖矿】，进入【交易所】页面选择并【去绑定】。然后【去注册】跳转至交易所页面完成注册（注意：必须填写 NexTrade DAO 平台的邀请码）。

获取/交易所 UID: 进入交易所个人中心页面获取 UID，然后回到 NexTrade DAO 的【交易所】页面进行绑定 UID，完成后即可实现挖矿。

创建/连接钱包: 用户连接 BSC 链兼容钱包，即可进行充币及提币等操作。`
    },
    {
      id: 'mining-mechanism',
      title: '2. 交易挖矿与返利机制',
      icon: <TrendingUp className="w-6 h-6" />,
      content: `代币产出规则:
• 代币总供应量: 30亿
• 挖矿最大产量: 21亿
• 初始每日铸币量: 383,561.64 NTX
• 每日递减量: 第1-20年通缩率 5.48%; 第21-50年通缩率 9.81%
• 铸币持续时间: 约50年

交易挖矿计算公式:
Ma = (V₀ / Vall) * M * 0.9

其中 Ma 为用户每日代币奖励, V₀ 为用户当日交易量, Vall 为平台当日总交易量, M 为平台当日代币总产量。

普通用户通过 NexTrade DAO 注册交易所账户并交易后，次日将以 NTX 代币形式获得返佣，一部分代币会分配给邀请人。`
    },
    {
      id: 'rebate-structure',
      title: '3. 返佣收益链路详解',
      icon: <Coins className="w-6 h-6" />,
      content: `以下为不同场景下的返佣收益结构图：

返佣链路图 (基础结构)
图1: 基础邀请返佣结构

返佣链路图 (经纪商结构)
图2: 以经纪商为核心的扩展结构

返佣链路图 (经纪商收益示例)
图3: 经纪商直推人收益示例`,
      images: [
        '/introduction/1.png',
        '/introduction/2.png',
        '/introduction/3.png'
      ]
    },
    {
      id: 'staking-dividends',
      title: '4. 质押与分红',
      icon: <Shield className="w-6 h-6" />,
      content: `平台提供两种质押形式：普通质押挖矿（回购 NTX 分发利息）和流动性提供者(LP)质押（在 PancakeSwap V2 中质押 USDT 和 NTX 获得加权分红），以增强市场流动性。`
    },
    {
      id: 'community-governance',
      title: '5. 社区参与与治理',
      icon: <Users className="w-6 h-6" />,
      content: `我们鼓励用户参与 SocialFi 活动和社区治理。通过在 Telegram、Discord 的活跃度可累积积分兑换奖励。消耗 NTX 可锻造 GNTX 治理代币，用于参与社区决策投票。持有 GNTX 并满足邀请条件可申请成为经纪商，享受更高返佣。`
    },
    {
      id: 'academy-system',
      title: '6. 学院系统与交易策略',
      icon: <GraduationCap className="w-6 h-6" />,
      content: `NexTrade DAO 提供专业的交易技术和营销培训，涵盖加密交易策略、Web3 营销和 RWA 投资知识。用户可通过 USDT、NTX 或 SocialFi 贡献兑换课程，旨在提升用户技能，增强平台粘性。`
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
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  NexTrade DAO 平台新手引导
                </h1>
                <p className="text-slate-600 text-sm">完整的平台使用指南</p>
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
